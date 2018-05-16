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

#include <iostream>
#include <algorithm>

#include "opencv2/opencv.hpp"
#include "opencv2/photo/photo.hpp"
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/video/video.hpp"

#include <ie_icnn_net_reader.h>
#include <ie_device.hpp>
#include <ie_plugin_config.hpp>
#include <ie_plugin_dispatcher.hpp>
#include <ie_plugin_ptr.hpp>
#include <inference_engine.hpp>

#include <ie_extension.h>
#include <ext_list.hpp>

#include <videocap.hpp>

using namespace cv;
using namespace InferenceEngine::details;
using namespace InferenceEngine;

void getModelPath (ifstream *file)
{
	getline(*file, conf_modelPath);
	getline(*file, conf_binFilePath);
	getline(*file, conf_labelsFilePath);
}


static InferenceEngine::InferenceEnginePluginPtr loadPlugin(
		TargetDevice myTargetDevice) {
	InferenceEngine::PluginDispatcher dispatcher( { "" });

	return static_cast<InferenceEngine::InferenceEnginePluginPtr>(dispatcher.getSuitablePlugin(
			myTargetDevice));
}

static void configureNetwork(InferenceEngine::CNNNetReader &network,
		TargetDevice myTargetDevice) {
	try {
		network.ReadNetwork(conf_modelPath);
	} catch (InferenceEngineException ex) {
		std::cerr << "Failed to load network: " << std::endl;
	}

	network.ReadWeights(conf_binFilePath);

	// set the target device
	network.getNetwork().setTargetDevice(myTargetDevice);

	// Set batch size
	network.getNetwork().setBatchSize(conf_batchSize);
}

static std::vector<bool> getUsedLabels(std::vector<VideoCap> &vidCaps, std::vector<string> *reqLabels) {
	std::vector<bool> usedLabels;

	std::ifstream labelsFile(conf_labelsFilePath);

	if (!labelsFile.is_open()) {
		std::cout << "Could not open labels file" << std::endl;
		return usedLabels;
	}

	std::string label;
	int i = 0;
	while (getline(labelsFile, label)) {
		if (std::find((*reqLabels).begin(), (*reqLabels).end(), label) != (*reqLabels).end()) {
			usedLabels.push_back(true);
			for (auto &v : vidCaps) {
				if (v.labelName == label) {
					v.label = i;
				}
			}
		} else {
			usedLabels.push_back(false);
		}
		++i;
	}

	labelsFile.close();

	return usedLabels;
}

std::vector<VideoCap> getVideos (std::ifstream *file, size_t width, size_t height, vector<string> *reqLabels)
{
	std::vector<VideoCap> videos;
	std::string str;
	int cams = 0;
	char camName[20];

	while (std::getline(*file, str))
	{
		int delim = str.rfind(' ');
		++cams;
		sprintf(camName, "Video %d", cams);
		string path =  str.substr(0, delim);
		if (path.size() == 1 && *(path.c_str()) >= '0' && *(path.c_str()) <= '9')
		{
			videos.push_back(VideoCap(width, height,  std::stoi(path), camName, str.substr(delim + 1)));
		}
		else
		{
			videos.push_back(VideoCap(width, height,  path, camName, str.substr(delim + 1)));
		}
		(*reqLabels).push_back(str.substr(delim + 1));
	}
	return videos;
}

