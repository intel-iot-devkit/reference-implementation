import {CONST} from '../consts.js'

class SettingsService {
  constructor() {
    
  }

  updateSetting(settingId, low, high) {
    //get saved settings
    let settings = this.loadSettings()

    //update the setting
    let setting = settings.find(setting => setting.id === settingId)
    setting.low = low
    setting.high = high

    //save settings to local storage
    localStorage.setItem('settings', JSON.stringify(settings))
  }

  loadSettings() {
    //check for existing settings
    let settings = localStorage.getItem('settings')

    if(settings) {
      //if settings exist, return them as object
      return JSON.parse(settings)
    } else {
      //if they dont exist, create default settings
      return CONST.defaultSettings
    }
  }

  restoreDefaults() {
    localStorage.setItem('settings', JSON.stringify(CONST.defaultSettings))
  }
}

export default SettingsService