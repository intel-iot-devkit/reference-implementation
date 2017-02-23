import moment from 'moment'
import {CONST} from '../consts.js'

class AlertService {
  constructor() {
    
  }

  //save any alert to local storage
  saveAlert(sensor, type, value) {
    //get past alerts from local storage
    let allAlerts = this.loadAlerts()

    //remove old alerts
    this.clearOldAlerts(allAlerts)

    //add the new alert to the correct sensor
    for(let i=0; i<allAlerts.length; i++) {
      if(allAlerts[i].id === sensor.id) {
        allAlerts[i].alerts.push({
          time: moment().valueOf(), 
          type: type, 
          value: value
        })
      }
    }

    //save alert history to local storage
    localStorage.setItem('alerts', JSON.stringify(allAlerts))
  }

  //remove old alerts from allAlerts 
  clearOldAlerts(allAlerts) {
    //the start of the day from 12:00am
    let today = moment().startOf('day').valueOf()

    //get the past alerts of the sensor that just alerted
    for(let i=0; i<allAlerts.length; i++) {
      allAlerts[i].alerts = allAlerts[i].alerts.filter(a => a.time > today)
    }
  }

  loadAlerts() {
    //check for existing settings
    let alerts = localStorage.getItem('alerts')
    
    if(alerts) {
      //if settings exist, return them as object
      return JSON.parse(alerts)
    } else {
      //if they dont exist, create default settings
      return CONST.defaultAlerts
    }
  }

  //get a sensors alerts from only the last (CONST.dataDelay) seconds
  getActiveAlerts(alerts) {
    return alerts.filter(a => a.time > moment().subtract(CONST.dataDelay / 1000, 'seconds').valueOf())
  }
}

export default AlertService