package com.intel.pathtoproduct.commercial;
import com.intel.pathtoproduct.interfaces.ITempSensor;

import upm_rhusb.*;

public class TempSensorCommercial implements ITempSensor {

    RHUSB rhusb;

    public TempSensorCommercial() {
        rhusb = new RHUSB("/dev/ttyUSB0");
    }

    @Override
    public float getTempCelsius() {
        rhusb.update();
        return rhusb.getTemperature();
    }

    @Override
    public float getTempFahrenheit() {
        return getTempCelsius() * 1.8f + 32;
    }
}
