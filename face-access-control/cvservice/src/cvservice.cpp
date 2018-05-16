/*
 * Authors: Mihai Tudor Panu <mihai.tudor.panu@intel.com>
 *          Ron Evans <ron@hybridgroup.com>
 * Copyright (c) 2017 Intel Corporation.
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

// System includes
#include <algorithm>
#include <assert.h>
#include <cassert>
#include <cmath>
#include <exception>
#include <iostream>
#include <limits.h>
#include <map>
#include <math.h>
#include <memory.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <syslog.h>
#include <sys/stat.h>
#include <time.h>
#include <vector>

// OpenCV includes
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <opencv2/video/tracking.hpp>
#include <opencv2/pvl/pvl.hpp>

// MQTT
#include "mqtt.h"

using namespace std;
using namespace cv;
using namespace cv::pvl;

volatile bool running = true;
volatile bool performRegistration = false;

const char* DEFAULT_DB_LOCATION = "./defaultdb.xml";
const char* DEFAULT_THUMBNAIL_PATH = "./thumbs/";
const int FONT = cv::FONT_HERSHEY_PLAIN;
const Scalar GREEN(0, 255, 0);
const Scalar BLUE(255, 0, 0);
const Scalar WHITE(255, 255, 255);

Ptr<FaceDetector> pvlFD;
Ptr<FaceRecognizer> pvlFR;
Mat imgIn;
Mat imgGray;
VideoCapture webcam;

vector<Face> detectedFaces;
vector<Face> recognizedFaces;
vector<int>  personIDs;
vector<int>  confidence;

int cameraNumber = 0;
string databaseLocation;
string thumbnailPath;

string lastTopic;
string lastID;

// parse the command line arguments passed in, to determine which camera ID to use
// also handle any ENV vars
void parseArgs(int argc, const char* argv[]) {
    if (argc > 1) {
        cameraNumber = atoi(argv[1]);
    }

    databaseLocation = std_getenv("FACE_DB");
    if (databaseLocation.empty()) {
        databaseLocation = DEFAULT_DB_LOCATION;
    }

    thumbnailPath = std_getenv("FACE_IMAGES");
    if (thumbnailPath.empty()) {
        thumbnailPath = DEFAULT_THUMBNAIL_PATH;
    }
}

// publish MQTT message with a JSON payload
void publishMQTTMessage(const string& topic, const string& id)
{
    // don't send repeat messages
    if (lastTopic == topic && lastID == id) {
        return;
    }

    lastTopic = topic;
    lastID = id;

    string payload = "{\"id\": \"" + id + "\"}";

    mqtt_publish(topic, payload);

    string msg = "MQTT message published to topic: " + topic;
    syslog(LOG_INFO, "%s", msg.c_str());
    syslog(LOG_INFO, "%s", payload.c_str());
}

// message handler for the MQTT subscription for the "commands/register" topic
int handleControlMessages(void *context, char *topicName, int topicLen, MQTTClient_message *message)
{
    string topic = topicName;
    string msg = "MQTT message received: " + topic;
    syslog(LOG_INFO, "%s", msg.c_str());

    if (topic == "commands/register") {
        performRegistration = true;
    }
    return 1;
}

// Open webcam input
bool openWebcamInput(int cameraNumber) {
    webcam.open(cameraNumber);

    if (!webcam.isOpened())
    {
        syslog(LOG_ERR, "Error: fail to capture video.");
        return false;
    }

    return true;
}

// loads the face database from the XML file on disk
bool loadFaceDB(const string& dbPath) {
    // does the DB file exist?
    struct stat tmpbuffer;
    if (stat(dbPath.c_str(), &tmpbuffer) != 0) {
        syslog(LOG_WARNING, "Unable to locate face DB. Will be created on save.");
        return false;
    }

    // try to load the existing DB file
    pvlFR = Algorithm::load<FaceRecognizer>(dbPath);
    if (pvlFR == NULL)
    {
        syslog(LOG_ERR, "Error: fail to load face DB.");
        return false;
    }

    pvlFR->setTrackingModeEnabled(true);
    return true;
}

// Setup settings for FaceDetect (face size, number of faces, ROI, allowed angle/rotation, etc)
bool initFaceDetection() {
    pvlFD = FaceDetector::create();
    if (pvlFD.empty())
    {
        syslog(LOG_ERR, "Error: fail to create PVL face detector.");
        return false;
    }

    pvlFD->setTrackingModeEnabled(true);
    pvlFD->setMaxDetectableFaces(1);

    pvlFR = FaceRecognizer::create();
    if (pvlFR.empty())
    {
        syslog(LOG_ERR, "Error: fail to create PVL face recognizer.");
        return false;
    }

    pvlFR->setTrackingModeEnabled(true);

    loadFaceDB(databaseLocation);

    return true;
}

bool getNextImage() {
    webcam >> imgIn;
    if (imgIn.empty())
    {
        syslog(LOG_ERR, "Error: no input image.");
        return false;
    }

    //prepare grayscale image for analysis
    cvtColor(imgIn, imgGray, cv::COLOR_BGR2GRAY);
    if (imgGray.empty())
    {
        syslog(LOG_ERR, "Error: cannot convert input image to gray.");
        return false;
    }

    return true;
}

// detect any faces, and store the face data
void lookForFaces() {
    detectedFaces.clear();
    personIDs.clear();
    confidence.clear();

    //do face detection
    pvlFD->detectFaceRect(imgGray, detectedFaces);
}

// try to recognize any of the detected faces
void recognizeFaces() {
    if (detectedFaces.size() > 0)
    {
        recognizedFaces.clear();

        int recognizedFaceCount = 0;
        recognizedFaceCount = MIN(static_cast<int>(detectedFaces.size()), pvlFR->getMaxFacesInTracking());

        for (int i = 0; i < recognizedFaceCount; i++)
        {
            recognizedFaces.push_back(detectedFaces[i]);
        }

        pvlFR->recognize(imgGray, recognizedFaces, personIDs, confidence);
        bool saveNeeded = false;

        for (uint i = 0; i < personIDs.size(); i++)
        {
            if (personIDs[i] == FACE_RECOGNIZER_UNKNOWN_PERSON_ID)
            {
                if (performRegistration)
                {
                    int personID = pvlFR->createNewPersonID();
                    pvlFR->registerFace(imgGray, detectedFaces[i], personID, true);

                    publishMQTTMessage("person/registered", to_string(personID));

                    string saveFileName = thumbnailPath+to_string(personID)+".jpg";
                    cv:imwrite(saveFileName.c_str(), imgIn);

                    saveNeeded = true;
                    performRegistration = false;
                } else {
                    publishMQTTMessage("person/seen", "UNKNOWN");
                }
            } else {
                publishMQTTMessage("person/seen", to_string(personIDs[i]));
            }
        }

        if (saveNeeded) {
            pvlFR->save(databaseLocation);
        }
    } else {
        lastTopic.clear();
        lastID.clear();
    }
}

// display the info on any faces detected in the window image
void displayDetectionInfo()
{
    for (uint i = 0; i < detectedFaces.size(); ++i)
    {
        const Face& face = detectedFaces[i];
        Rect faceRect = face.get<Rect>(Face::FACE_RECT);

        // Draw face rect
        rectangle(imgIn, faceRect, WHITE, 2);
    }
}

// display the info on any faces recognized in the window image
void displayRecognitionInfo()
{
    cv::String str;

    for (uint i = 0; i < detectedFaces.size(); i++)
    {
        const Face& face = detectedFaces[i];
        Rect faceRect = face.get<Rect>(Face::FACE_RECT);

        //draw FR info
        str = (personIDs[i] > 0) ? cv::format("Person: %d(%d)", personIDs[i], confidence[i]) : "UNKNOWN";

        cv::Size strSize = cv::getTextSize(str, FONT, 1.2, 2, NULL);
        cv::Point strPos(faceRect.x + (faceRect.width / 2) - (strSize.width / 2), faceRect.y - 2);
        cv::putText(imgIn, str, strPos, FONT, 1.2, GREEN, 2);
    }
}

// Output BGR24 raw format to console.
void outputFrame() {
    int i,j;
    unsigned char b, g, r;
    Vec3b pixel;
    for(int j = 0;j < imgIn.rows;j++){
      for(int i = 0;i < imgIn.cols;i++){
          pixel = imgIn.at<Vec3b>(j, i);
          printf("%c%c%c", pixel[0], pixel[1], pixel[2]);
      }
    }
    fflush(stdout);
}

// display the window image
void display() {
    displayDetectionInfo();
    displayRecognitionInfo();

    outputFrame();
}

int main(int argc, const char* argv[])
{
    syslog(LOG_INFO, "Starting cvservice...");

    parseArgs(argc, argv);

    try
    {
        int result = mqtt_start(handleControlMessages);
        if (result == 0) {
            syslog(LOG_INFO, "MQTT started.");
        } else {
            syslog(LOG_INFO, "MQTT NOT started: have you set the ENV varables?");
        }

        mqtt_connect();
        mqtt_subscribe("commands/register");

        if (!openWebcamInput(cameraNumber)) {
            throw invalid_argument("Invalid camera number or unable to open camera device.");
            return 1;
        }

        if (!initFaceDetection()) {
            throw runtime_error("Unable to initialize face detection or face recognition.");
            return 1;
        }

        while(running)
        {
            if (getNextImage())
            {
                lookForFaces();

                recognizeFaces();

                display();
            }
        }

        mqtt_disconnect();
        mqtt_close();
        return 0;
    }
    catch(const std::exception& error)
    {
        syslog(LOG_ERR, "%s", error.what());
        return 1;
    }
    catch(...)
    {
        syslog(LOG_ERR, "Unknown/internal exception ocurred");
        return 1;
    }
}
