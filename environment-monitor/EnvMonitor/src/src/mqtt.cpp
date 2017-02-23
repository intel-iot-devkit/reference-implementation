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

#include "mqtt.h"
#include <cstring>

bool mqtt_initialized = false;
MQTTClient client;
MQTTClient_connectOptions conn_opts = MQTTClient_connectOptions_initializer;
MQTTClient_message pubmsg = MQTTClient_message_initializer;
MQTTClient_deliveryToken token;
MQTTClient_SSLOptions sslOptions = MQTTClient_SSLOptions_initializer;

void init_mqtt() {
	if (mqtt_initialized) {
		//return;
	}

	MQTTClient_create(&client,
			getenv("MQTT_SERVER"),
			getenv("MQTT_CLIENTID"),
			MQTTCLIENT_PERSISTENCE_NONE,
			NULL);

	// connection options
	conn_opts.keepAliveInterval = 20;
	conn_opts.cleansession = 1;

	if (getenv("MQTT_USERNAME")) {
		conn_opts.username = getenv("MQTT_USERNAME");
	}

	if (getenv("MQTT_PASSWORD")) {
		conn_opts.password = getenv("MQTT_PASSWORD");
	}

	// ssl options
	if (getenv("MQTT_CERT") && getenv("MQTT_KEY") && getenv("MQTT_CA")) {
		std::cout << "using ssl" << std::endl;
		sslOptions.keyStore = getenv("MQTT_CERT");
		sslOptions.privateKey = getenv("MQTT_KEY");
		sslOptions.trustStore = getenv("MQTT_CA");
	} else {
		sslOptions.enableServerCertAuth = false;
	};
	conn_opts.ssl = &sslOptions;

	mqtt_initialized = true;
};

void close_mqtt() {
	if (mqtt_initialized) {
		std::cout << "Closing MQTT..." << std::endl;
		MQTTClient_destroy(&client);
	}
};

//void log_mqtt(std::string payload) {
void log_mqtt(char* payload) {
	if (!getenv("MQTT_SERVER")) {
		return;
	}

	init_mqtt();

	int rc;

	if ((rc = MQTTClient_connect(client, &conn_opts)) != MQTTCLIENT_SUCCESS)
	{
		std::cout << "Failed to connect to MQTT server, return code:" << rc << std::endl;
		return;
	}

	std::cout << payload << std::endl;
	pubmsg.payload = payload;
	int len = strlen(payload);
	std::cout << len << std::endl;
	pubmsg.payloadlen = len;
	pubmsg.qos = QOS;
	pubmsg.retained = 0;
	MQTTClient_publishMessage(client, getenv("MQTT_TOPIC"), &pubmsg, &token);
	std::cout << "Publishing to MQTT server on " << getenv("MQTT_SERVER") << std::endl;
	rc = MQTTClient_waitForCompletion(client, token, TIMEOUT);
	MQTTClient_disconnect(client, 10000);
}
