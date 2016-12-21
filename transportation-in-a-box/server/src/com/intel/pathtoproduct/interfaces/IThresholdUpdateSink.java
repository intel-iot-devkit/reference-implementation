package com.intel.pathtoproduct.interfaces;

public interface IThresholdUpdateSink {
    void thresholdUpdateFahrenheit(double fahrenheit);
    void thresholdUpdateCelsius(double celsius);
    double getThresholdFahrenheit();
    double getThresholdCelsius();
}
