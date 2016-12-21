package com.intel.pathtoproduct.interfaces;

public interface IDoorSensor {
    void setCallback(Runnable r);
    boolean isClosed();
}