package com.intel.pathtoproduct.commercial;
import mraa.Dir;
import mraa.Edge;
import mraa.Gpio;
import mraa.Mode;

import com.intel.pathtoproduct.interfaces.IDoorSensor;


public class DoorSensorCommercial implements IDoorSensor {

    Gpio hall;
    Runnable callback;
    
    public DoorSensorCommercial() {
        /* 
         * The Magnetic Sensor sensor mounted on the truck requires a pullup and
         * connects the GPIO pin to GND when the door is closed. The Hall sensor
         * in UPM is not suited for this configuration.
         */
        hall = new Gpio(515);;
        hall.dir(Dir.DIR_IN);
        hall.isr(Edge.EDGE_BOTH, new Runnable() {
            
            @Override
            public void run() {
                if (callback != null)
                    callback.run();
            }
        });
    }
    
    @Override
    public void setCallback(Runnable r) {
        callback = r;
    }

    @Override
    public boolean isClosed() {
        return (hall.read() == 1);
    }
}
