package com.intel.pathtoproduct.interfaces;

import com.intel.pathtoproduct.Event;

public interface IEventSink {
    void publishEvent(Event event);
}
