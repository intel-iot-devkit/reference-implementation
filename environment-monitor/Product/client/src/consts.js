
//CONFIG SETTINGS FOR AIR QUALITY
//1920x1280

//common sensor info
//these are only used for the CONST object below
let sensorInfo = {
  sensor1: {id: 'dust', name: 'Dust'},
  sensor2: {id: 'gas', name: 'Gas'},
  sensor3: {id: 'temperature', name: 'Temperature'},
  sensor4: {id: 'humidity', name: 'Humidity'}
}

//constants
export const CONST = {

  //config
  testMode:           false, //when true, this will attempt to publish through the testMqtt broker below
  showResets:         true, //the reset toggles in the setup and log overlays
  alertDelay:         10000, //milliseconds for the alerts to remain in the sidebar
  dataDelay:          30000, //milliseconds for the alerts to remain in the sidebar

  //mqtt
  testMqtt:           'ws://test.mosquitto.org:8080/mqtt', //when testMode is true
  offlineMqtt:        '', //mosquitto websocket url (via ip to gateway from client)
  onlineMqtt:         '', //aws mqtt websocket url
  sensorTopic:        'devices/nucduino101', //the mqtt topic string for sensor readings

  //aws
  awsHost:            'awsHost', //the aws instance url, 'wss://' will be prepended to this
  awsRegion:          'awsRegion', //
  awsSecretKey:       'awsSecretKey', //
  awsAccessKey:       'awsAccessKey', //

  //alert types
  alerts: {
    high:             'high', //too high id
    low:              'low' //too low id
  },

  //logs
  logTimes:           ['12am', '4am', '8am', '12pm', '4pm', '8pm', '12am'], //timeline labels in the log

  //detailed sensor info
  sensors: [
    //dust
    {
      id: sensorInfo.sensor1.id,
      name: sensorInfo.sensor1.name,
      desc: 'This sensor is used to get a good indication of the amount of particulate matter in an environment. Dust concentrations can then be used to estimate the Air Quality Index (AQI).',
      unit: 'particles/0.01 cb.ft',
      max: 30000,
      min: 0
    },
    //gas
    {
      id: sensorInfo.sensor2.id,
      name: sensorInfo.sensor2.name,
      desc: 'Used to detect high concentrations for a variety of pollutants in the environment such as H2, LPG, CH4, CO, Alcohol, Smoke or Propane.',
      unit: 'pollutant lvl',
      max: 1023,
      min: 0
    },
    //temperature
    {
      id: sensorInfo.sensor3.id,
      name: sensorInfo.sensor3.name,
      desc: 'Measures surrounding temperature. Can also be used to compensate the computations derived from the gas and dust sensors and to ensure they are within functional limits.',
      unit: 'F',
      max: 130,
      min: 0
    },
    //humidity
    {
      id: sensorInfo.sensor4.id,
      name: sensorInfo.sensor4.name,
      desc: 'Used to monitor humidity changes in the environment. Will also impact readings from the gas and dust sensors.',
      unit: '%',
      max: 100,
      min: 0
    }
  ],

  //settings structure (keys must match ids in sensors above)
  //set the default sensor thresholds here
  defaultSettings: [
    {
      id: sensorInfo.sensor1.id,
      name: sensorInfo.sensor1.name,
      high: 3000,
      low: 0
    },
    {
      id: sensorInfo.sensor2.id,
      name: sensorInfo.sensor2.name,
      high: 400,
      low: 0
    },
    {
      id: sensorInfo.sensor3.id,
      name: sensorInfo.sensor3.name,
      high: 75,
      low: 65
    },
    {
      id: sensorInfo.sensor4.id,
      name: sensorInfo.sensor4.name,
      high: 60,
      low: 30
    }
  ],

  //alert structure (keys must match ids in sensors above)
  //these alerts arrays should always remain empty
  defaultAlerts: [
    {
      id: sensorInfo.sensor1.id,
      name: sensorInfo.sensor1.name,
      alerts: []
    },
    {
      id: sensorInfo.sensor2.id,
      name: sensorInfo.sensor2.name,
      alerts: []
    },
    {
      id: sensorInfo.sensor3.id,
      name: sensorInfo.sensor3.name,
      alerts: []
    },
    {
      id: sensorInfo.sensor4.id,
      name: sensorInfo.sensor4.name,
      alerts: []
    }
  ],

  //content
  content: {
    awsUnavailable: 'Cloud service unavailable, click here for offline version',

    aboutBody: 'The Environmental Monitor IoT reference implementation demonstrates an end-to-end solution for monitoring ambient air quality.  This proof of concept uses the Grove* IoT Commercial Developer Kit, Intel® System Studio IoT Edition, Ubuntu* Server, Amazon Web Services (AWS)* and sensors.  The Intel® IoT Gateway gathers data from dust, gas, temperature, and humidity sensors for edge data analytics and monitoring.',

    aboutArduino: {
      name: 'Arduino 101',
      img: 'arduino.png',
      width: 256,
      height: 224
    },

    aboutSensors: [
      {
        id: sensorInfo.sensor1.id,
        name: 'Grove – Dust Sensor (PPD42)',
        instructions: 'Plug into D4 connector of Grove Base Shield',
        img: 'sensor-dust.png',
        imgClose: 'sensor-close-dust.jpg',
        width: 169,
        height: 148
      },
      {
        id: sensorInfo.sensor2.id,
        name: 'Grove – Gas Sensor (MQ2)',
        instructions: 'Plug into A1 connector of Grove Base Shield',
        img: 'sensor-gas.png',
        imgClose: 'sensor-close-gas.jpg',
        width: 117,
        height: 97
      },
      {
        id: sensorInfo.sensor3.id,
        name: 'Grove – Temperature & Humidity & Barometer Sensor (BME280)',
        instructions: 'Plug into any connector marked I2C of Grove Base Shield',
        img: 'sensor-temp.png',
        imgClose: 'sensor-close-temp.jpg',
        width: 56,
        height: 97
      },
      {
        id: sensorInfo.sensor4.id,
        name: 'Grove – Green LED',
        instructions: 'Plug into D2 connector of Grove Base Shield',
        img: 'sensor-led.png',
        imgClose: 'sensor-close-led.jpg',
        width: 97,
        height: 94
      }
    ]
  }
}
