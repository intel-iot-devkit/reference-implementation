#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include<opencv2/ml.hpp>
#include <iostream>
#include<opencv2/core/core.hpp>
#include <stdio.h>
#include <stdlib.h>
#include <ctime>
#include "opencv2/video/background_segm.hpp"
#include<string>
#include<string.h>
#include<sstream>

using namespace cv;
using namespace std;

using namespace cv::ml;
char command[128];
char str[200];
const int MIN_CONTOUR_AREA = 100;
const int RESIZED_IMAGE_WIDTH = 20;
const int RESIZED_IMAGE_HEIGHT = 30;

void drawAxis(Mat&, Point, Point, Scalar, const float);
double getOrientation(const vector<Point> &, Mat&);


void Counting_Object()
{
	VideoCapture cap("video.avi");
	int count = 0;
	//char str[200];
	char temp;
	Mat fgbgmask , image , img_erod , contours , canny_output;
	//Ptr<bgsegm::BackgroundSubtractorMOG> mog = bgsegm::createBackgroundSubtractorMOG();
	Ptr<BackgroundSubtractorMOG2> mog = createBackgroundSubtractorMOG2();

	if(cap.isOpened())
	{
		cout << "Capture is opened" << endl;
		for(;;)
		{
			cap >> image;
			if(image.empty())
				break;

			mog ->apply(image,fgbgmask);
			erode(fgbgmask,img_erod,Mat());
			/// Get the moments
			//find_moments(img_erod);
			vector<vector<Point> > contours;
			vector<Vec4i> hierarchy;



			/// Detect edges using canny
			Canny( img_erod, canny_output, 50, 150, 3 );
			/// Find contours
			findContours( canny_output, contours, hierarchy, CV_RETR_TREE, CV_CHAIN_APPROX_SIMPLE, Point(0, 0) );

			/// Get the moments
			vector<Moments> mu(contours.size() );
			for( int i = 0; i < contours.size(); i++ )
			{
				mu[i] = moments( contours[i], false );
			}

			//cout<<"You r here"<<endl;

			int x,y;
			///  Get the mass centers:
			vector<Point2f> mc( contours.size() );
			for( int i = 0; i < contours.size(); i++ )
				//{ mc[i] = Point2f( mu[i].m10/mu[i].m00 , mu[i].m01/mu[i].m00 ); }
			{

				if (mu[i].m00 >= 300)
				{
					//cout<<mu[i].m00<<endl;
					//cout<<"inside the for loop "<<endl;
					x = mu[i].m10/mu[i].m00;
					y = mu[i].m01/mu[i].m00;

					//cout<<"The x coordinate:"<<x<<endl;
					cout<<"The y coordinate:"<<y<<endl;
					cout<<x<<'\t'<<y<<endl;
					if((x>256 and x<265 and y > 59 and y <90)or(x>291 and x<295 and y > 51 and y<54) or (x>227 and x<230 and y>60 and y<65))
					{
						count = count +1;
						int temp = count;
						//Life saver
						snprintf(command,sizeof(command),"./up.sh %d",temp);
						system(command);
					}


				}
			}




			imshow("Canny output",canny_output);
			sprintf(str,"%d object detected",count/2);
			putText(image, str, Point(5,100), FONT_HERSHEY_DUPLEX, 1, Scalar(255,0,0), 2);
			imshow("image",image);
			//imshow("fggbmask",fgbgmask);
			//imshow("img_erode",img_erod);
			waitKey(10);
		}
	}

}


