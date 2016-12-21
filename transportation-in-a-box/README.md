# Path to Product Transportation In-a-Box

### What it Does

This project simulates the following parts of a Transportation monitoring solution:
* **Door** The door can be closed or opened, in which case the driver signaled that
something might be wrong.
* **Temperature** The temperature inside the truck is being monitored. The data is logged
and above a certain threshold an alarm is raised.
* **Alarm** Under certain conditions an alarm is raised. The alarm can be canceled by
pressing the touch button or when the parameters of the system return to normal.
* **Display** Displays the status of the system, temperature and door status.

### How it Works

This transporation application operates based on the following sensor data:
* Open/closed status of the truck door
* Temperature of the truck interior
* Events: open/close door, change temperature, set temperature threshold, trigger/stop
alarm

All data is forwarded to the web interface, which can be used to monitor the status of the truck.

### Set up the Dell* Wyse 3290

This section gives instructions for installing the Intel® IoT Gateway Software Suite on the Dell* Wyse 3290.

*Note:* If you are on an Intel® network, you need to set up a proxy server.

1. Create an account on the Intel® IoT Platform Marketplace if you do not already have
one.
2. Order the Intel® IoT Gateway Software Suite, and then follow the instructions you will
receive by email to download the image file.
3. Unzip the archive, and then write the .img file to a 4 GB USB drive:
  1. On Microsoft Windows*, you can use a tool like Win32 Disk Imager*:
  https://sourceforge.net/projects/win32diskimager
  2. On Linux*, use sudo dd if=GatewayOS.img of=/dev/ sdX bs=4M; sync, where
  sdX is your USB drive.

4. Unplug the USB drive from your system, and then plug it into the Dell* Wyse 3290 along with a
monitor, keyboard, and power cable.
5. Turn on the Dell* Wyse 3290, and then enter the BIOS by pressing F2 at boot time.
6. Boot from the USB drive:
  1. On the **Advanced** tab, make sure **Boot from USB** is enabled.
  2. On the **Boot** tab, put the USB drive first in the order of the boot devices.
  3. Save the changes, and then reboot the system.
7. Log in to the system with root:root.
8. Install Wind River* Linux* on local storage: ```~# deploytool -d /dev/mmcblk0 --lvm 0 --reset-media -F```
9. Use the poweroff command to shut down your gateway, unplug the USB drive, and then
turn your gateway back on to boot from the local storage device.
10. Plug in an Ethernet cable, and then use the ifconfig eth0 command to find the IP address
assigned to your gateway (assuming you have a proper network setup).
11. Use the Intel® IoT Gateway Developer Hub to update the MRAA and UPM repositories to
the latest versions from the official repository (https://01.org). You can achieve the same
result by entering the following commands:

  ```
   ~# smart update
   ~# smart upgrade
   ~# smart install upm
  ```

12. Connect the Intel® Arduino/Genuino 101 board using the USB cable.
13. Connect the Omega RH-USB Temperature sensor to an USB port.

### Connect other Components

This section covers making the connections from the Dell* Wyse 3290 to the rest of the hardware
components. The bill of materials for the prototype is summarized in Table 1.

Table 1. Transportation In-a-Box components.

|         | Component | Details  | Connection |
|---------|-----------|----------|------------|
|Base System| [Dell* Wyse 3290](http://www.dell.com/us/business/p/wyse-3000-series/pd) | Gateway ||
||  [Intel® Arduino/Genuino 101](https://www.arduino.cc/en/Main/ArduinoBoard101) | Sensor Hub | USB |
|| USB Type A to Type B Cable | For connecting Arduino/Genuino 101 board to Gateway ||
| Sensors | [Omega* RH-USB](http://www.omega.com/pptst/RH-USB.html) | Temperature sensor | USB |
|| [Grove* - Relay](https://www.seeedstudio.com/Grove-Relay-p-769.html) | Fan control | D8 |
|| [Grove* - LCD RGB Backlight](https://www.seeedstudio.com/Grove-LCD-RGB-Backlight-p-1643.html)| Display stats | I2C |
|| [Magnetic Switch](https://www.adafruit.com/product/375) | Door sensor | D3 |
|| [Peltier Thermo-Electric Cooler](https://www.adafruit.com/products/1335) | Cooling fan ||
|| [Round Push Button](https://www.adafruit.com/products/1439) | Acknowledge alarm | D4 |

### How to set up

To begin, clone the **Path to Product** repository with Git* on your computer as follows:

    $ git clone https://github.com/intel-iot-devkit/reference-implementations.git

To download a .zip file, in your web browser go to [](https://github.com/intel-iot-devkit/path-to-product) and click the **Download ZIP** button at the lower right. Once the .zip file is downloaded, uncompress it, and then use the files in the directory for this example.

## Adding the program to Intel® System Studio IoT Edition

 ** The following screenshots are from the Alarm clock sample, however the technique for adding the program is the same, just with different source files and jars.

Open Intel® System Studio IoT Edition, it will start by asking for a workspace directory. Choose one and then click OK.

In Intel® System Studio IoT Edition , select File -> new -> **Intel(R) IoT Java Project**:

![](img/new project.png)

Give the project the name "Transportation Demo" and then click Next.

![](img/project name.png)

You now need to connect to your Dell* Wyse Gateway from your computer to send code to it.
Choose a name for the connection and enter IP address of the Dell* Wyse Gateway in the "Target Name" field. You can also try to Search for it using the "Search Target" button. Click finish when you are done.

![](img/Target connection.png)

You have successfully created an empty project. You now need to copy the source files and the config file to the project.
Drag all of the files from your git repository's "src" folder into the new project's src folder in Intel® System Studio IoT Edition. Make sure previously auto-generated main class is overridden.

The project uses the following external jars: [commons-cli-1.3.1.jar](http://central.maven.org/maven2/commons-cli/commons-cli/1.3.1/commons-cli-1.3.1.jar), [tomcat-embed-core.jar](http://central.maven.org/maven2/org/apache/tomcat/embed/tomcat-embed-core/8.0.36/tomcat-embed-core-8.0.36.jar), [tomcat-embed-logging-juli](http://central.maven.org/maven2/org/apache/tomcat/embed/tomcat-embed-logging-juli/8.0.36/tomcat-embed-logging-juli-8.0.36.jar). These can be found in the Maven Central Repository. Create a "jars" folder in the project's root directory, and copy all needed jars in this folder.
In Intel® System Studio IoT Edition, select all jar files in "jars" folder and  right click -> Build path -> Add to build path

![](img/add to build path.png)

Now you need to add the UPM jar files relevant to this specific sample.
right click on the project's root -> Build path -> Configure build path. Java Build Path -> 'Libraries' tab -> click on "add external JARs..."

for this sample you will need the following jars:

1. upm_grove.jar
2. upm_i2clcd.jar
3. upm_rhusb.jar
4. mraa.jar

The jars can be found at the IOT Devkit installation root path\iss-iot-win\devkit-x86\sysroots\i586-poky-linux\usr\lib\java

![](img/add external jars to build path.png)

Afterwards, copy the www folder to the home directory on the target platform using scp or WinSCP.
Create a new Run configuration in Eclipse for the project for the Java Application. Set the Main Class as: ```com.intel.pathtoproduct.JavaONEDemoMulti``` in the Main tab.
Then, in the arguments tab enter: ``` -webapp <path/to/www/folder> ```.

## Running without an IDE

Download the repo directly to the target plaform and run the ``` start.sh ``` script.
