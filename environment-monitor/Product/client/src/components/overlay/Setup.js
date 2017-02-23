import angular from 'angular'
import template from './Setup.html'
import SettingsService from '../../services/SettingsService.js'
import {CONST} from '../../consts.js'
import './Overlay.css'
import './Setup.css'

let Setup = angular.module('setup', [])
  .component('setup', {
      bindings: {
        close: '<',
        sensors: '<'
      },
      template,
      controller: ['SettingsService', function(SettingsService) {
        var ctrl = this;

        ctrl.showResets = CONST.showResets
        ctrl.settings = SettingsService.loadSettings()


        //revert to default settings
        ctrl.restoreDefaults = function() {
          SettingsService.restoreDefaults()
          ctrl.settings = angular.copy(CONST.defaultSettings)
        }
      }]
  }).name

export default Setup