var DEMO_CORE = (function(my) {
  my.routes = {
    currentReadingsUrl: "/ExpKit/getData?value=current",
    logEntriesUrl: "/ExpKit/getData?value=log",
    tempThresholdUrl: "/ExpKit/threshold",
    demoStatusUrl: "/ExpKit/demo",
  };
  my.pollFrequency = 1000;
  my.shouldPollSensors = false;
  my.sensorNames = ['temperature', 'light', 'motion'];
  my.switchNames = ['demo'];
  my.settingsDefaults = {
    time_format: 12,
    temperature_alert_threshold: 120
  };
  my.settings = {};
  my.defaultHttpMethod = 'POST';
  my.allowCaching = true;
  my.currentReadings = {};

  /*
   * Construct Server URL.
   */
  my.buildServerUrl = function(pathAndQuery) {
    var loc = window.document.location;
    return loc.protocol + "//" + loc.host + pathAndQuery;
  };

  /*
   * Return current temperature reading.
   */
  my.currentTemperature = function() {
    if (my.currentReadings.temperature != null) {
      return my.currentReadings.temperature;
    } else {
      return null;
    }
  };

  /*
   * Convert Fahrenheit temperature to Celsius.
   */
  my.fahrenheitToCelsius = function(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
  };

  /*
   * Convert Fahrenheit temperature to the preferred temperature units, with the
   * specified number of places after the decimal point.
   */
  my.fahrenheitTempToPreferredUnit = function(temp, decimalPoints) {
    if (decimalPoints == null) {
      decimalPoints = 1;
    }
    if (my.settings.temperature_units === "Celsius") {
      return my.fahrenheitToCelsius(temp).toFixed(decimalPoints);
    } else {
      return temp.toFixed(decimalPoints);
    }
  };

  /*
   * Set up timer to trigger next poll
   */
  my.scheduleNextPoll = function(pollFunction) {
    return setTimeout(pollFunction, my.pollFrequency);
  };

  /*
   * Fetch the current sensor readings and update the #data container with them
   */
  my.updateCurrentSensorReadings = function() {
    if (my.shouldPollSensors) {
      return jQuery.ajax(my.buildServerUrl(my.routes.currentReadingsUrl), {
          type: my.defaultHttpMethod,
          cache: my.allowCaching,
          dataType: 'json',
        }).
        done(function(data, textStatus, jqXhr) {
          jQuery(document).trigger('DEMO_CORE.sensors.current', [data]);
          return data;
        }).
        fail(function(jqXhr, textStatus, errorThrown) {
          console.log("Error fetching current sensor readings: " + textStatus + " / " + errorThrown);
          return jqXhr;
        }).
        always(function(dataOrJqXhr, textStatus, jqXhrOrErrorThrown) {
          // Schedule poll only after AJAX call finishes (success or failure)
          my.scheduleNextPoll(my.updateCurrentSensorReadings);
        });
    } else {
      // Set timer for next check
      my.scheduleNextPoll(my.updateCurrentSensorReadings);
    }
  };

  /*
   * Parse time from text in HH:mm format
   */
  my.parseTime = function(stampText) {
    return moment(stampText, 'HH:mm');
  };

  /*
   * Parse time from text in ISO 8601 formats
   */
  my.parseTimestamp = function(stampText) {
    return moment(stampText);
  };

  /*
   * Returns a format string for the preferred time format, optionally including
   * seconds.
   */
  my.getHourFormat = function(includeSeconds) {
    var seconds = includeSeconds ? ':ss' : '';
    if (my.settings.time_format === 12 || my.settings.time_format === "12") {
      return "h:mm" + seconds + " A";
    } else {
      return "HH:mm" + seconds;
    }
  };

  /*
   * Formats a timestamp as a string, according to the preferred hour format.
   */
  my.formatDateTime = function(date) {
    return date.format('YYYY-MM-DD ' + my.getHourFormat(true));
  };

  /*
   * Formats a time as a string, according to the preferred hour format.
   */
  my.formatTime = function(time) {
    return time.format(getHourFormat());
  };

  /*
   * Returns true if the value is true, 1, "1", "true", "yes", or "on", false
   * otherwise.
   */
  my.isTruthy = function(value) {
    return value === true || value === 1 || value === "1" || value === "true" || value === "yes" || value === "on";
  };

  /*
   * Convert timestamp format from mm/dd/[yy]yy/ to [yy]yy-mm-dd, which matches
   * ISO 8601 (though 2-digit years are only allowed in 8601:2000, but not the
   * newer 8601:2004 spec).
   */
  my.fixupTimestamp = function(stampText) {
    return stampText.replace(/([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})(.*)/, "$3-$1-$2$4");
  };

  /*
   * Adjust format of switch data value
   */
  my.formatSwitchData = function(newSwitchStatus) {
    var switchName, i, data = {};

    /*
     * Special case: when you switch the demo off, it returns DemoisOff not DemoOff
     * Special case: when you switch the demo on, it returns DemoStarting not DemoOn
     */
    if (newSwitchStatus === "DemoisOff") {
      newSwitchStatus = "DemoOff";
    }
    if (newSwitchStatus === "DemoStarting") {
      newSwitchStatus = "DemoOn";
    }

    var switchValueMatch = newSwitchStatus.match(/^(.*?)_?(On|Off)$/);
    var newSwitchName = switchValueMatch[1].toLowerCase();
    var newSwitchValue = switchValueMatch[2];

    for (i = 0; i < my.switchNames.length; i++) {
      switchName = my.switchNames[i];
      if (switchName === newSwitchName) {
        data[switchName] = my.isTruthy(newSwitchValue.toLowerCase());
      } else {
        if (my.switches != null) {
          data[switchName] = my.switches[switchName];
        }
      }
    }
    return data;
  };

  /*
   * Clean up data formatting to make it javascript-friendly.
   */
  my.formatData = function(data) {
    return {
      timestamp: my.fixupTimestamp(data.timestamp),
      temperature: parseInt(data.temp, 10),
      threshold: parseFloat(data.threshold),
      door_status: my.isTruthy(data.door_status),
      demo_status: my.isTruthy(data.demo_status),
      demo_step: parseInt(data.demo_step, 10),
    };
  };

  return my;
}(DEMO_CORE || {}));
