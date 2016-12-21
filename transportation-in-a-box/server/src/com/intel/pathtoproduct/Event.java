package com.intel.pathtoproduct;

import java.text.SimpleDateFormat;
import java.util.Date;

public class Event {
    private double temp;
    private double threshold;
    private boolean doorClosed;
    private boolean alarm;
    private boolean alarmMuted;
    private int step;
    private String description;
    private Date timestamp;

    Event(double temp, double threshold, boolean doorClosed, boolean alarm, boolean alarmMuted, int step, String description) {
        timestamp = new Date();
        this.temp = temp;
        this.threshold = threshold;
        this.doorClosed = doorClosed;
        this.alarm = alarm;
        this.alarmMuted = alarmMuted;
        this.step = step;
        if (description == null)
            this.description = "";
        else
            this.description = description;
    }

    public String getJSON() {
        String object = "{";

        SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy'T'HH:mm:ss'Z'");

        object += String.format("\"timestamp\": \"%s\", ", sdf.format(timestamp));
        object += String.format("\"threshold\": %f, ", threshold);
        object += String.format("\"temp\": %f, ", temp);
        object += String.format("\"door_status\": \"%s\", ", doorClosed ? "0" : "1");
        object += String.format("\"current_step\": \"%d\", ", step);
        object += String.format("\"event\": \"%s\"", description);

        return object + "}";
    }

    public double getTempCelsius() {
        return (temp - 32) / 1.8;
    }

    public double getTempFahrenheit() {
        return temp;
    }

    public double getThreshold() {
        return threshold;
    }

    public boolean doorClosed() {
        return doorClosed;
    }

    public boolean getAlarmStatus() {
        return alarm;
    }

    public int getStep() {
        return step;
    }

    public String getDescription() {
        return description;
    }
    
    public boolean getAlarmMuted() {
        return alarmMuted;
    }
}
