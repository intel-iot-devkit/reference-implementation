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
#include "opencv2/highgui/highgui.hpp"

using namespace std;

static const string conf_targetDevice = "CPU";
static string conf_modelPath;
static string conf_binFilePath;
static string conf_labelsFilePath;
static const string conf_file = "../resources/conf.txt";
static const size_t conf_batchSize = 1;
static const int conf_windowColumns = 5; // OpenCV windows per each row

static const int conf_fourcc = CV_FOURCC('H','2','6','4');

static const double conf_thresholdValue = 0.12;
static const int conf_candidateConfidence = 3;

typedef struct {
	char time[25];
	string intruder;
	int count;
	int frame;
} event;

class VideoCap {
public:
	size_t inputWidth;
	size_t inputHeight;
	const string inputVideo;

	int noLabels; // Number of labels
	vector<int> lastCorrectCount;
	vector<int> totalCount;
	vector<int> currentCount;
	vector<bool> changedCount;

	vector<int> candidateCount;
	vector<int> candidateConfidence;

	vector<string> labelName;

	cv::VideoCapture vc;
	cv::VideoWriter vw;

#ifdef LOOP_VIDEO
	int loopFrames = 0;
	bool isCam = false;
#endif

	const string camName;
	const string videoName;

	VideoCap(size_t inputWidth,
			 size_t inputHeight,
			 const string inputVideo,
			 const string camName,
			 int number)
		: inputWidth(inputWidth)
		, inputHeight(inputHeight)
		, inputVideo(inputVideo)
		, vc(inputVideo.c_str())
		, camName(camName)
		, videoName("../../UI/resources/videos/video" + to_string(number) + ".mp4") {
			cv::namedWindow(camName);
		}

	VideoCap(size_t inputWidth,
			 size_t inputHeight,
			 const int inputVideo,
			 const string camName,
			 int number)
		: inputWidth(inputWidth)
		, inputHeight(inputHeight)
		, inputVideo("stream")
		, vc(inputVideo)
		, camName(camName)
		, videoName("../../UI/resources/videos/video" + to_string(number) + ".mp4") {
			cv::namedWindow(camName);
#ifdef LOOP_VIDEO
			isCam = true;
#endif
		}

	void init (int size)
	{
		noLabels = size;
		lastCorrectCount = vector<int>(size);
		totalCount = vector<int>(size);
		currentCount = vector<int>(size);
		changedCount = vector<bool>(size);
		candidateCount = vector<int>(size);
		candidateConfidence = vector<int>(size);
		labelName = vector<string>(size);
	}

	int initVW(int height, int width)
	{
		vw.open(videoName, conf_fourcc, vc.get(cv::CAP_PROP_FPS), cv::Size(width, height), true);
		if (!vw.isOpened())
		{
			return 1;
		}
	}
};
