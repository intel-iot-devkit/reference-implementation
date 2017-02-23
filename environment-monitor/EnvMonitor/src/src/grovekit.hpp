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

#ifndef GROVEKIT_HPP_
#define GROVEKIT_HPP_

#include <gas.hpp>
#include <bme280.hpp>
#include <ppd42ns.hpp>
#include <mq2.hpp>
#include <jhd1313m1.hpp>
#include <led.hpp>

using namespace std;

uint16_t sound_buffer[128];
#define WARNING_THRESHOLD 200

//thresholdContext mic_ctx;

struct Devices
{
	upm::MQ2* gas_sensor;
	upm::PPD42NS* dust_sensor;
	upm::BME280* temp_hum_sensor;
	upm::Led* green_led;

	int gasPin, dustPin, tempHumPin, bmeBus, ledPin;

	Devices() {
	};

	// Initialization function
	// Changes needed here
	void init() {
		// Initialize the A101 sub platform
		for (int i=0; i<10; i++){
			mraa_add_subplatform(MRAA_GENERIC_FIRMATA, "/dev/ttyACM0");
			//sleep(1);
		}

		// Set pins/init as needed for specific platforms
		mraa_platform_t platform = mraa_get_platform_type();
		switch (platform) {
		case mraa::INTEL_GALILEO_GEN1:
		case mraa::INTEL_GALILEO_GEN2:
		case mraa::INTEL_EDISON_FAB_C:
			break;
		case mraa::INTEL_DE3815:
			if(mraa_has_sub_platform() != 0){
				std::cout << "detecting firmata" << std::endl;
			} else {
				std::cout << "unable to detect firmata" << std::endl;
			}
			// add all the sensor pins
			// make sure the pin numbers are correct
			gasPin = 1 + 512;
			ledPin = 2 + 512;
			dustPin = 4 + 512;
			bmeBus = 0 + 512;
			break;
		default:
			std::cerr << "Unsupported platform, exiting" << std::endl;
		}


		// MQ2 sensor connected to pin A1
		gas_sensor = new upm::MQ2(gasPin);

		// dust sensor connected to pin
		dust_sensor = new upm::PPD42NS(dustPin);

		// Green LED on Digital Pin D2
		green_led = new upm::Led(ledPin);

		// BME280 connected to ... i2c bus??
		temp_hum_sensor = new upm::BME280(bmeBus, 0x76, -1, 0x60);

		// start sensor warmup process
		//warmup();
	};

	// Cleanup on exit
	void cleanup() {
		delete gas_sensor;
		delete dust_sensor;
		delete green_led;
	}

	// this would be 24 hours for the gas sensor
	// Warmup the air quality sensor for 3 minutes
	void warmup(){

		fprintf(stdout, "Heating sensor for 3 minutes. Please wait...\n");

		// wait 3 minutes for sensor to warm up
		for(int i = 0; i < 3; i++) {
			if(i) {
				fprintf(stdout, "%d minute(s) passed...\n", i);
			}
			sleep(60);
		}

		fprintf(stdout, "Sensor ready!\n");
	}

	int checkTemperature(){
		temp_hum_sensor->update();
		float temp = temp_hum_sensor->getTemperature(true);
		fprintf(stdout, "Temperature in Fahrenheit: %f\n", temp);
		return (int)temp;
	}

	int checkHumidity(){
		temp_hum_sensor->update();
		float hum = temp_hum_sensor->getHumidity();
		fprintf(stdout, "Relative Humidity: %f\n", hum);
		return (int)hum;
	}

	int dustSensorMethod(){
		ppd42ns_dust_data data = dust_sensor->getData();
		fprintf(stdout, "Dust: Ratio: %f and Concentration: %f and LP Occupancy: %d\n", data.ratio, data.concentration, data.lowPulseOccupancy);
		return (int)data.concentration;
	}

	int checkGasConcentration(){
		int gas_conc = gas_sensor->getSample();
		fprintf(stdout, "Gas Concentration: %d\n", gas_conc);
		return gas_conc;
	}

	void turn_on_led() {
		green_led->on();
	}

	void turn_off_led() {
		green_led->off();
	}

};

#endif /* GROVEKIT_HPP_ */
