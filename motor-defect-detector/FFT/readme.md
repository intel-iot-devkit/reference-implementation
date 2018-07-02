# Real-time time-series anomaly detection

| Programming Language |  Python |
| --- | --- |
| Skills (beg, intermediate, advanced) |  Intermediate |
| Time to complete project (in increments of 15 min) |  25 min |
| Hardware needed (hardware used) | Up Squared* board  |
| Target Operating System |   |

The monitoring of manufacturing equipment is vital to any industrial process. Sometimes it is critical that equipment be monitored in real-time for faults and anomalies to prevent damage and correlate equipment behavior faults to production line issues.  Fault detection is the pre-cursor to predictive maintenance.

There are several methods which don&#39;t require training of a neural network to be able to detect failures, starting with the most basic (FFT), to the most complex (Gaussian Mixture Model). These have the advantage of being able to be re-used with minor modifications on different data streams, and don&#39;t require a lot of known previously classified data (unlike neural nets). In fact, some of these methods can be used to classify data in order to train DNNs.

## What you&#39;ll learn
- Basic implementation of FFT.
- How FFT is helpful in Feature engineering of vibrational data of a machine.

## Setup
- Download the Bearing Data Set (also on [https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/](https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/))
- Extract the zip format of data into respective folder named 1st\_test/2nd\_test.
- Make sure you have the following libraries:

  * Numpy
  * Pandas
  * Matplotlib.pyplot
  * Sklearn
  * Scipy

- Download the code
- Make sure all the code and data in one folder

## Gather your materials

- [UP Squared* board](http://www.up-board.org/upsquared/)

## Get the code

Open the example in a console or any python supported IDE (Spyder). Set the working directory where your code and dataset is stored.

## Run the application

|  SAMPLE FILE NAME | EXPECTED OUTPUT | Note |
| --- | --- | --- |
| FreqTime.py | Frequency v/s Time plot |   |
| Utils.py | Have all the function for all the module |   |

## How it works

1. **FFT**: A fast Fourier transform (FFT) is an algorithm that samples a signal over a period of time (or space) and divides it into its frequency components. These components are single sinusoidal oscillations at distinct frequencies each with their own amplitude and phase.

     [Y](https://in.mathworks.com/help/matlab/ref/fft.html#f83-998360-Y) = fft([X](https://in.mathworks.com/help/matlab/ref/fft.html#f83-998360-X)) computes the discrete Fourier transform (DFT) of X using a fast Fourier transform (FFT) algorithm. If X is a vector, then fft(X) returns the Fourier transform of the vector [**More Details**](https://en.wikipedia.org/wiki/Fast_Fourier_transform)

## Code Explanation:

For all the samples the basic approach is same. Following are the steps that are basic steps:

- Take the fft of each bearing of each file.
- Calculate the Frequency and amplitude of it
- Calculate the top 5 amplitude and their corresponding frequency.
- Repeat the same for each bearing and each data file. Stored the result in the result data frame.

### For FFT: Gives the Frequency vs time plot of each maximum frequency for each dataset.

 ![Figure 1](./Images/FFT/testset2/max2.jpg)
 
 *Figure 1.  Plot for the testset2, max2 frequency for all the bearing.*

**NOTE:**

TESTSET 3 of the NASA bearing dataset is discarded for the observations because of the following reason:

1: It has 6324 data file in actuality, but according to the documentation it contains 4448 data file. This makes very noisy data.

2: None of the bearing indicates the symptomsof failure. However, it suddenly fails. This makes data inconsistent.

The above listed reasons describe how testset3 exhibits unpredictable behavior.
