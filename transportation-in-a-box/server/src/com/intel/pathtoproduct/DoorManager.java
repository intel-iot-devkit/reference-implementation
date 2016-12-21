package com.intel.pathtoproduct;

import com.intel.pathtoproduct.interfaces.IDoorEventSink;
import com.intel.pathtoproduct.interfaces.IDoorSensor;

public class DoorManager {

    boolean closed = true;

    IDoorEventSink ds;
    IDoorSensor dsen;

    public DoorManager(final IDoorSensor dsen, final IDoorEventSink ds) throws RuntimeException {
        this.ds = ds;
        this.dsen = dsen;
        /**
         * The door manager abstracts the door sensor, which can be a toggle button,
         * a magnetic sensor or something else.
         * It sets a callbacks for the door sensor to call when its' state changes.
         */
        dsen.setCallback(new Runnable() {
            
            @Override
            public void run() {
                ds.doorUpdate(dsen.isClosed());
            }
        });

        ds.doorUpdate(dsen.isClosed());
    }
}