#ifdef UI_OUTPUT
int saveJSON (vector<VideoCap> &vidCaps, vector<string> frameNames)
{
	/**
	 * This JSON contains info about current and total object count.
	 */
	ofstream dataJSON(conf_dataJSON_file);
	if(!dataJSON.is_open())
	{
		cout << "Could not open dataJSON file" << endl;
		return 5;
	}

	/*
	 * This JSON contains the next frames to be processed by the UI.
	 */
	ofstream videoJSON(conf_videJSON_file);
	if(!videoJSON.is_open())
	{
		cout << "Could not open videoJSON file" << endl;
		return 5;
	}

	int i = 0;
	int j;
	char str[50];
	dataJSON << "{\n";
	videoJSON << "{\n";
	int vsz = static_cast<int>(vidCaps.size());
	int fsz;
	for (; i < vsz; ++i)
	{
		if (vidCaps[i].countAtFrame.size() > 0)
		{
			j = 0;
			dataJSON << "\t\"Video_" << i + 1 << "\": {\n";
			fsz = static_cast<int>(vidCaps[i].countAtFrame.size()) - 1;
			for (; j < fsz; ++j)
			{
				//sprintf(str, "\t\t\"%d\" : \"%d\",\n", vidCaps[i].countAtFrame[j].first, vidCaps[i].countAtFrame[j].second);
				sprintf(str, "\t\t\"%d\": {\n\t\t\t\"count\":\"%d\",\n\t\t\t\"time\":\"%s\"\n\t\t},\n", 
								vidCaps[i].countAtFrame[j].frameNo, vidCaps[i].countAtFrame[j].count, vidCaps[i].countAtFrame[j].timestamp);
				dataJSON << str;
			}
			//sprintf(str, "\t\t\"%d\" : \"%d\"\n", vidCaps[i].countAtFrame[j].first, vidCaps[i].countAtFrame[j].second);
			sprintf(str, "\t\t\"%d\": {\n\t\t\t\"count\":\"%d\",\n\t\t\t\"time\":\"%s\"\n\t\t}\n", 
								vidCaps[i].countAtFrame[j].frameNo, vidCaps[i].countAtFrame[j].count, vidCaps[i].countAtFrame[j].timestamp);
			dataJSON << str;
			dataJSON << "\t},\n";
		}
	}

	dataJSON << "\t\"totals\": {\n";
	for (i = 0; i < vsz - 1; ++i)
	{
		dataJSON << "\t\t\"Video_" << i + 1 << "\": \"" << vidCaps[i].totalCount << "\",\n";
	}
	dataJSON << "\t\t\"Video_" << i + 1 << "\": \"" << vidCaps[i].totalCount << "\"\n";
	dataJSON << "\t}\n";

	dataJSON << "}";

	dataJSON.close();

	int sz = static_cast<int>(frameNames.size()) - 1;
	for (i = 0; i < sz; ++i)
	{
		videoJSON << "\t\"" << i + 1 << "\":\"" << frameNames[i] << "\",\n";
	}
	videoJSON << "\t\"" << i + 1 << "\":\"" << frameNames[i] << "\"\n";
	videoJSON << "}";
	videoJSON.close();
	return 0;
}
#else
void arrangeWindows(vector<VideoCap> *vidCaps, size_t width, size_t height)
{
	int spacer = 25;
	int cols = 0;
	int rows = 0;

	// Arrange video windows
	for (int i = 0; i < (*vidCaps).size(); ++i)
	{
		if (cols == conf_windowColumns)
		{
			cols = 0;
			++rows;
			moveWindow((*vidCaps)[i].camName, (spacer + width) * cols, (spacer + height) * rows);
			++cols;
		}
		else
		{
			moveWindow((*vidCaps)[i].camName, (spacer + width) * cols, (spacer + height) * rows);
			++cols;
		}
	}

	// Arrange statistics window
	if (cols == conf_windowColumns)
	{
		cols = 0;
		++rows;
		moveWindow("Statistics", (spacer + width) * cols, (spacer + height) * rows);
	}
	else
	{
		moveWindow("Statistics", (spacer + width) * cols, (spacer + height) * rows);
	}
}

