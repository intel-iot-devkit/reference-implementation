import angular from 'angular'
import AlertService from '../../services/AlertService.js'
import template from './Sensor.html'
import './Sensor.css'

let Sensor = angular.module('sensor', [])
  .component('sensor', {
      bindings: {
        data: '<',
        value: '<',
        alerts: '<'
      },
      template,
      controller: ['AlertService', function(AlertService) {
        var ctrl = this;

        ctrl.$onInit = function() {
          
        }

        ctrl.$onChanges = function() {
          //get val as percentage of range
          var range = ctrl.data.max - ctrl.data.min
          ctrl.canvasValue = ctrl.value / range

          //scale text as needed
          if(String(ctrl.value).length === 4) {
            ctrl.sensorTextSize = 'small'
          } else if(String(ctrl.value).length === 5) {
            ctrl.sensorTextSize = 'smallest'
          } else {
            ctrl.sensorTextSize = ''
          }

          //check if the sensor is in alert mode
          if(ctrl.alerts) {
            //only look for alerts from the last (CONST.dataDelay) seconds
            let activeAlerts = AlertService.getActiveAlerts(ctrl.alerts)
            //set alert mode
            ctrl.alertMode = activeAlerts.length > 0
          }
        }
      }]
  }).name

export default Sensor