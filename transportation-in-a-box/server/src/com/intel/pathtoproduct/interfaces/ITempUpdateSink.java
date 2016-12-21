package com.intel.pathtoproduct.interfaces;

public interface ITempUpdateSink {
    void tempUpdateFahrenheit(double fahrenheit);
    void tempUpdateCelsius(double celsius);
    double getTempFahrenheit();
    double getTempCelsius();
}