int saveJSON (vector<VideoCap> &vidCaps)
{
	/**
	 * This JSON contains info about current and total object count.
	 * It is saved at the end of the program.
	 */
	ofstream dataJSON(conf_dataJSON_file);
	if(!dataJSON.is_open())
	{
		cout << "Could not open JSON file" << endl;
		return 5;
	}

	int i = 0;
	int j;
	char str[10];
	dataJSON << "{\n";
	int vsz = static_cast<int>(vidCaps.size());
	int fsz;
	for (; i < vsz; ++i)
	{
		if (vidCaps[i].countAtFrame.size() > 0)
		{
			j = 0;
			dataJSON << "\t\"Video_" << i + 1 << "\": {\n";
			fsz = static_cast<int>(vidCaps[i].countAtFrame.size()) - 1;
			for (; j < fsz; ++j)
			{
				sprintf(str, "\t\t\"%.2f\" : \"%d\",\n", (float)vidCaps[i].countAtFrame[j].first / vidCaps[i].vc.get(cv::CAP_PROP_FPS), vidCaps[i].countAtFrame[j].second);
				dataJSON << str;
			}
			sprintf(str, "\t\t\"%.2f\" : \"%d\"\n", (float)vidCaps[i].countAtFrame[j].first / vidCaps[i].vc.get(cv::CAP_PROP_FPS), vidCaps[i].countAtFrame[j].second);
			dataJSON << str;
			dataJSON << "\t},\n";
		}
	}

	dataJSON << "\t\"totals\": {\n";
	for (i = 0; i < vsz - 1; ++i)
	{
		dataJSON << "\t\t\"Video_" << i + 1 << "\": \"" << vidCaps[i].totalCount << "\",\n";
	}
	dataJSON << "\t\t\"Video_" << i + 1 << "\": \"" << vidCaps[i].totalCount << "\"\n";
	dataJSON << "\t}\n";
	dataJSON << "}";
	dataJSON.close();

	return 0;
}
#endif

