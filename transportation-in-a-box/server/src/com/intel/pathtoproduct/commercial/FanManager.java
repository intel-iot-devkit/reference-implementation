package com.intel.pathtoproduct.commercial;

import upm_grove.GroveRelay;

import com.intel.pathtoproduct.Event;
import com.intel.pathtoproduct.interfaces.IEventSink;

public class FanManager implements IEventSink {

    GroveRelay fanController;

    public FanManager() {
        fanController = new GroveRelay(520);
    }

    @Override
    public void publishEvent(Event event) {
        if (event.doorClosed() == true)
            fanController.on();
        else
            fanController.off();
    }
}
