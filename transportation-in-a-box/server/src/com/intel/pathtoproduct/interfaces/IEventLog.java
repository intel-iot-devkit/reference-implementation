package com.intel.pathtoproduct.interfaces;

import java.util.List;

import com.intel.pathtoproduct.Event;

public interface IEventLog {
    public Event getLatestEvent();
    public List<Event> getEvents();
}
