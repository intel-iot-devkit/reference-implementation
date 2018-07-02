**Real-time time-series anomaly detection**

| Programming Language |  Python |
| --- | --- |
| Skills (beg, intermediate, advanced) |  Intermediate |
| Time to complete project (in increments of 15 min) |  25 min |
| Hardware needed (hardware used) |   |
| Target Operating System |   |

The monitoring of manufacturing equipment is vital to any industrial process.  Sometimes it is critical that equipment be monitored in real-time for faults and anomalies to prevent damage and correlate equipment behavior faults to production line issues.  Fault detection is the pre-cursor to predictive maintenance.

There are several methods which don&#39;t require training of a neural network to be able to detect failures, starting with the most basic (FFT), to the most complex (Gaussian Mixture Model).  These have the advantage of being able to be re-used with minor modifications on different data streams, and don&#39;t require a lot of known previously classified data (unlike neural nets).  In fact, some of these methods can be used to classify data in order to train DNNs.

**What you&#39;ll learn**

- Basic implementation of FFT, K-Means clustering.
- How FFT is helpful in Feature engineering of vibrational data of a machine.

**Setup**

- Download the Bearing Data Set (also on [https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/](https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/))
- Extract the zip format of data into respective folder named 1st\_test/2nd\_test.
- Make sure you have the following libraries:

1. Numpy
2. Pandas
3. Matplotlib.pyplot
4. Sklearn
5. Scipy

- Download the code
- Make sure all the code and data in one folder

**Gather your materials**

- [UP Squared board](http://www.up-board.org/upsquared/)

**Get the code:**

Open the example in console or any python supported IDE( Spyder ). Set the working directory where your code and dataset is stored.



**Run the application:**

 There are multiple files to execute for the Kmeans clustering.

| SAMPLE FILE NAME | EXPECTED OUTPUT | Note |
| --- | --- | --- |
| Utils.py | Have all the function for all the module |   |
| Train\_kmeans.py | Saved weight of the trained module in the filename &quot;Kmeans&quot; | Training for the Kmeans is done on testset1 ,bearing4\_y axis (failed ),bearing 2\_x axis (passed ) and testset2 bearing1(failed),bearing2(passed)\*training dataset is increased for better result. |
| Test\_kmeans.py | Result for the particular test set which bearing is failed and the plot of last 100 predicted labels for all the bearings. | Take input path from the user , he wants to check which bearing is suspected to fail, which is in normal conditionThe label **0-7 is the range(early-most critical for failure)****\*\* its able to detect the bearing 1\_y axis which is very close to failue, hence showing** |

**How it works:**

**1. FFT:** A fast Fourier transform (FFT) is an algorithm that samples a signal over a period of time (or space) and divides it into its frequency components. These components are single sinusoidal oscillations at distinct frequencies each with their own amplitude and phase.

[Y](https://in.mathworks.com/help/matlab/ref/fft.html#f83-998360-Y) = fft( [X](https://in.mathworks.com/help/matlab/ref/fft.html#f83-998360-X)) computes the discrete Fourier transform (DFT) of X using a fast Fourier transform (FFT) algorithm. If X is a vector, then fft(X) returns the Fourier transform of the vector [**.more details**](https://en.wikipedia.org/wiki/Fast_Fourier_transform)

**2. Kmeans Clustering:** K-means clustering is a type of unsupervised learning, which is used when you have unlabeled data (i.e., data without defined categories or groups). The goal of this algorithm is to find groups in the data, with the number of groups represented by the variable K. The algorithm works iteratively to assign each data point to one of K groups based on the features that are provided. Data points are clustered based on feature similarity.

 The results of the K-means clustering algorithm are:

- The centroids of the K clusters, which can be used to label new data
- Labels for the training data (each data point is assigned to a single cluster)

**Each centroid of a cluster is a collection of feature values which define the resulting groups. Examining the centroid feature weights can be used to qualitatively interpret what kind of group each cluster represents.** [**More details**](https://en.wikipedia.org/wiki/K-means_clustering)

**Code Explanation:**

For all the samples the basic approach is same. Following are the steps that are basic steps:

- Take the fft of each bearing of each file.
- Calculate the Frequency and amplitude of it
- Calculate the top 5 amplitude and their corresponding frequency.
- Repeat the same for each bearing and each data file. Stored the result in the result data frame.

**For FFT** : it gives the Frequency vs time plot of each maximum frequency for each dataset.

![Figure 1](.././Images/FFT/testset2/max2.jpg)
*Figure 1.plot for the testset2, max2 frequency for all the bearing.*

**For Kmeans Clustering** :

Fit the result data frame into Kmeans cluster , grouping into 8 cluster(no is obtained from elbow method). Save the trained model into Kmeans.

For testing, Take input path from the user, he wants to check which bearing is suspected to fail &amp;which is in normal condition. Calculate the no of label 5, 6 ,7 for the last 100 predictions if the its greater than 25 then its suspected to fail, else in normal condition.

 ![Figure 2](.././Images/Kmeans/testset2_figure.jpg)
 *Figure 2.predicted last 100 labels for testset2, for all four bearings using the Kmeans clustering*


 ![Figure 3](.././Images/Kmeans/testset2_result.jpg)
 *Figure 3. result of testset2 which bearing has failed using the Kmeans clustering*

**NOTE:**

TESTSET 3 of Nasa bearing dataset is discarded for the observations because of the following reason:

1: It has 6324 file in actual, but according to the documentation its contains 4448 data file. This makes very noisy data.

2: None of the bearing show the symptom of failure, it suddenly fails. So it makes data inconsistent,

These listed reason become why testset3 shows unpredictable behavior.
