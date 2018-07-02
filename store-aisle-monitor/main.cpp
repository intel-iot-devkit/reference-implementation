/*
To generate heatmap , number of people in each frame & integrated video of the both
*/

// INCLUDING ALL THE DEPENDENCIES

#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/highgui.hpp>
#include <opencv2/videoio.hpp>
#include <opencv2/objdetect.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/video.hpp>
#include <iostream>
#include <ctime>
#include "opencv2/video/background_segm.hpp"
#include <stdlib.h>
#include  <string>


using namespace std;
using namespace cv;

int i=1,count_total=0;

string tostr (int x)
{
	    stringstream str;
	    str << x;
	    return str.str();
}

string currentDateTime()
{
    // Calculates the execution time while a particular iteration is being processed.
    time_t     now = time(0);
    struct tm  tstruct;
    char       buf[80];
    string char_to_string;
    tstruct = *localtime(&now);
    // Visit http://en.cppreference.com/w/cpp/chrono/c/strftime
    // for more information about date/time format
    strftime(buf, sizeof(buf), "%Y-%m-%d.%X", &tstruct);
    for(int i=0;i<19;i++)
    	char_to_string += buf[i];
    return char_to_string;
}

void time(Mat final_img, int path,int count)
{
		//Snaps are being saved into desired folders & a system call can be used to upload that particular snap into the cloud.
		char ind = count;
		string s,s1=".png";
		s =currentDateTime() +"_PC_"+tostr(ind)+ s1;

		if(path==1)
		{
			string scpy=s;
			s="PATH WHERE HEATMAP SNAPSHOTS SHOULD BE STORED"+s;
			imwrite(s,final_img);
			cout<<"Into path1"<<endl;
		}

		if(path==2)
		{
			string scpy=s;
			s="PATH WHERE COUNT SNAPSHOTS SHOULD BE STORED"+s;
			imwrite(s,final_img);
			cout<<"Into path2"<<endl;
		}

		if(path==3)
		{
			string scpy=s;
			s="PATH WHERE INTEGRATED SNAPSHOTS SHOULD BE STORED"+s;
			cout<<"Into path3"<<endl;
			imwrite(s,final_img);
			system(("./upload.sh "+s).c_str());
		}
		final_img.release();
	}


int detectAndDraw(const HOGDescriptor &hog, Mat &img)
{

	// This function detects the people & adjusts the bounding boxes accordingly .
	vector<Rect> found, found_filtered;
	char str[200];

	double t = (double) getTickCount();
	/*
	 Run the detector with default parameters. to get a higher hit-rate
	 (and more false alarms, respectively), decrease the hitThreshold and
	 groupThreshold (set groupThreshold to 0 to turn off the grouping completely).
	*/
	hog.detectMultiScale(img, found, 0, Size(8,8), Size(16,16),1.07,2);
	t = (double) getTickCount() - t;
	cout << "detection time = " << (t*1000./getTickFrequency()) << " ms" << endl;

	for(size_t i = 0; i < found.size(); i++ )
	{
		Rect r = found[i];
		size_t j;
		// Do not add small detections inside a bigger detection.
		for ( j = 0; j < found.size(); j++ )
			if ( j != i && (r & found[j]) == r )
				break;
		if ( j == found.size() )
			found_filtered.push_back(r);
	}

	for (size_t i = 0; i < found_filtered.size(); i++)
	{
		Rect r = found_filtered[i];
		// The HOG detector returns slightly larger rectangles than the real objects,
		// so we slightly shrink the rectangles to get a nicer output.
		r.x += cvRound(r.width*0.1);
		r.width = cvRound(r.width*0.8);
		r.y += cvRound(r.height*0.07);
		r.height = cvRound(r.height*0.8);
		rectangle(img, r.tl(), r.br(), Scalar(0,255,0), 3);
	}

	sprintf(str,"%lu people ",found_filtered.size());
	putText(img,str,Point2f(25,100),  FONT_HERSHEY_SIMPLEX,2,Scalar(255,0,0),4,true);
	cout << "People count: " << found_filtered.size() << endl;
    return found_filtered.size();
}

int setup(Mat &frame)
{
	int count=0;
	// This function is to set the HOG Descriptor attributes .
	HOGDescriptor hog;
	hog.setSVMDetector(HOGDescriptor::getDefaultPeopleDetector());
	count=detectAndDraw(hog, frame);
	return count;
}

