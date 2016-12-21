package com.intel.pathtoproduct;

import com.intel.pathtoproduct.interfaces.ITempSensor;
import com.intel.pathtoproduct.interfaces.ITempUpdateSink;

public class TempManager {

    boolean running = false;
    Thread t = null;
    ITempSensor temp;

    Runnable tempLoopDekvit = new Runnable() {

        @Override
        public void run() {
            running = true;
            float celsius = temp.getTempCelsius();
            ts.tempUpdateCelsius(celsius);
            while (running) {

                float newCelsius = temp.getTempCelsius();
                if (newCelsius != celsius)
                    ts.tempUpdateCelsius(newCelsius);
                celsius = newCelsius;

                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    System.err.println("TempLoop interrupted, exiting loop");
                }
            }
        }
    };

    ITempUpdateSink ts;

    /**
     * The TempManager sets up a polling loop for the given temp sensor which checks for
     * changes in temperature.
     */
    public TempManager(ITempSensor temp, ITempUpdateSink ts) throws RuntimeException {
        this.ts = ts;
        this.temp = temp;
        t = new Thread(tempLoopDekvit);
        t.setDaemon(true);
        t.start();
    }

    void cancel() {
        running = false;
        t.interrupt();
        try {
            t.join();
        } catch (InterruptedException e) {
            System.err.println("Thread not stopped correctly");
        }
    }
}
