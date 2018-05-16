/*
 * Authors: Stefan Andritoiu <stefan.andritoiu@gmail.com>
 *          Serban Waltter <serban.waltter@rinftech.com>
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
#include <ctime>

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

static std::vector<bool> getUsedLabels(std::vector<string> *reqLabels,  std::vector<int> *labelPos,  std::vector<string> *labelNames) {
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
			(*labelPos).push_back(i);
			(*labelNames).push_back(label);
			++i;
		} else {
			usedLabels.push_back(false);
			(*labelPos).push_back(0);
		}
	}

	labelsFile.close();

	return usedLabels;
}



std::vector<VideoCap> getInput (std::ifstream *file, size_t width, size_t height, vector<string> *usedLabels)
{
	std::vector<VideoCap> streams;
	std::string str;
	int cams = 0;
	char camName[20];

	while (std::getline(*file, str))
	{
		int delim = str.find(':');
		if (str.substr(0, delim) == string("video"))
		{
			++cams;
			sprintf(camName, "Cam %d", cams);
			std::string path = str.substr(delim + 2);
			if (path.size() == 1 && *(path.c_str()) >= '0' && *(path.c_str()) <= '9')	// Get cam ID
			{
				streams.push_back(VideoCap(width, height,  0, camName, cams));
			}
			else{
				streams.push_back(VideoCap(width, height,  path, camName, cams));
			}
		}
		else if (str.substr(0, delim) == string("intruder"))
		{
			(*usedLabels).push_back(str.substr(delim + 2));
		} else
		{
			cout << "Unrecognized option; Ignoring\n";
		}
	}

	for (int i = 0; i < streams.size(); ++i)
	{
		streams[i].init((*usedLabels).size());
	}

	return streams;
}

void arrangeWindows(vector<VideoCap> *vidCaps, size_t width, size_t height)
{
	int spacer = 25;
	int cols = 0;
	int rows = 0;
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
	if (cols == conf_windowColumns)
	{
		cols = 0;
		++rows;
		moveWindow("Intruder Log", (spacer + width) * cols, (spacer + height) * rows);
	}
	else
	{
		moveWindow("Intruder Log", (spacer + width) * cols, (spacer + height) * rows);
	}
}

void saveJSON(vector<event> events, VideoCap vcap)
{

	ofstream evtJson("../../UI/resources/video_data/events.json");
	if(!evtJson.is_open())
	{
		cout << "Could not create JSON file" << endl;
		return;
	}

	ofstream dataJson("../../UI/resources/video_data/data.json");
	if(!dataJson.is_open())
	{
		cout << "Could not create JSON file" << endl;
		return;
	}

	int total;

	evtJson << "{\n\t\"video1\": {\n";
	dataJson << "{\n\t\"video1\": {\n";
	if (!events.empty()){
		int fps = vcap.vc.get(cv::CAP_PROP_FPS);
		int evts = static_cast<int>(events.size());
		int i = 0;
		for (; i < evts - 1; ++i)
		{
			evtJson << "\t\t\"" << i << "\":{\n";
			evtJson << "\t\t\t\"time\":\"" << events[i].time << "\",\n";
			evtJson << "\t\t\t\"content\":\"" << events[i].intruder << "\",\n";
			evtJson << "\t\t\t\"videoTime\":\"" << (float)events[i].frame / fps << "\"\n";
			evtJson << "\t\t},\n";

			dataJson << "\t\t\"" << (float)events[i].frame / fps << "\": \"" << events[i].count << "\",\n";
		}

		evtJson << "\t\t\"" << i << "\":{\n";
		evtJson << "\t\t\t\"time\":\"" << events[i].time << "\",\n";
		evtJson << "\t\t\t\"content\":\"" << events[i].intruder << "\",\n";
		evtJson << "\t\t\t\"videoTime\":\"" << (float)events[i].frame / fps << "\"\n";
		evtJson << "\t\t}\n";

		dataJson << "\t\t\"" << (float)events[i].frame / fps << "\": \"" << events[i].count << "\"\n";
		total = events[i].count;
	}
	evtJson << "\t}\n";
	evtJson << "}";

	dataJson << "\t},\n";
	dataJson << "\t\"totals\":{\n";
	dataJson << "\t\t\"video1\": \"" << total << "\"\n";
	dataJson << "\t}\n";
	dataJson << "}";
}

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
				const InferenceEngine::SizeVector>(Precision::FP32, outputDims);
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
	/* Requested labels */
	std::vector<string> reqLabels;

	vidCaps = getInput(&confFile, inputDims[1], inputDims[0], &reqLabels);

	const size_t input_width = vidCaps[0].vc.get(CV_CAP_PROP_FRAME_WIDTH);
	const size_t input_height = vidCaps[0].vc.get(CV_CAP_PROP_FRAME_HEIGHT);
	const size_t output_width = inputDims[1];
	const size_t output_height = inputDims[0];

	/* Initializing VideoWriter for each source */
	for (auto &vidCapObj : vidCaps)
	{
		if(vidCapObj.initVW(output_height, output_width))
		{
			cout << "Could not open " << vidCapObj.videoName << " for writing\n";
			return 4;
		}
	}

	namedWindow("Intruder Log", CV_WINDOW_AUTOSIZE);
	Mat logs;
	arrangeWindows(&vidCaps, output_width, output_height);

	Mat frame, frameInfer;
	Mat* output_frames = new Mat[conf_batchSize];

	auto input_channels = inputDims[2];  // channels for color format.  RGB=4
	auto channel_size = output_width * output_height;
	auto input_size = channel_size * input_channels;
	bool no_more_data = false;

	// Read class names
	vector<int> labelPos; // used label position in labels file
	vector<string> labelNames;
	std::vector<bool> usedLabels = getUsedLabels(&reqLabels,  &labelPos,  &labelNames);
	if (usedLabels.empty()) {
		std::cout
				<< "Error: No labels currently in use. Please edit conf.txt file"
				<< std::endl;
		return 1;
	}

	ofstream logFile("intruders.log");
	if(!logFile.is_open())
	{
		cout << "Could not create log file\n";
		return 3;
	}

	list<string> logList;
	int rollingLogSize = (output_height - 15) / 20;
	vector<event> events;
	int frames = 0;

	int totalCount = 0;

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

			for (size_t mb = 0; mb < conf_batchSize; mb++) {

				float *box = detectionOutArray->data() + outputSize * mb;

				for (int i = 0; i < vidCapObj.noLabels; ++i)
				{
					vidCapObj.currentCount[i] = 0;
					vidCapObj.changedCount[i] = false;
				}

				//---------------------------
				// parse SSD output
				//---------------------------
				for (int c = 0; c < maxProposalCount; c++) {
					float *localbox = &box[c * 7];
					float image_id = localbox[0];
					float label = localbox[1] - 1;
					float confidence = localbox[2];

					int labelnum = (int) label;
					if ((confidence > conf_thresholdValue) && usedLabels[labelnum]) {

						int pos = labelPos[labelnum];
						vidCapObj.currentCount[pos]++;

						float xmin = localbox[3] * output_width;
						float ymin = localbox[4] * output_height;
						float xmax = localbox[5] * output_width;
						float ymax = localbox[6] * output_height;

						char tmplabel[32];
						rectangle(output_frames[mb],
								Point((int) xmin, (int) ymin),
								Point((int) xmax, (int) ymax),
								Scalar(0, 255, 0), 4, LINE_AA, 0);
					}
				}

				for (int i = 0; i < vidCapObj.noLabels; ++i)
				{
					if (vidCapObj.candidateCount[i] == vidCapObj.currentCount[i])
						vidCapObj.candidateConfidence[i]++;
					else {
						vidCapObj.candidateConfidence[i] = 0;
						vidCapObj.candidateCount[i] = vidCapObj.currentCount[i];
					}

					if (vidCapObj.candidateConfidence[i] == conf_candidateConfidence) {
						vidCapObj.candidateConfidence[i] = 0;
						vidCapObj.changedCount[i] = true;
					}
					else
						continue;

					if (vidCapObj.currentCount[i] > vidCapObj.lastCorrectCount[i]) {
						vidCapObj.totalCount[i] += vidCapObj.currentCount[i] - vidCapObj.lastCorrectCount[i];
						time_t t = time(nullptr);
						tm *currTime = localtime(&t);
						int detObj = vidCapObj.currentCount[i] - vidCapObj.lastCorrectCount[i];
						char str[50];
						for (int j = 0; j < detObj; ++j)
						{
							sprintf(str,"%02d:%02d:%02d - Intruder %s detected on %s", currTime->tm_hour, currTime->tm_min, currTime->tm_sec, labelNames[i].c_str(), vidCapObj.camName.c_str());
							logList.emplace_back(str);
							sprintf(str,"%s\n", str);
							cout << str;
							logFile << str;
							if (logList.size() > rollingLogSize)
							{
								logList.pop_front();
							}
							event evt;
							sprintf(evt.time,"%02d:%02d:%02d", currTime->tm_hour, currTime->tm_min, currTime->tm_sec);
							evt.intruder = labelNames[i];
							evt.frame = frames;
							evt.count = ++totalCount;
							events.push_back(evt);
						}
						// Saving image when detection occurs
						sprintf(str, "./caps/%d%d_%s.jpg", currTime->tm_hour, currTime->tm_min, labelNames[i].c_str());
						imwrite(str, output_frames[mb]);
					}

					vidCapObj.lastCorrectCount[i] = vidCapObj.currentCount[i];

				}
				++frames;
			}

			//---------------------------
			// Output/render
			//---------------------------

			for (int mb = 0; mb < conf_batchSize; mb++) {
				vidCapObj.vw.write(output_frames[mb]);

				int i = 0;
				logs = Mat(output_height, output_width > 410 ? output_width:410, CV_8UC1, Scalar(0));
				for (list<string>::iterator it = logList.begin(); it != logList.end(); ++it)
				{
					putText(logs, *it, Point(10, 15 + 20 * i), CV_FONT_HERSHEY_SIMPLEX, 0.5, Scalar(255, 255, 255), 1, 8, false);
					++i;
				}
				cv::imshow(vidCapObj.camName, output_frames[mb]);
				cv::imshow("Intruder Log", logs);

				if (waitKey(1) == 27)
				{
					saveJSON(events, vidCaps[0]);
					return 0;
				}

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

	saveJSON(events, vidCaps[0]);

	delete[] output_frames;

	return 0;
}
