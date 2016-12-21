package com.intel.pathtoproduct.developer;


import java.net.Inet4Address;
import java.net.SocketException;
import java.util.List;

import upm_i2clcd.Jhd1313m1;

import com.intel.pathtoproduct.Event;
import com.intel.pathtoproduct.interfaces.IEventSink;

public class DisplayDevkit implements IEventSink {

    Jhd1313m1 lcd;

    @Override
    public void publishEvent(Event event) {
        lcd.clear();

        if (event.getAlarmStatus() == true) {
            if (event.getAlarmMuted() == false) {
                lcd.setColor((short)255, (short)32, (short)32);
            } else {
                lcd.setColor((short)255, (short)255, (short)32);
            }
        } else {
            lcd.setColor((short)32, (short)255, (short)32);
        }
        
        lcd.setCursor(0, 0);
        lcd.write(String.format("T=%.1fC/%.1fF",
                event.getTempCelsius(), event.getTempFahrenheit()));
        
        lcd.setCursor(1, 0);
        lcd.write("Door " + (event.doorClosed() ? "closed" : "open"));
    }

    void setupNetwork() throws SocketException, InterruptedException {
        IPFilter filter = new IPFilter();
        filter.removeNetwork("127.0.0.1");

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.write("Connecting to");
        lcd.setCursor(1, 0);
        lcd.write("network.");
        Thread.sleep(5000);

        List<Inet4Address> ips = filter.getIPs();
        lcd.clear();
        if (ips.size() > 1) {
            lcd.setCursor(0, 0);
            lcd.write("Connect to");
            lcd.setCursor(1, 0);
            lcd.write(ips.get(1).toString().substring(1));
        } else {
            lcd.setCursor(0, 0);
            lcd.write("No network.");
        }

        Thread.sleep(15000);
    }

    public DisplayDevkit() {
        this(0);
    }

    public DisplayDevkit(int bus) {
        lcd = new Jhd1313m1(bus);
        lcd.clear();
        lcd.setColor((short) 255, (short) 255, (short) 255);
        try {
            setupNetwork();
        } catch (SocketException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
