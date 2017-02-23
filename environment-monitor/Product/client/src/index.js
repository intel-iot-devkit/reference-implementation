//libs
import angular from 'angular'
import moment from 'moment'
import mqtt from 'mqtt'

//constants
import {CONST} from './consts.js'

//services
import AlertService from './services/AlertService.js'
import SettingsService from './services/SettingsService.js'
import AwsService from './services/AwsService.js'

//components
import Sensor from './components/sensor/Sensor.js'
import SensorCanvas from './components/sensor/SensorCanvas.js'
import About from './components/overlay/About.js'
import Setup from './components/overlay/Setup.js'
import Log from './components/overlay/Log.js'
import Popover from './components/popover/Popover.js'
import Notice from './components/notice/Notice.js'
import Setting from './components/setting/Setting.js'

//styles
import './index.css'

//html (so webpack knows to watch it)
import './index.html'


//app
angular.module('airquality', [
  Sensor,
  SensorCanvas,
  About,
  Setup,
  Log,
  Popover,
  Notice,
  Setting
])
.service('AlertService', AlertService)
.service('SettingsService', SettingsService)
.service('AwsService', AwsService)

//controller
angular.module('airquality').controller('AirQualityCtrl', [
  '$scope',
  '$interval',
  'AlertService',
  'SettingsService',
  'AwsService',
  function(
    $scope,
    $interval,
    AlertService,
    SettingsService,
    AwsService
  ) {

      let mqttClient
      let windowFocused = true

      //sensors
      $scope.sensors = CONST.sensors

      //notices
      $scope.notices = []

      //fake offline status
      $scope.forceOffline = false

      //no aws message
      $scope.awsUnavailable = CONST.content.awsUnavailable


      //global handler to close modals
      document.body.addEventListener('keyup', function(e) {
        if(e.keyCode === 27) {
          $scope.closeModal()
          $scope.$apply()
        }
      })

      //detect when window gains focus
      window.onfocus = function() {
        windowFocused = true
      }

      //detect when window loses focus
      window.onblur = function() {
        windowFocused = false
      }

      //set up an mqtt connection
      function connectMqtt(e) {

        let brokerUrl

        //which mqtt broker to connect to
        if(CONST.testMode) {
          brokerUrl = CONST.testMqtt
        } else if(!navigator.onLine || $scope.forceOffline) {
          brokerUrl = CONST.offlineMqtt
        } else {
          brokerUrl = AwsService.getUrl(CONST.awsHost, CONST.awsRegion, CONST.awsSecretKey, CONST.awsAccessKey)
        }

        //let the vew know online or offline
        $scope.online = navigator.onLine

        //close the connection to the old broker if one was running
        try { mqttClient.end() } catch(e) {}

        //subscribe to the broker
        mqttClient = mqtt.connect(brokerUrl)

        //on connection
        mqttClient.on('connect', () => {
          //subscribe to sensors topic
          mqttClient.subscribe(CONST.sensorTopic)
          
          //when no broker is available, publish fake data
          //this will come from the device when not in test mode
          if(CONST.testMode) {
            setInterval(generateTestPayload, CONST.alertDelay)
            
            //instant first reading
            generateTestPayload()
          }
        })

        //check if aws connection is real
        $scope.noAws = false

        if($scope.online && !$scope.forceOffline) {
          let reconnectAttempts = 0

          //if it cant connect to aws websocket 3 times, assume it is unavailable
          mqttClient.on('reconnect', () => {
            reconnectAttempts++

            if(reconnectAttempts > 2) {
              $scope.noAws = true
              $scope.$apply()
            }
          })
        }
        
        //listen for new readings
        mqttClient.on('message', parseReading);
      }


      function generateTestPayload() {
        //for test mode, only update if window is focused
        if(!windowFocused) return

        //fake readings
        let g = 1000 + Math.round(Math.random() * 100)
        let d = 40 + Math.round(Math.random() * 10)
        let t = 40 + Math.round(Math.random() * 10)
        let h = 40 + Math.round(Math.random() * 10)

        //assign values
        let payload = {"gas":g, "dust":d, "temperature":t, "humidity":h}

        //publis fake data
        mqttClient.publish(CONST.sensorTopic, JSON.stringify(payload))
      }


      //handle new readings
      function parseReading(topic, payload) {
        console.log('got something...')
        console.log(topic)
        console.log(payload.toString())

        let readings = JSON.parse(payload.toString())
        console.log(readings)
        console.log('----------------------')

        //set new values
        $scope.sensorValues = readings
        
        //get current settings
        let settings = SettingsService.loadSettings()

        //use settings to detect alerts
        for(let i=0; i<settings.length; i++) {
          for(const key in readings) {
            if(key === settings[i].id) {
              checkLimits(readings[key], settings[i], CONST.sensors[i])  
            }
          }
        }

        //update alerts
        $scope.alerts = AlertService.loadAlerts()
        
        //update angular scope
        $scope.$apply()
      }

      //check if new sensor readings trigger an alert
      function checkLimits(value, settings, sensor) {
        if(value > settings.high) {
          //high alert
          AlertService.saveAlert(sensor, CONST.alerts.high, value)
          addNotice(sensor, CONST.alerts.high, value)
        } else if(value < settings.low) {
          //low alert
          AlertService.saveAlert(sensor, CONST.alerts.low, value)
          addNotice(sensor, CONST.alerts.low, value)
        } else {
          //all good
          return false
        }
      }

      //add a new alert notice to sidebar
      function addNotice(sensor, type, value) {
        let timestamp = moment().valueOf()

        let aboutSensorInfo = CONST.content.aboutSensors.find(s => {
          return s.id === sensor.id
        })

        $scope.notices.unshift({
          time: timestamp,
          name: sensor.name + ': ' + type.toUpperCase(),
          sensorId: sensor.id,
          date: moment().format('MMM-DD-YYYY, h:mm:ss a'),
          message: sensor.name + ' reached ' + value + sensor.unit,
          img: aboutSensorInfo.img
        })
      }

      //force offline to a state
      $scope.toggleOnline = function() {
        //only allow this toggle if internet is enabled
        if(navigator.onLine) {
          $scope.forceOffline = !$scope.forceOffline
          connectMqtt()
        }
      }

      //close modals
      $scope.closeModal = function() {
        $scope.overlay = undefined
      }

      //show modals
      $scope.openModal = function(modal) {
        $scope.overlay = modal
      }

      //monitor the sidebar notices and remove older than (CONST.alertDelay) seconds
      $interval(function() {
        $scope.notices = $scope.notices.filter(notice => notice.time > moment().subtract(CONST.alertDelay / 1000, 'seconds').valueOf())
      }, CONST.alertDelay)


      //detect online/offline changes
      window.addEventListener('online',  connectMqtt)
      window.addEventListener('offline', connectMqtt)


      //initial connection
      connectMqtt()

    }
])