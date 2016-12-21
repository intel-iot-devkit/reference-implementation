package com.intel.pathtoproduct;

import java.io.File;

import javax.servlet.ServletException;

import org.apache.catalina.Context;
import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;

import com.intel.pathtoproduct.commercial.DoorSensorCommercial;
import com.intel.pathtoproduct.commercial.FanManager;
import com.intel.pathtoproduct.commercial.TempSensorCommercial;
import com.intel.pathtoproduct.developer.DisplayDevkit;
import com.intel.pathtoproduct.developer.LocalAlarmManager;
import com.intel.pathtoproduct.interfaces.IDoorSensor;
import com.intel.pathtoproduct.interfaces.ITempSensor;

public class JavaONEDemoMulti {

    static void setupServer(Tomcat tomcat, EventManager em, String path) throws ServletException {

        /* Add path as the main directory of the server */
        Context ctx = tomcat.addWebapp("", path);

        /* Initialize the servlets required for the webapps */
        Tomcat.addServlet(ctx, "DataServ", new DataServ(em, em));
        Tomcat.addServlet(ctx, "ThreshUpdate", new ThreshUpdate(em));
        Tomcat.addServlet(ctx, "BuzzerAck", new BuzzerAck(em));

        /* Map the servlets appropriately */
        ctx.addServletMapping("/ExpKit/threshold", "ThreshUpdate");
        ctx.addServletMapping("/ExpKit/buzzer", "BuzzerAck");
        ctx.addServletMapping("/ExpKit/getData", "DataServ");
    }

    @SuppressWarnings("unused")
    public static void main(String[] args) throws ServletException, LifecycleException, ParseException {
        File path = new File("/home/root/www");
        EventManager em = new EventManager();
        int subplatformOffset = 512;

        Options options = new Options();
        options.addOption("webapp", true, "Change folder where the webapps are installed. Default is '/home/root/www'");
        options.addOption("firmata", false, "Use firmata extension board. Works with config 'devkit'");
        options.addOption("firmata_dev", true,
                "Supply firmata device path. Default is '/dev/ttyACM0'. Turns on firmata support.");

        CommandLineParser parser = new DefaultParser();
        CommandLine cli = parser.parse(options, args);

        if (cli.hasOption("webapp")) {
            String strPath = cli.getOptionValue("webapp");
            path = new File(strPath);
            if (!path.exists() || !path.isDirectory()) {
                System.err.println("Wrong path to webapp.");
                System.exit(1);
            }
        }


        if (cli.hasOption("firmata") || cli.hasOption("firmata_dev")) {
            String devpath = "/dev/ttyACM0";
            if (cli.hasOption("firmata_dev"))
                devpath = cli.getOptionValue("firmata_dev");
            if (mraa.mraa.addSubplatform(mraa.Platform.GENERIC_FIRMATA, devpath) != mraa.Result.SUCCESS) {
                System.err.println("Could not configure firmata device on " + devpath);
                System.exit(1);
            }
        }
 
        /* Setup sensors for the demo */
        ITempSensor ts = new TempSensorCommercial();
        IDoorSensor ds = new DoorSensorCommercial();

        LocalAlarmManager am = new LocalAlarmManager(em, subplatformOffset + 4);
        em.addEventSink(am);
        
        DisplayDevkit ld = new DisplayDevkit(subplatformOffset);
        em.addEventSink(ld);

        FanManager fm = new FanManager();
        em.addEventSink(fm);   
        
        /* Start the webserver */
        Tomcat tomcat = new Tomcat();
        tomcat.setPort(3095);

        setupServer(tomcat, em, path.getAbsolutePath());

        tomcat.start();

        /* Set up temperature and door notifications */
        TempManager tm = new TempManager(ts, em);
        DoorManager dm = new DoorManager(ds, em);

        tomcat.getServer().await();
    }

}