/*
 * Copyright (c) 2015 - 2016 Intel Corporation.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <unistd.h>
#include <sstream>
#include <thread>
#include <ctime>
#include <string>
#include <signal.h>
#include <cstring>
#include "grovekit.hpp"
#include "mqtt.h"

using namespace std;

Devices devices;

char msg_start[] = "{";
char temperature[] = "\"temperature\":";
char humidity[] = "\"humidity\":";
char dust[] = "\"dust\":";
char gas[] = "\"gas\":";
char comma[] = ", ";
char msg_end[] = "}";
char dust_buffer[64];
char gas_buffer[4];
char temp_buffer[3];
char humi_buffer[3];

int dust_concentration, gas_concentration, temp, humi;

// Check the air qulity by reading the sensor
void notify(){
	gas_concentration = devices.checkGasConcentration();

	temp = devices.checkTemperature();
	snprintf(temp_buffer, 3, "%d", temp);
	humi = devices.checkHumidity();
	snprintf(humi_buffer, 3, "%d", humi);

	dust_concentration = devices.dustSensorMethod();
	time_t now = time(NULL);
	char mbstr[sizeof "2011-10-08T07:07:09Z"];
	strftime(mbstr, sizeof(mbstr), "%FT%TZ", localtime(&now));

	// convert dust to char array
	snprintf(dust_buffer, 64, "%d", dust_concentration);
	// convert gas to char array
	std::cout << gas_concentration << std::endl;
	snprintf(gas_buffer, 4, "%d", gas_concentration);

	char msg[1024];

	strcpy(msg, msg_start);
	strcat(msg, temperature);
	strcat(msg, temp_buffer);  // concatenate the actual temperature here
	strcat(msg, comma);
	strcat(msg, humidity);
	strcat(msg, humi_buffer);  // concatenate the actual humidity here
	strcat(msg, comma);
	strcat(msg, dust);
	strcat(msg, dust_buffer);
	strcat(msg, comma);
	strcat(msg, gas);
	strcat(msg, gas_buffer);
	strcat(msg, msg_end);
	std::cout << msg << std::endl;

	if(getenv("MQTT_SERVER")) {
		log_mqtt(msg);
	} else {
		setenv("MQTT_SERVER", "ssl://ajk4zomu6fgi3.iot.us-west-2.amazonaws.com:8883", 1);
		log_mqtt(msg);
		setenv("MQTT_SERVER", "localhost:1883", 1);
		log_mqtt(msg);
	}
}

// Exit handler for program
void exit_handler(int param)
{
	close_mqtt();
	devices.turn_off_led();
	devices.cleanup();
	std::cout << "clean exit" << std::endl;
	exit(0);
}

// The main function for the example program
int main() {
	// Handles ctrl-c or other orderly exits
	signal(SIGTERM, exit_handler);

	// create and initialize UPM devices
	devices.init();
	std::cout << "started main" << std::endl;
	devices.turn_on_led();
	for (;;) {
		notify();
	}

	return MRAA_SUCCESS;
}
