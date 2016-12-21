package com.intel.pathtoproduct;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

import com.intel.pathtoproduct.interfaces.IAlarmEventSink;
import com.intel.pathtoproduct.interfaces.IDoorEventSink;
import com.intel.pathtoproduct.interfaces.IEventLog;
import com.intel.pathtoproduct.interfaces.IEventSink;
import com.intel.pathtoproduct.interfaces.IResetManager;
import com.intel.pathtoproduct.interfaces.ITempUpdateSink;
import com.intel.pathtoproduct.interfaces.IThresholdUpdateSink;

public class EventManager implements IDoorEventSink, IThresholdUpdateSink, ITempUpdateSink,
IAlarmEventSink, IEventLog, IResetManager {

    List<IEventSink> eventSinks;
    Deque<Event> eventLog;

    double tempFahrenheit;
    double thresholdFahrenheit;
    boolean doorClosed;
    boolean alarm = false;
    boolean alarmMuted = false;
    int step = 1;
    int logSize = 20;

    /**
     * The event manager is the core of the application.
     * It centralizes all events and implements the state machine and
     * decision making. Other modules call functions from the EventManager,
     * which generates events and then sends then to all listeners.
     * Listeners must decide what to do with the events received, if anything.
     */
    public EventManager() {
        eventSinks = new ArrayList<IEventSink>();
        eventLog = new ArrayDeque<Event>();
        reset();
    }

    public double getThresholdFahrenheit() {
        return thresholdFahrenheit;
    }

    public double getThresholdCelsius() {
        return (thresholdFahrenheit - 32) / 1.8;
    }

    public void tempUpdateCelsius(double celsius) {
        tempUpdateFahrenheit(celsius * 1.8 + 32);
    }

    public void tempUpdateFahrenheit(double fahrenheit) {
        tempFahrenheit = fahrenheit;

        String update = tempUpdateCheck();

        publishEvent(update);
    }

    public double getTempFahrenheit() {
        return tempFahrenheit;
    }

    public double getTempCelsius() {
        return (tempFahrenheit - 32) / 1.8;
    }

    public void thresholdUpdateCelsius(double celsius) {
        thresholdUpdateFahrenheit(celsius * 1.8 + 32);
    }

    public void thresholdUpdateFahrenheit(double fahrenheit) {
        thresholdFahrenheit = fahrenheit;

        String update = tempUpdateCheck();

        publishEvent(update);
    }

    /**
     * The alarm logically starts when temp > threshold, AlarmManagers might
     * delay turning on the alarm until later, for UX reasons. Alarm might also trigger
     * some other responses, such as turning on a fan.
     */
    String tempUpdateCheck() {
        if (tempFahrenheit > thresholdFahrenheit && alarm == false) {
            alarm = true;
            alarmMuted = false;
            return "Temperature exceeds threshold.";
        }
        else if (tempFahrenheit < (thresholdFahrenheit - 2) && alarm == true) {
            alarm = false;
            alarmMuted = true;
            return "Temperature returned to normal.";
        }
        return null;
    }

    /** Closing and opening the door change step */
    public void doorUpdate(boolean closed) {
        doorClosed = closed;

        if (step == 1 && closed == false)
            step = 2;
        else if (step == 4 && closed == true)
            step = 1;

        if (doorClosed)
            publishEvent("Door Closed");
        else
            publishEvent("Door Opened");
    }

    /** The alarm has been muted by one of the AlarmManagers, change step */
    public void alarmMuted() {
        if (step == 3)
            step = 4;
        alarmMuted = true;
        publishEvent("Alarm muted");
    }

    /** The alarm has been triggered by one of the AlarmManagers, change step */
    public void alarmTriggered() {
        if (step == 1 || step == 2)
            step = 3;
        publishEvent("Alarm triggered");
    }

    /** Get a list of latest events */
    public List<Event> getEvents() {
        if (eventLog.size() > 0)
            return new ArrayList<Event>(eventLog);
        else {
            ArrayList<Event> list = new ArrayList<Event>();
            list.add(new Event(tempFahrenheit, thresholdFahrenheit, doorClosed, alarm, alarmMuted, step, null));
            return list;
        }
    }

    /** Get latest event, or a default event if log is empty */
    public Event getLatestEvent() {
        Event event = eventLog.peekLast();
        if (event != null)
            return event;
        else
            return new Event(tempFahrenheit, thresholdFahrenheit, doorClosed, alarm, alarmMuted, step, null);
    }

    /** Reset demo to starting conditions */
    public void reset() {
        step = 1;
        eventLog.clear();
        thresholdFahrenheit = 80;
    }

    void addEventSink(IEventSink es) {
        eventSinks.add(es);
    }

    void publishEvent() {
        publishEvent(null);
    }

    /** send events to all registered Event Sinks */
    synchronized private void publishEvent(String update) {

        final Event event = new Event(tempFahrenheit, thresholdFahrenheit, doorClosed, alarm, alarmMuted, step, update);

        System.out.println(event.getJSON());

        if (eventLog.size() >= logSize)
            eventLog.remove();
        eventLog.add(event);

        List<Thread> threadList = new ArrayList<Thread>();
        for (final IEventSink es : eventSinks) {
            Thread t = new Thread(new Runnable() {
                @Override
                public void run() {
                    es.publishEvent(event);
                }
            });
            t.start();
            threadList.add(t);
        }
        for (Thread t : threadList) {
            try {
                t.join();
            } catch (InterruptedException e) {
                System.out.println("Update interrupted, event might not have propagated");
            }
        }
    }

}