int main()
{
	// Capturing video (loaded[name] or webcam[0])
	//string video_file;
	//cout<<"Enter the path for video: ";
	//cin>>video_file;

	VideoCapture cap("2.mp4");
	if(!cap.isOpened())
	{
		cout << "Error opening video stream or file" << endl;
		return -1;
	}

	// Frame calculation
	int count=0,nFrames = cap.get(CV_CAP_PROP_FRAME_COUNT);
	int fps = cap.get(CV_CAP_PROP_FPS);
	cout << "FRAMES PER SECOND ARE :"<< fps << "\n";

	// Default resolution of the frame is obtained.The default resolution is system dependent.
	int frame_width = cap.get(CV_CAP_PROP_FRAME_WIDTH) , frame_height = cap.get(CV_CAP_PROP_FRAME_HEIGHT);
	cout << "HEIGHT OF THE VIDEO IS ...." << frame_height << "\n" << "WIDTH OF THE VIDEO IS ...." << frame_width << endl;

	// Video saving APIs
	VideoWriter counter_video_object_file("counter_video.avi",CV_FOURCC('M','J','P','G'),10, Size(frame_width,frame_height));
	VideoWriter integrated_video_object_file("integrated_video.avi",CV_FOURCC('M','J','P','G'),10, Size(frame_width,frame_height));
	VideoWriter heatmap_video_object_file("heatmap_video.avi",CV_FOURCC('M','J','P','G'),10, Size(frame_width,frame_height));

	// begsegmentation pointer initialised
	Ptr<BackgroundSubtractorMOG2> background_segmentor_object_file = createBackgroundSubtractorMOG2();

	int first_iteration_indicator=1,i=1,c=1;
	Mat gray,accum_image,first_frame,frame;
	Mat frame_dup,fgbgmask,threshold_image,color_image;
	Mat result_overlay,accum_image_duplicate;
	Mat color_image1,duplicate_final,result_overlay_video,final_img;

	while(cap.isOpened())
	{
		cout << "Frame count : " << c << endl;
		cout << "frame :" << i << endl;
		if(c==(nFrames-1))
			break;
		cap.read(frame);
		if (first_iteration_indicator == 1)
		{
			// Saving the first frame to overlap all the accumilated colored segmentation's on this frame
			first_frame = frame.clone();
			
			// Converting to Grayscale
			cvtColor(frame,gray, COLOR_BGR2GRAY);
			
			// accum_image frame dimension initialisation
			Mat accum_image = Mat(frame_height,frame_width, CV_64F, double(0));
			first_iteration_indicator=0;
		}
		else
		{
			frame_dup = frame.clone();
			
			// Converting to Grayscale
			cvtColor(frame,gray, COLOR_BGR2GRAY);
			
			// Remove the background
			background_segmentor_object_file ->apply(gray,fgbgmask);
			// Thresholding the image
			int thres=2;
			int maxValue=2;
			threshold(fgbgmask,threshold_image,thres,maxValue,CV_THRESH_BINARY);
			
			// Adding to the accumilated image
			accum_image= threshold_image+accum_image;
			
			// Saving the accumilated image onto a duplicate frame to plot a live heatmap
			accum_image_duplicate = accum_image;
			applyColorMap(accum_image_duplicate, color_image1, COLORMAP_HOT);
			addWeighted(frame, 0.5, color_image1, 0.5,0.0, result_overlay_video);
			// Heatmap video generation
			heatmap_video_object_file.write(result_overlay_video);

			count=setup(frame_dup);
			// Counter video generation
			counter_video_object_file.write(frame_dup);

			// Integrated video generetion
			addWeighted(frame_dup,0.45,result_overlay_video,0.55,0.0,final_img);
			integrated_video_object_file.write(final_img);
			
			if(i==5*fps)
			{
				time(result_overlay_video,1,count);
				time(frame_dup,2,count);
				time(final_img,3,count);
				i=1;
			}
			accum_image_duplicate.release();
		}
		i++;
		c++;

		char msg[100];
		Mat pop_up = Mat::zeros(250, 750, CV_8UC3);
		sprintf(msg,"Press q to quit");
		putText(pop_up,msg,Point2f(100,100),  FONT_HERSHEY_SIMPLEX,2,Scalar(255,0,0),4,true);
		imshow("NOTE", pop_up);

		int key = (waitKey(30) & 0xFF);
		if(key =='q')
			break;

		frame.release();
	}
	
	// Adding all accumilated frames to the first frame
	applyColorMap(accum_image, color_image, COLORMAP_HOT);
	double alpha = 0.5; 
	double beta;
	beta = ( 1.0 - alpha );
	addWeighted( first_frame, alpha, color_image, beta,0.0, result_overlay);
	imwrite( "result_overlay_final.jpg",result_overlay);

	// When everything done, release the video capture and write object
	cout<<"out of while loop"<<endl;
	cap.release();
	// Closes all the windows
	destroyAllWindows();
	return 0;
}
