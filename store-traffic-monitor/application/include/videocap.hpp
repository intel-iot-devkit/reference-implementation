/*
 * Authors: Stefan Andritoiu <stefan.andritoiu@gmail.com>
 *          Mihai Stefanescu <mihai.stefanescu@rinftech.com>
 * Copyright (c) 2018 Intel Corporation.
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

#pragma once

#include <string>
#include <vector>
#include <utility>
#include "opencv2/highgui/highgui.hpp"

using namespace std;

static const string conf_targetDevice = "CPU";
static string conf_modelPath;
static string conf_binFilePath;
static string conf_labelsFilePath;
static const string conf_file = "../resources/conf.txt";
static const size_t conf_batchSize = 1;
#ifndef UI_OUTPUT
static const int conf_windowColumns = 5; // OpenCV windows per each row
#endif

static const double conf_thresholdValue = 0.145;
static const int conf_candidateConfidence = 5;

#ifdef UI_OUTPUT
static const string conf_videoDir = "../../UI/resources/video_frames/";
static const string conf_dataJSON_file = "../../UI/resources/video_data/data.json";
static const string conf_videJSON_file = "../../UI/resources/video_data/videolist.json";
#else
static const int conf_fourcc = CV_FOURCC('H','2','6','4');
static const string conf_dataJSON_file = "data.json";
#endif

#ifdef UI_OUTPUT
typedef struct
{
	int frameNo;
	int count;
	char timestamp[30];
} frameInfo;
#endif

class VideoCap {
public:
	size_t inputWidth;
	size_t inputHeight;

	string labelName;
	int label;

	int lastCorrectCount;
	int totalCount;
	int currentCount;
	bool changedCount;

	int candidateCount;
	int candidateConfidence;

	cv::VideoCapture vc;
#ifndef UI_OUTPUT
	cv::VideoWriter vw;
#endif
	int frames = 0;
#ifdef LOOP_VIDEO
	int loopFrames = 0;
	bool isCam = false;
#endif

	const string camName;
#ifndef UI_OUTPUT
	const string videoName;
#endif

	// Object count at a given frame
#ifdef UI_OUTPUT
	vector<frameInfo> countAtFrame;
#else
	vector<pair<int, int>> countAtFrame;
#endif

	// Constructor for video input
	VideoCap(size_t inputWidth,
			 size_t inputHeight,
			 const string inputVideo,
			 const string camName,
			 const string labelName)
		: inputWidth(inputWidth)
		, inputHeight(inputHeight)
		, lastCorrectCount(0)
		, totalCount(0)
		, currentCount(0)
		, changedCount(0)
		, candidateCount(0)
		, candidateConfidence(0)
		, vc(inputVideo.c_str())
		, camName(camName)
#ifndef UI_OUTPUT
		, videoName(camName + ".mp4")
#endif
		, labelName(labelName) {
#ifndef UI_OUTPUT
			cv::namedWindow(camName);
#endif
		}
		
	VideoCap(size_t inputWidth,
			 size_t inputHeight,
			 const int inputVideo,
			 const string camName,
			 const string labelName)
		: inputWidth(inputWidth)
		, inputHeight(inputHeight)
		, lastCorrectCount(0)
		, totalCount(0)
		, currentCount(0)
		, changedCount(0)
		, candidateCount(0)
		, candidateConfidence(0)
		, vc(inputVideo)
		, camName(camName)
#ifndef UI_OUTPUT
		, videoName(camName + ".mp4")
#endif
		, labelName(labelName) {
#ifndef UI_OUTPUT
			cv::namedWindow(camName);
#endif
#ifdef LOOP_VIDEO
			isCam = true;
#endif
		}
		
#ifndef UI_OUTPUT
	int initVW(int height, int width)
	{
		vw.open(videoName, conf_fourcc, vc.get(cv::CAP_PROP_FPS), cv::Size(width, height), true);
		if (!vw.isOpened())
		{
			return 1;
		}
	}
#endif
};