int main(int argc, char **argv) {

	std::ifstream confFile(conf_file);
	if (!confFile.is_open())
	{
		cout << "Could not open config file" << endl;
		return 2;
	}
	getModelPath(&confFile);

	/**
	 * Inference engine initialization
	 */
	TargetDevice myTargetDevice =
			(conf_targetDevice == "GPU") ?
					TargetDevice::eGPU : TargetDevice::eCPU;

	// NOTE: Load plugin first.
	InferenceEngine::InferenceEnginePluginPtr p_plugin = loadPlugin(
			myTargetDevice);

	// NOTE: Configure the network.
	InferenceEngine::CNNNetReader network;
	configureNetwork(network, myTargetDevice);

	// NOTE: set input configuration
	InputsDataMap inputs;

	inputs = network.getNetwork().getInputsInfo();

	if (inputs.size() != 1) {
		std::cout << "This sample accepts networks having only one input."
				<< std::endl;
		return 1;
	}

	InferenceEngine::SizeVector inputDims = inputs.begin()->second->getDims();

	if (inputDims.size() != 4) {
		std::cout << "Not supported input dimensions size, expected 4, got "
				<< inputDims.size() << std::endl;
	}

	std::string imageInputName = inputs.begin()->first;
	DataPtr image = inputs[imageInputName]->getInputData();
	inputs[imageInputName]->setInputPrecision(Precision::FP32);

	// Allocate input blobs
	InferenceEngine::BlobMap inputBlobs;
	InferenceEngine::TBlob<float>::Ptr pInputBlobData =
			InferenceEngine::make_shared_blob<float,
					const InferenceEngine::SizeVector>(Precision::FP32, inputDims);
	pInputBlobData->allocate();

	inputBlobs[imageInputName] = pInputBlobData;

	// Add CPU Extensions
	InferencePlugin plugin(p_plugin);
	if ((conf_targetDevice.find("CPU") != std::string::npos)) {
	// Required for support of certain layers in CPU
		plugin.AddExtension(std::make_shared<Extensions::Cpu::CpuExtensions>());
	}


	// Load model into plugin

	InferenceEngine::ResponseDesc dsc;

	InferenceEngine::StatusCode sts = p_plugin->LoadNetwork(
			network.getNetwork(), &dsc);
	if (sts != 0) {
		std::cout << "Error loading model into plugin: " << dsc.msg
				<< std::endl;
		return 1;
	}

	//  Inference engine output setup

	// --------------------
	// get output dimensions
	// --------------------
	InferenceEngine::OutputsDataMap outputsDataMap;
	outputsDataMap = network.getNetwork().getOutputsInfo();
	InferenceEngine::BlobMap outputBlobs;

	std::string outputName = outputsDataMap.begin()->first;

	int maxProposalCount = -1;

	for (auto && item : outputsDataMap) {
		InferenceEngine::SizeVector outputDims = item.second->dims;

		InferenceEngine::TBlob<float>::Ptr output;
		output = InferenceEngine::make_shared_blob<float,
				const InferenceEngine::SizeVector>(Precision::FP32,
				outputDims);
		output->allocate();

		outputBlobs[item.first] = output;
		maxProposalCount = outputDims[1];
	}

	InferenceEngine::SizeVector outputDims =
			outputBlobs.cbegin()->second->dims();
	size_t outputSize = outputBlobs.cbegin()->second->size() / conf_batchSize;

	/* Video loading */
	/* Create VideoCap objects for all cams. */
	std::vector<VideoCap> vidCaps;
	/* Requested label for each video */
	std::vector<string> reqLabels;

	vidCaps = getVideos(&confFile, inputDims[1], inputDims[0], &reqLabels);

	const size_t input_width = vidCaps[0].vc.get(CV_CAP_PROP_FRAME_WIDTH);
	const size_t input_height = vidCaps[0].vc.get(CV_CAP_PROP_FRAME_HEIGHT);
	const size_t output_width = inputDims[1];
	const size_t output_height = inputDims[0];
	
#ifndef UI_OUTPUT
	/* Create video writer for every input source */
	for (auto &vidCapObj : vidCaps)
	{
		if(vidCapObj.initVW(output_height, output_width))
		{
			cout << "Could not open " << vidCapObj.videoName << " for writing\n";
			return 4;
		}
	}

	namedWindow("Statistics", CV_WINDOW_AUTOSIZE);

	arrangeWindows(&vidCaps, output_width, output_height);
	Mat stats;
#endif

	Mat frame, frameInfer;
	Mat* output_frames = new Mat[conf_batchSize];

	auto input_channels = inputDims[2];  // channels for color format.  RGB=4
	auto channel_size = output_width * output_height;
	auto input_size = channel_size * input_channels;
	bool no_more_data = false;

	// Read class names
	std::vector<bool> usedLabels = getUsedLabels(vidCaps, &reqLabels);
	if (usedLabels.empty()) {
		std::cout
				<< "Error: No labels currently in use. Please edit videocap.hpp file"
				<< std::endl;
		return 1;
	}

#ifdef UI_OUTPUT
	vector<string> frameNames;
#else
	list<string> logList;
	int rollingLogSize = (output_height - 15) / 20;
#endif

	/* Main loop starts here. */
	for (;;) {
		for (auto &vidCapObj : vidCaps) {
			for (size_t mb = 0; mb < conf_batchSize; mb++) {
				float* inputPtr = pInputBlobData.get()->data()
						+ input_size * mb;

				//---------------------------
				// get a new frame
				//---------------------------
				vidCapObj.vc.read(frame);

				if (!frame.data) {
					no_more_data = true;
					break;  //frame input ended
				}

				//---------------------------
				// resize to expected size (in model .xml file)
				//---------------------------

				// Input frame is resized to infer resolution
				resize(frame, output_frames[mb],
						Size(output_width, output_height));
				frameInfer = output_frames[mb];

				//---------------------------
				// PREPROCESS STAGE:
				// convert image to format expected by inference engine
				// IE expects planar, convert from packed
				//---------------------------
				size_t framesize = frameInfer.rows * frameInfer.step1();

				if (framesize != input_size) {
					std::cout << "input pixels mismatch, expecting "
							<< input_size << " bytes, got: " << framesize
							<< endl;
					return 1;
				}

				// store as planar BGR for Inference Engine
				// imgIdx = image pixel counter
				// channel_size = size of a channel, computed as image size in bytes divided by number of channels, or image width * image height
				// input_channels = 3 for RGB image
				// inputPtr = a pointer to pre-allocated inout buffer
				for (size_t i = 0, imgIdx = 0, idx = 0; i < channel_size;
						i++, idx++) {
					for (size_t ch = 0; ch < input_channels; ch++, imgIdx++) {
						inputPtr[idx + ch * channel_size] =
								frameInfer.data[imgIdx];
					}
				}

			}

			if (no_more_data) {
				break;
			}

			//---------------------------
			// INFER STAGE
			//---------------------------
			sts = p_plugin->Infer(inputBlobs, outputBlobs, &dsc);
			if (sts != 0) {
				std::cout << "An infer error occurred: " << dsc.msg
						<< std::endl;
				return 1;
			}
			//---------------------------
			// POSTPROCESS STAGE:
			// parse output
			//---------------------------
			InferenceEngine::Blob::Ptr detectionOutBlob =
					outputBlobs[outputName];
			const InferenceEngine::TBlob<float>::Ptr detectionOutArray =
					std::dynamic_pointer_cast<InferenceEngine::TBlob<float>>(
							detectionOutBlob);
#ifdef UI_OUTPUT
			int frames = vidCapObj.frames;
#endif
			for (size_t mb = 0; mb < conf_batchSize; mb++) {

				float *box = detectionOutArray->data() + outputSize * mb;

				vidCapObj.currentCount = 0;
				vidCapObj.changedCount = false;

				//---------------------------
				// parse SSD output
				//---------------------------
				for (int c = 0; c < maxProposalCount; c++) {
					float *localbox = &box[c * 7];
					float image_id = localbox[0];
					float label = localbox[1] - 1;
					float confidence = localbox[2];

					int labelnum = (int) label;
					if ((confidence > conf_thresholdValue)
							&& usedLabels[labelnum]
							&& (vidCapObj.label == labelnum)) {


						vidCapObj.currentCount++;

						float xmin = localbox[3] * output_width;
						float ymin = localbox[4] * output_height;
						float xmax = localbox[5] * output_width;
						float ymax = localbox[6] * output_height;

						rectangle(output_frames[mb],
								Point((int) xmin, (int) ymin),
								Point((int) xmax, (int) ymax),
								Scalar(0, 255, 0), 4, LINE_AA, 0);
					}
				}

				if (vidCapObj.candidateCount == vidCapObj.currentCount)
					vidCapObj.candidateConfidence++;
				else {
					vidCapObj.candidateConfidence = 0;
					vidCapObj.candidateCount = vidCapObj.currentCount;
				}

				if (vidCapObj.candidateConfidence == conf_candidateConfidence) {
					vidCapObj.candidateConfidence = 0;
					vidCapObj.changedCount = true;
				}
				else
				{
#ifdef UI_OUTPUT
					frames++;
#else
					vidCapObj.frames++;
#endif
					continue;
				}

				if (vidCapObj.currentCount > vidCapObj.lastCorrectCount) {
					vidCapObj.totalCount += vidCapObj.currentCount - vidCapObj.lastCorrectCount;

				}

				if(vidCapObj.currentCount != vidCapObj.lastCorrectCount) {
					time_t t = time(nullptr);
					tm *currTime = localtime(&t);
#ifdef UI_OUTPUT
					frameInfo fr;
					fr.frameNo = frames;
					fr.count = vidCapObj.currentCount;
					sprintf(fr.timestamp, "%02d:%02d:%02d", currTime->tm_hour, currTime->tm_min, currTime->tm_sec);
					vidCapObj.countAtFrame.push_back(fr);
#else
					vidCapObj.countAtFrame.emplace_back(vidCapObj.frames, vidCapObj.currentCount);
					int detObj = vidCapObj.currentCount - vidCapObj.lastCorrectCount;
					char str[50];
					for (int j = 0; j < detObj; ++j)
					{
						sprintf(str,"%02d:%02d:%02d - %s detected on %s", currTime->tm_hour, currTime->tm_min, currTime->tm_sec, vidCapObj.labelName.c_str(), vidCapObj.camName.c_str());
						logList.emplace_back(str);
						sprintf(str,"%s\n", str);
						if (logList.size() > rollingLogSize)
						{
							logList.pop_front();
						}
					}
#endif
				}
#ifdef UI_OUTPUT
				frames++;
#else
				vidCapObj.frames++;
#endif

				vidCapObj.lastCorrectCount = vidCapObj.currentCount;
			}

			//---------------------------
			// Output/render
			//---------------------------

			for (int mb = 0; mb < conf_batchSize; mb++) {
#ifdef UI_OUTPUT
				// Saving frames for real-time UI
				string imgName(vidCapObj.camName);
				replace(imgName.begin(), imgName.end(),' ','_');
				vidCapObj.frames++;
				imgName += '_' + to_string(vidCapObj.frames);
				frameNames.emplace_back(imgName);
				imgName = conf_videoDir + imgName +  ".jpg";
				imwrite(imgName, output_frames[mb]);

				int a;
				if(a = saveJSON(vidCaps, frameNames)) // Save JSONs for Live UI
				{
					return a;
				}
#else
				vidCapObj.vw.write(output_frames[mb]);

				/* Add log text to each frame */
				std::ostringstream s;
				s << "Total " << vidCapObj.labelName << " count: " << vidCapObj.totalCount;
				cv::putText(output_frames[mb], s.str(), cv::Point(10, output_height - 10), CV_FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(255, 255, 255), 1, 8, false);
				s.str("");
				s.clear();
				s << "Current " << vidCapObj.labelName << " count: " <<vidCapObj.lastCorrectCount;
				cv::putText(output_frames[mb], s.str(), cv::Point(10, output_height - 30), CV_FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(255, 255, 255), 1, 8, false);

				// Show current frame and update statistics window
				cv::imshow(vidCapObj.camName, output_frames[mb]);

				stats = Mat(output_height > (vidCaps.size() * 20 + 15) ? output_height : (vidCaps.size() * 20 + 15), output_width > 345 ? output_width : 345, CV_8UC1, Scalar(0));

				int i = 0;
				for (list<string>::iterator it = logList.begin(); it != logList.end(); ++it)
				{
					putText(stats, *it, Point(10, 15 + 20 * i), CV_FONT_HERSHEY_SIMPLEX, 0.5, Scalar(255, 255, 255), 1, 8, false);
					++i;
				}

				cv::imshow("Statistics", stats);

				/**
				 * Show frame as soon as possible and exit if ESC key is pressed and window is active.
				 * waitKey takes miliseconds as argument.
				 * waitKey(1) is recommended for camera input. If processing is faster than input
				 * the application will wait for next frame on capture.
				 * You can use vidCaps[0].vc.get(cv::CAP_PROP_FPS) to use the FPS of the 1st video.
				 */
				if (waitKey(1) == 27)
				{
					saveJSON(vidCaps);
					delete[] output_frames;
					cout << "Finished\n";
					return 0;
				}
#endif
#ifdef LOOP_VIDEO
				if (!vidCapObj.isCam)
				{
					vidCapObj.loopFrames++;
					if (vidCapObj.loopFrames == vidCapObj.vc.get(CV_CAP_PROP_FRAME_COUNT))
					{
						vidCapObj.loopFrames = 0;
						vidCapObj.vc.set(CV_CAP_PROP_POS_FRAMES, 0);
					}
				}
#endif

			}
		}

		if (no_more_data) {
			break;
		}
	}

	delete[] output_frames;

	cout << "Finished\n";

	return 0;
}
