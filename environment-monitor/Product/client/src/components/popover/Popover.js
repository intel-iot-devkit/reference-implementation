import angular from 'angular'
import template from './Popover.html'
import './Popover.css'

let Popover = angular.module('popover', [])
  .component('popover', {
      bindings: {
        info: '<'
      },
      template,
      controller: [function() {
        var ctrl = this;

        ctrl.$onInit = function() {
          
        }
      }]
  }).name

export default Popover