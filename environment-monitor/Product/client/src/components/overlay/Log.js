import angular from 'angular'
import moment from 'moment'
import template from './Log.html'
import {CONST} from '../../consts.js'
import './Overlay.css'
import './Log.css'

let Log = angular.module('log', [])
  .component('log', {
      bindings: {
        close: '<',
        alerts: '<'
      },
      template,
      controller: [function() {
        let ctrl = this;

        ctrl.times = CONST.logTimes
        ctrl.showResets = CONST.showResets

        ctrl.$onChanges = function() {
          //only update if alerts available
          if(!ctrl.alerts) return

          //loop through events, assign percent of day for positioning
          ctrl.alerts.map(sensor => {
            sensor.alerts.map(a => {
              a.percentOfDay = getPercentOfDay(a.time) * 100
            })
          })
        }

        //get a formatted date
        ctrl.getDate = function() {
          return moment().format('MMM-DD-YYYY')
        }

        //revert log history back to empty default state
        ctrl.clearLog = function() {
          localStorage.setItem('alerts', JSON.stringify(CONST.defaultAlerts))
        }

        function getPercentOfDay(mom) {
          let time = mom.valueOf()
          let start = moment(time).startOf('day').valueOf()
          let end = moment(time).endOf('day').valueOf()
          
          return (time - start) / (end - start)
        }
      }]
  }).name

export default Log