package com.intel.pathtoproduct.developer;

import mraa.Edge;
import upm_grove.GroveButton;

import com.intel.pathtoproduct.Event;
import com.intel.pathtoproduct.interfaces.IAlarmEventSink;
import com.intel.pathtoproduct.interfaces.IEventSink;

public class LocalAlarmManager implements IEventSink {

    boolean triggerAlarm = false;
    boolean alarmMuted = false;

    GroveButton button;
    IAlarmEventSink em;

    public LocalAlarmManager(IAlarmEventSink em, int buttonPin) {

        this.em = em;

        button = new GroveButton(buttonPin);
        button.installISR(Edge.EDGE_BOTH.swigValue(), new Runnable() {

            @Override
            public void run() {
                if(button.value() == 0){
                    muteAlarm();
                }
            }
        });
    }

    @Override
    public void publishEvent(Event event) {
        if (event.getAlarmStatus() == true && !triggerAlarm) {
            startAlarm();
        } else if (event.getAlarmStatus() == false && triggerAlarm) {
            stopAlarm();
        }
    }

    void startAlarm() {
        triggerAlarm = true;
        alarmMuted = false;
    }

    void stopAlarm() {
        triggerAlarm = false;
    }

    void muteAlarm() {
        alarmMuted = true;
        em.alarmMuted();
    }
}
