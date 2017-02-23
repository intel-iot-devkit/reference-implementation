import angular from 'angular'
import AlertService from '../../services/AlertService.js'
import {CONST} from '../../consts.js'


let SensorCanvas = angular.module('sensorCanvas', [])
  .directive('sensorCanvas', ['AlertService', function(AlertService) {
    return {
      scope: {
        val: '<',
        alerts: '<'
      },
      link: function(scope, element, attr) {

        function update() {
          let ctx = element[0].getContext('2d')
      
          let valuePercent = scope.val
          let startAngle = -225
          let endAngle = startAngle + (valuePercent * 270)
          let radians = (Math.PI/180)

          let canvasWidth = window.innerWidth < 1180 ? 170 : 200
          let shadowSize = 10
          let hCanvasWidth = canvasWidth / 2
          let lineWidth = window.innerWidth < 1180 ? 22 : 30
          let valueRadius = hCanvasWidth - (lineWidth/2)

          //detect screen dpi
          let devicePixelRatio = window.devicePixelRatio || 1
          let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                              ctx.mozBackingStorePixelRatio ||
                              ctx.msBackingStorePixelRatio ||
                              ctx.oBackingStorePixelRatio ||
                              ctx.backingStorePixelRatio || 1

          let ratio = devicePixelRatio / backingStoreRatio

          //set canvas size
          element[0].width = (canvasWidth + shadowSize) * ratio;
          element[0].height = (canvasWidth + shadowSize) * ratio;

          //scale canvas for retina if needed
          /*if(ratio >= 1.95) {
            ctx.scale(2,2)
          }*/

          ctx.scale(ratio, ratio)

          //default track colors
          let valueColor = '#0071c5'
          let trackColor = '#f3f3f3'
          
          if(scope.alerts) {
            //only look for alerts from the last (CONST.dataDelay) seconds
            let activeAlerts = AlertService.getActiveAlerts(scope.alerts)

            //alert track colors
            if(activeAlerts.length > 0) {
              valueColor = '#fc4c02'
              trackColor = '#feb799'
            }
          }

          //draw backgound
          ctx.beginPath()
          ctx.arc(hCanvasWidth, hCanvasWidth, hCanvasWidth - lineWidth, 0, 2 * Math.PI, false)
          ctx.fillStyle = '#ffffff'
          ctx.fill()

          //draw track
          ctx.save()
          ctx.beginPath()
          ctx.strokeStyle = trackColor
          ctx.lineWidth = lineWidth
          ctx.arc(hCanvasWidth, hCanvasWidth, hCanvasWidth - (lineWidth/2), startAngle * radians, (startAngle + 270) * radians)
          ctx.shadowColor = 'rgba(0, 0, 0, 0.14)'
          ctx.shadowBlur = 10
          ctx.shadowOffsetX = 3
          ctx.shadowOffsetY = 3
          ctx.stroke()

          //draw value
          ctx.restore()
          ctx.beginPath()
          ctx.strokeStyle = valueColor
          ctx.lineWidth = lineWidth
          ctx.arc(hCanvasWidth, hCanvasWidth, hCanvasWidth - (lineWidth/2), startAngle * radians, endAngle * radians)
          ctx.stroke()

          //draw value rounded bit
          let x = hCanvasWidth + (hCanvasWidth - lineWidth/2) * Math.cos((360 + endAngle) * radians)
          let y = hCanvasWidth + (hCanvasWidth - lineWidth/2) * Math.sin((360 + endAngle) * radians)
          
          ctx.beginPath()
          ctx.arc(x, y, lineWidth / 2, 0, 2 * Math.PI, false)
          ctx.fillStyle = valueColor
          ctx.fill()
        }
        
        //gets a point on an arc
        function getPoint(c1,c2,radius,angle){
          return [c1+Math.cos(angle)*radius,c2+Math.sin(angle)*radius]
        }

        //start looking for value updates
        scope.$watch('val', update)
      }
    }
  }]).name

export default SensorCanvas