void Color_Detection()
{

	Size size(500,500);
	VideoCapture capture("live2.mp4");
	Mat frame;

	if(!capture.isOpened())
	{
		cout << "Problem loading video!!!" << endl;

	}

	VideoCapture cap("live2.mp4");
	int i =0;
	for(;;)
	{
		cap >> frame;
		if(frame.empty())
			break;
		i++;
		if(i%1 == 0)
		{

			Mat gray , threshold  , erod;

			cvtColor(frame, gray, CV_BGR2GRAY);
			cv::threshold(gray,threshold,200,255,THRESH_BINARY);
			erode(threshold,erod,Mat());


			//Find the contours. Use the contourOutput Mat so the original image doesn't get overwritten
			std::vector<std::vector<cv::Point> > contours;
			cv::Mat contourOutput = erod.clone();
			cv::findContours( contourOutput, contours, CV_RETR_LIST, CV_CHAIN_APPROX_NONE );


			//Draw the contours
			cv::Mat contourImage(frame.size(), CV_8UC3, cv::Scalar(0,0,0));
			cv::Scalar colors[3];
			colors[0] = cv::Scalar(255, 0, 0);
			colors[1] = cv::Scalar(0, 255, 0);
			colors[2] = cv::Scalar(0, 0, 255);
			for (size_t idx = 0; idx < contours.size(); idx++) {
				if(contours.size() > 45)
				{
					cout<<contours.size()<<endl;
					cv::drawContours(contourImage, contours, idx, colors[idx % 3]);
					sprintf(str,"Colour Defect");
					putText(contourImage, str, Point(5,100), FONT_HERSHEY_DUPLEX, 1, Scalar(255,0,0), 2);
					//snprintf(command,sizeof(command),"./up.sh %s",str);
					//system(command);

				}
				else
				{
					sprintf(str,"No-colour-defect");
					putText(contourImage, str, Point(5,100), FONT_HERSHEY_DUPLEX, 1, Scalar(255,0,0), 2);
					snprintf(command,sizeof(command),"./up.sh %s",str);
					system(command);
				}
			}

			//Binary threshold on the image



			cv::imshow("Contours", contourImage);
			imshow("Input", frame);
			//imshow("Out",gray);
			//imshow("Threshold",threshold);
			//imshow("Eroded_image",erod);
			waitKey(10);
		}

	}

}


void drawAxis(Mat& img, Point p, Point q, Scalar colour, const float scale = 0.2)
{
	double angle;
	double hypotenuse;
	//char str[200];
	angle = atan2( (double) p.y - q.y, (double) p.x - q.x ); // angle in radians
	hypotenuse = sqrt( (double) (p.y - q.y) * (p.y - q.y) + (p.x - q.x) * (p.x - q.x));
	//    double degrees = angle * 180 / CV_PI; // convert radians to degrees (0-180 range)
	//    cout << "Degrees: " << abs(degrees - 180) << endl; // angle in 0-360 degrees range
	// Here we lengthen the arrow by a factor of scale
	q.x = (int) (p.x - scale * hypotenuse * cos(angle));
	q.y = (int) (p.y - scale * hypotenuse * sin(angle));
	line(img, p, q, colour, 1, CV_AA);
	// create the arrow hooks
	p.x = (int) (q.x + 9 * cos(angle + CV_PI / 4));
	p.y = (int) (q.y + 9 * sin(angle + CV_PI / 4));
	line(img, p, q, colour, 1, CV_AA);
	p.x = (int) (q.x + 9 * cos(angle - CV_PI / 4));
	p.y = (int) (q.y + 9 * sin(angle - CV_PI / 4));
	line(img, p, q, colour, 1, CV_AA);
}

double getOrientation(const vector<Point> &pts, Mat &img)
{
	//Construct a buffer used by the pca analysis
	int sz = static_cast<int>(pts.size());
	Mat data_pts = Mat(sz, 2, CV_64FC1);
	for (int i = 0; i < data_pts.rows; ++i)
	{
		data_pts.at<double>(i, 0) = pts[i].x;
		data_pts.at<double>(i, 1) = pts[i].y;
	}
	//Perform PCA analysis
	PCA pca_analysis(data_pts, Mat(), CV_PCA_DATA_AS_ROW);
	//Store the center of the object
	Point cntr = Point(static_cast<int>(pca_analysis.mean.at<double>(0, 0)),
			static_cast<int>(pca_analysis.mean.at<double>(0, 1)));
	//Store the eigenvalues and eigenvectors
	vector<Point2d> eigen_vecs(2);
	vector<double> eigen_val(2);
	for (int i = 0; i < 2; ++i)
	{
		eigen_vecs[i] = Point2d(pca_analysis.eigenvectors.at<double>(i, 0),
				pca_analysis.eigenvectors.at<double>(i, 1));
		eigen_val[i] = pca_analysis.eigenvalues.at<double>(0, i);
	}
	// Draw the principal components
	circle(img, cntr, 3, Scalar(255, 0, 255), 2);
	Point p1 = cntr + 0.02 * Point(static_cast<int>(eigen_vecs[0].x * eigen_val[0]), static_cast<int>(eigen_vecs[0].y * eigen_val[0]));
	Point p2 = cntr - 0.02 * Point(static_cast<int>(eigen_vecs[1].x * eigen_val[1]), static_cast<int>(eigen_vecs[1].y * eigen_val[1]));
	drawAxis(img, cntr, p1, Scalar(0, 255, 0), 1);
	drawAxis(img, cntr, p2, Scalar(255, 255, 0), 5);
	double angle = atan2(eigen_vecs[0].y, eigen_vecs[0].x); // orientation in radians
	return angle;
}




