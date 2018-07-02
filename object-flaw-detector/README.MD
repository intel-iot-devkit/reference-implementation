# Object Flaw Detector

## Introduction
This reference implementation can be used to detect the various anomalies in the scenario of an object moving on a conveyor belt. This can be implemented in the production house of a certain product with some change in the threshold values. In practice, the task of observing video for this use case consists of two elements: detection and analysis. 

## Requirements
* Ubuntu* 16.04
* Python 3.6

## Setup 

1. Import this project into Intel(R) System Studio.  
2. Change the video and image sources to your source in each function before running.

### Code Description

The code is test on the sample videos and give quite impressive results. There are various function:
1. **Counting object**: The purpose of this function is to calculate the number of object passing over the conveyor belt . Here we use cv2 function createBackgroundMOG2 , which removes the background from the video .Now we draw the contours, from there we calculate the moments and then the x,y coordinate for the same.


2. **Color Detection**: The purpose of this function is to find any color anomaly if there on the object over the convener belt.The detector builds a model of the natural coloring in the scene and identifies outliers pixels, which are then filtered both spatially and temporally to find unusually colored objects. These objects are then highlighted in the search video as suggestions for the user, thus shifting a portion of the user's task from scanning the video to verifying the suggestions.


3. **Crack Detection**: This function is used to detect if any crack is present on the object . It is using canny detector to threshold background.

4. **Orientation Detection**: In this i have use HSV color format to separate out the object of interest.And then PCA is done on the object to find the orientation of the object.By receiving and processing the data reported by these orientation events, it's possible to interactively respond to rotation and elevation changes.

5. **Label reader**: Traditional scanning methods require you to scan your documents in pre-separated batches and then manually name and organize the resulting files. Barcode scanning, on the other hand, allows you to scan multiple batches in a single stack and let the software automatically name and organize the files based on the embedded barcode information. Barcodes come in many standards, but these can all be grouped into two general flavors: 

    1D (linear) barcodes and 2D (matrix) barcodes.

Linear barcodes are composed of parallel lines of varying widths and distances from each other, such as the UPC's that are scanned from your purchases with a laser barcode reader at most stores.

Matrix barcodes are usually square (though sometimes circular) arrangements of smaller squares, circles, or triangles, such as the QR codes that you can scan with your phone from many modern advertisements. Matrix barcodes can pack more information per unit of area than their linear counterparts, but not all software is designed to read them.

There are both advantages and disadvantages to using one standard over another. In addition to the amount of information that can be stored and the capability of your particular scanning software in deciphering it, some standards have additional functions such as checksums, which automatically validate whether or not the barcode was read correctly.

## (Optional) Saving Data to the Cloud
As an optional step you can take the data results and send them to an Amazon AWS instance for graphing.  Every time an object is passed over the conveyor belt or any anomaly is detected, a bash script (up.sh) is called from the code. This will write the info with the time stamp to the InfluxDB* database. All the data is stored with unique timestamps.

1\. Make an EC2 Linux* instance on AWS
([*https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2\_GetStarted.html*](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html))

2\. Install InfluxDB* on EC2 Linux instance
([*https://github.com/influxdata/influxdb*](https://github.com/influxdata/influxdb))

3\. Install Grafana* on EC2 Linux instance
([*https://grafana.com/get*](https://grafana.com/get))

4\. Fill in your information in p1.py of the location and credentials of your Grafana on EC2 instance.

