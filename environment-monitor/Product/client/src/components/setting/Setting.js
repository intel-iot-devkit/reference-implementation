import angular from 'angular'
import template from './Setting.html'
import SettingsService from '../../services/SettingsService.js'
import './Setting.css'

let Setting = angular.module('setting', [])
  .component('setting', {
      bindings: {
        sensor: '<',
        settings: '<'
      },
      template,
      controller: ['SettingsService', function(SettingsService) {
        var ctrl = this

        function updateView() {
          ctrl.low = ctrl.settings.low
          ctrl.high = ctrl.settings.high

          //set starting values
          ctrl.setMeter()
        }

        ctrl.validateKey = function(e) {
          if (
            (e.keyCode >= 48 && e.keyCode <= 57) || 
            (e.keyCode >= 96 && e.keyCode <= 105) || 
            (e.keyCode >= 37 && e.keyCode <= 40) ||
            e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 17 || e.keyCode === 18 || e.keyCode === 91
          ) { 
            //valid 0-9 or control key
          } else {
            //invalid key pressed
            e.preventDefault()
            return
          }
        }

        ctrl.setMeter = function() {
          if(Number(ctrl.high) < Number(ctrl.low) || Number(ctrl.high) > ctrl.sensor.max) {
            //high value is lower than low value error
            ctrl.highError = true
          } else if(Number(ctrl.low) < ctrl.sensor.min) {
            //low value is lower than minimum error
            ctrl.lowError = true
          } else {
            //no errors, update value
            ctrl.highError = false
            ctrl.lowError = false
            ctrl.meterTop = 100 - (Number(ctrl.high) / ctrl.sensor.max * 100)
            ctrl.valueHeight = (Number(ctrl.high) - Number(ctrl.low)) / (ctrl.sensor.max - ctrl.sensor.min) * 100

            //save
            SettingsService.updateSetting(ctrl.sensor.id, ctrl.low, ctrl.high)
          }
        }

        ctrl.$onInit = updateView
        ctrl.$onChanges = updateView
      }]
  }).name

export default Setting