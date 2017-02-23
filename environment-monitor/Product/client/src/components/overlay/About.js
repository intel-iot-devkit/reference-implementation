import angular from 'angular'
import template from './About.html'
import {CONST} from '../../consts.js'
import './Overlay.css'
import './About.css'

let About = angular.module('about', [])
  .component('about', {
      bindings: {
        close: '<'
      },
      template,
      controller: [function() {
        var ctrl = this;

        //main about copy
        ctrl.copy = CONST.content.aboutBody

        //basic sensor copy
        ctrl.items = CONST.content.aboutSensors
        
        //add sensor descriptions
        ctrl.items.map((item, i) => {
          item.desc = CONST.sensors[i].desc
          item.img = require('../../assets/img/' + item.img)
          item.imgClose = require('../../assets/img/' + item.imgClose)
        })

        ctrl.arduino = CONST.content.aboutArduino
        ctrl.arduino.img = require('../../assets/img/' + CONST.content.aboutArduino.img)

      }]
  }).name

export default About