void Orientation()
{
	Size size(500,500);
	VideoCapture capture("1.mp4");
	Mat frame;
	if(!capture.isOpened())
	{
		cout << "Problem loading image!!!" << endl;

	}
	double angle;

	for(; ;)
	{
		capture >> frame;
		if(frame.empty())
			break;

		Mat img_hsv , threshold;
		//fastNlMeansDenoising(frame, frame, 3.0, 7, 21);
		cvtColor(frame,img_hsv,CV_RGB2HSV);

		//cvtColor(frame,frame, COLOR_BGR2GRAY);
		//mog ->apply(frame,threshold);
		inRange(img_hsv,Scalar(59,0,0),Scalar(179,255,255),threshold);
		vector<Vec4i> hierarchy;
		vector<vector<Point> > contours;
		findContours(threshold, contours, hierarchy, CV_RETR_LIST, CV_CHAIN_APPROX_NONE);
		for (size_t i = 0; i < contours.size(); ++i)
		{
			// Calculate the area of each contour
			double area = contourArea(contours[i]);
			//cout<<area<<endl;
			// Ignore contours that are too small or too large
			if (area < 1e4 || 609500 < area) continue;
			// Draw each contour only for visualisation purposes
			//drawContours(frame, contours, static_cast<int>(i), Scalar(0, 0, 255), 2, 8, hierarchy, 0);
			// Find the orientation of each shape
			angle = getOrientation(contours[i], frame);
			if(angle > 1.2 and angle < 1.6)
			{
				sprintf(str,"Correct-orientation");
				putText(frame, str, Point(5,100), FONT_HERSHEY_DUPLEX, 1, Scalar(255,0,0), 2);
				snprintf(command,sizeof(command),"./up.sh %s",str);
				system(command);
			}
			else
			{

				sprintf(str,"Incorrect-orientation");
				putText(frame, str, Point(5,100), FONT_HERSHEY_DUPLEX, 1, Scalar(255,0,0), 2);
				snprintf(command,sizeof(command),"./up.sh %s",str);
				system(command);

			}
			cout<<angle<<endl;

			break;
		}
		//resize(frame,size);
		imshow("output", threshold);
		imshow("Out",frame);
		waitKey(10);
		//cv::destroyAllWindows();
	}

}

void Crack_Detection()
{
	Size size(500,500);

	Mat frame;
	frame = imread("1.jpg");
	cv::Mat display = frame.clone();
	if(!frame.data)
	{
		cout<<"Could not open or find the image";

	}

	cv::cvtColor(frame,frame, CV_BGR2GRAY);
	cv::GaussianBlur(frame,frame,cv::Size(5, 5),1.8);
	cv::Canny( frame, frame, 0,200);

	//Find the contours. Use the contourOutput Mat so the original image doesn't get overwritten
	std::vector<std::vector<cv::Point> > contours;
	cv::Mat contourOutput = frame.clone();
	cv::findContours( contourOutput, contours, CV_RETR_LIST, CV_CHAIN_APPROX_NONE );


	//Draw the contours
	cv::Mat contourImage(frame.size(), CV_8UC3, cv::Scalar(0,0,0));
	cv::Scalar colors[3];
	colors[0] = cv::Scalar(255, 0, 0);
	colors[1] = cv::Scalar(0, 255, 0);
	colors[2] = cv::Scalar(0, 0, 255);
	for (size_t idx = 0; idx < contours.size(); idx++) {
		if(contours.size() > 0)
		{
			cout<<contours.size()<<endl;
			cv::drawContours(contourImage, contours, idx, colors[idx % 3]);
			sprintf(str,"Crack");
			putText(contourImage, str, Point(5,100), FONT_HERSHEY_DUPLEX, 1, Scalar(255,0,0), 2);
		}
	}


	imshow("Input image",display);
	imshow("processed images",contourImage);
	sprintf(str,"Crack");
	snprintf(command,sizeof(command),"./up.sh %s",str);
	system(command);
	waitKey(10);
	//cv::destroyAllWindows();


}



class ContourWithData {
	public:
	public:
	        std::vector<cv::Point> ptContour;
	        cv::Rect boundingRect;
	        float fltArea;


