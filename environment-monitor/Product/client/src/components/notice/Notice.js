import angular from 'angular'
import template from './Notice.html'
import './Notice.css'

let Notice = angular.module('notice', [])
  .component('notice', {
      bindings: {
        data: '<'
      },
      template,
      controller: ['$timeout', function($timeout) {
        var ctrl = this;

        ctrl.$onInit = function() {
          $timeout(function() {
            ctrl.fadeClass = 'fade-in'
          }, 400)

          $timeout(function() {
            ctrl.fadeClass = 'fade-out'
          }, 9000)
        }
      }]
  }).name

export default Notice