	        bool checkIfContourIsValid() {
	            float j = float(boundingRect.width)/float(boundingRect.height);
	            //if (boundingRect.height>60 || boundingRect.height<10 ||boundingRect.width<10|| j<0.20 ||j>0.50) return false;
	            if ( boundingRect.height<10 ||boundingRect.height>50 || boundingRect.width<10 || j<0.20 ||j>0.60) return false;
	            return true;
	        }


	        static bool sortByBoundingRectXPosition(const ContourWithData& cwdLeft, const ContourWithData& cwdRight) {
	            return(cwdLeft.boundingRect.x < cwdRight.boundingRect.x);                                                                                                       // the contours from left to right
	        }

};

void Label_Reader()
{

	std::vector<ContourWithData> allContoursWithData;
	    std::vector<ContourWithData> validContoursWithData;
	    cv::Mat matClassificationFloats;

	    cv::FileStorage fsClassifications("classifications.xml", cv::FileStorage::READ);
	    if (fsClassifications.isOpened() == false) {
	        std::cout << "error, unable to open training classifications file, exiting program\n\n";
	        return(0);                                                                                                                                                                      // and exit program
	    }

	    fsClassifications["classifications"] >> matClassificationFloats;
	    fsClassifications.release();


	    cv::Mat matTrainingImages;

	    cv::FileStorage fsTrainingImages("images.xml", cv::FileStorage::READ);

	    if (fsTrainingImages.isOpened() == false) {
	            std::cout << "error, unable to open training images file, exiting program\n\n";
	            return(0);                                                                                                                                                              // and exit program
	        }

	        fsTrainingImages["images"] >> matTrainingImages;
	        fsTrainingImages.release();

			Ptr <cv::ml::TrainData> trainingData;
    		 Ptr<ml::KNearest> knn = ml::KNearest::create();

			 trainingData=ml::TrainData::create(matTrainingImages,
			                         SampleTypes::ROW_SAMPLE,matClassificationFloats);
		    knn->train(trainingData);



	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	    const int RESIZED_IMAGE_WIDTH = 1200;
	    const int RESIZED_IMAGE_HEIGHT = 600;
	    const int RESIZE_IMAGE_WIDTH = 20;
	    const int RESIZE_IMAGE_HEIGHT = 30;

	     cv::Mat TestImage = cv::imread("test_image_serialnumber.jpg");
	     cv::Mat TestImageCopy=TestImage.clone();
	    if (TestImage.empty()) {
	            std::cout << "error: image not read from file \n\n";
	            return(0);
	        }

	    cv::Mat matGrayscale,matBlurred,matThresh,matThreshCopy;


	    std::vector<std::vector<cv::Point> > ptcontours;
	    std::vector<cv::Vec4i> v4iHierarchy;
	    cv::Mat input,resize,gray,threshold,matROI,croppedImage,Roi_Gray,Roi_Thre,Roi_matROI,matThreshcopy;
	    std::vector<std::vector<cv::Point> > Roi_ptcontours;
	    std::vector<cv::Vec4i> Roi_v4iHierarchy;
	    std::vector<std::vector<cv::Point> > ptContours;
	    std::vector<cv::Vec4i> v4ihhierarchy;

	    cv::resize(TestImage, resize, cv::Size(RESIZED_IMAGE_WIDTH,RESIZED_IMAGE_HEIGHT));
	    cv::cvtColor(resize, gray, CV_BGR2GRAY);
	    cv::threshold(gray, threshold,200, 255, cv::THRESH_BINARY);
	    cv::findContours(threshold, ptcontours, v4iHierarchy, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);

	    for(int i=0;i<ptcontours.size();i++){
	            cv::Rect boundingRect=cv::boundingRect(ptcontours[i]);

	            if (cv::contourArea(ptcontours[i]) < 2000 || boundingRect.height>400){
	               continue;
	            }

	        matROI = resize(boundingRect);

	        cv::Rect roi;
	             roi.x = 0;//boundingRect.x
	             roi.y = 0+(matROI.size().height * 0.75) ;//boundingRect.y;
	             roi.width = matROI.size().width;// matROI.size().width - (roi.x * 0.5);
	             roi.height = matROI.size().height - matROI.size().height * 0.75; // matROI.size().height - (roi.y *0.8);

	       cv::Rect roi2(roi.x,roi.y,roi.width,roi.height);
	       croppedImage=matROI(roi2);
	       //cv::imshow("cropped",croppedImage);
	       //cv::waitKey(0);
	       cv::imwrite("cropped.jpeg",croppedImage);

	    cv::Mat matTestingNumbers = cv::imread("cropped.jpeg");
	   if (matTestingNumbers.empty()) {
	        std::cout << "error: cropped image not read from file\n\n";
	        return(0);
	    }

	    cv::Mat matTestingNumberscopy,re;
	    matTestingNumberscopy=matTestingNumbers.clone();
	    cv::resize(matTestingNumberscopy, re, cv::Size(800,300));
	    cv::cvtColor(re, matGrayscale, CV_BGR2GRAY);
	    cv::GaussianBlur(matGrayscale,matBlurred,cv::Size(5, 5),0);
	    cv::adaptiveThreshold(matBlurred,matThresh,255,cv::ADAPTIVE_THRESH_GAUSSIAN_C,cv::THRESH_BINARY_INV,11,2);

	    matThreshCopy = matThresh.clone();

	    cv::findContours(matThreshCopy,ptContours,v4ihhierarchy,cv::RETR_EXTERNAL,cv::CHAIN_APPROX_SIMPLE);


	    for (int i = 0; i < ptContours.size(); i++) {
	        ContourWithData contourWithData;
	        contourWithData.ptContour = ptContours[i];
	        contourWithData.boundingRect = cv::boundingRect(contourWithData.ptContour);
	        contourWithData.fltArea = cv::contourArea(contourWithData.ptContour);
	        allContoursWithData.push_back(contourWithData);
	    }

	    for (int i = 0; i < allContoursWithData.size(); i++) {
	        if (allContoursWithData[i].checkIfContourIsValid()) {
	        	validContoursWithData.push_back(allContoursWithData[i]);
	        }
	    }

	    std::sort(validContoursWithData.begin(), validContoursWithData.end(), ContourWithData::sortByBoundingRectXPosition);

	    std::string strFinalString;
	    for (int i = 0; i < validContoursWithData.size(); i++) {
	        //std::cout<< validContoursWithData[i].boundingRect;
	        //std::cout<< validContoursWithData[i].boundingRect.width<<"\n";
	        //std::cout<< validContoursWithData[i].boundingRect.height<<"\n";
	        // std::cout<< validContoursWithData[i].fltArea<<"\n";
	        float j =  float(validContoursWithData[i].boundingRect.width)/float(validContoursWithData[i].boundingRect.height) ;
	        //std::cout<<j<<'\n';
	        cv::rectangle(matTestingNumberscopy,validContoursWithData[i].boundingRect,cv::Scalar(255,255, 255),2);

	        cv::Mat matROI = matThresh(validContoursWithData[i].boundingRect);
	      //cv::imshow("matroi,", matROI);
	      //cv::waitKey(0);
	        cv::Mat matROIResized;

	        cv::resize(matROI, matROIResized, cv::Size(20,30));
            cv::Mat result;
	        cv::Mat matROIFloat;
	        matROIResized.convertTo(matROIFloat, CV_32FC1);
	        knn->findNearest(matROIFloat.reshape(1, 1),1,result);
	       	vector<float> vec;
	        result.row(0).col(0).copyTo(vec);

	                int ascii_number = vec[0];

	        		std::string CurrentChar;
	        		CurrentChar =char(ascii_number);

	        //std::cout<<q<<"\n";
	        if(CurrentChar == "l" || CurrentChar=="t" || CurrentChar=="I" || CurrentChar=="j"){
	            continue;
	        }
	        cv::putText(re,CurrentChar,cv::Point(validContoursWithData[i].boundingRect.x,validContoursWithData[i].boundingRect.y),
	                     CV_FONT_HERSHEY_SIMPLEX, 0.8,cv::Scalar(255,0,255), 2);
	        strFinalString = strFinalString +CurrentChar;
	    }
	    std::cout << "\n\n" << strFinalString << "\n\n";
	    cv::Mat oute;
	    //cv::imshow("matTestingNumbers", matTestingNumbers);
	    //cv::resize(matTestingNumbers,oute,cv::Size());
	    cv::imshow("output", re);
	    cv::waitKey(10);
	    //cv::destroyAllWindows();
        return 0;
}}


int main()
{



	cout<<"CV line implementation"<<endl;
	cout<<"\t 1.Counting of object"<<endl;
	Counting_Object();

	cout<<"\t 2.Colour detection"<<endl;
	Color_Detection();
	cout<<"\t 3.Crack Detection"<<endl;
	Crack_Detection();
	cout<<"\t 4.Orientation Detection"<<endl;
	Orientation();
	cout<<"\t 5.Label reader"<<endl;
	Label_Reader();

	return 0;

}
