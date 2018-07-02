# -*- coding: utf-8 -*-
"""
Created on Mon May 14 12:20:53 2018

@author:SHEFALI JAIN
"""
"""
    This scripts contain the functions
"""

#importing the libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from scipy.fftpack import fft
from scipy.spatial.distance import cdist
from sklearn import cluster

#cal_labels function take no_of_files as input and generate the label based on 70-30 split.
#files for the testset1 = 2148,testset2 = 984,testset3 = 6324
def cal_Labels(files):
    range_low = files*0.7
    range_high = files*1.0
    label = []
    for i in range(0,files):
        if(i<range_low):
            label.append(0)
        elif(i >= range_low and i <= range_high):
            label.append(1)
        else:
            label.append(2)
    return label

# cal_amplitude take the fftdata, n = no of maximun amplitude as input and return the top5 frequecy which has the highest amplitude
def cal_amplitude(fftData,n):
    ifa = []
    ia = []
    amp = abs(fftData[0:int(len(fftData)/2)])
    freq = np.linspace(0,10000,num = int(len(fftData)/2))
    ida = np.array(amp).argsort()[-n:][::-1]
    ia.append([amp[i] for i in ida])
    ifa.append([freq[i] for i in ida])
    return(ifa,ia)

# this function calculate the top n freq which has the heighest amplitude and retuen the list for each maximum
def cal_max_freq(files,path):
    freq_max1, freq_max2, freq_max3, freq_max4, freq_max5 = ([] for _ in range(5))
    for f in files:
        temp = pd.read_csv(path+f,  sep = "\t",header = None)
        temp_freq_max1,temp_freq_max2,temp_freq_max3,temp_freq_max4,temp_freq_max5 = ([] for _ in range(5))
        if(path ==  "1st_test/"):
            rhigh = 8
        else:
            rhigh = 4
        for i in range(0,rhigh):
            t = fft(temp[i])
            ff,aa = cal_amplitude(t,5)
            temp_freq_max1.append(np.array(ff)[:,0])
            temp_freq_max2.append(np.array(ff)[:,1])
            temp_freq_max3.append(np.array(ff)[:,2])
            temp_freq_max4.append(np.array(ff)[:,3])
            temp_freq_max5.append(np.array(ff)[:,4])
        freq_max1.append(temp_freq_max1)
        freq_max2.append(temp_freq_max2)
        freq_max3.append(temp_freq_max3)
        freq_max4.append(temp_freq_max4)
        freq_max5.append(temp_freq_max5)
    return(freq_max1,freq_max2,freq_max3,freq_max4,freq_max5)


# take the labels for each bearing, plot the corrosponding graph for each bearing .

def plotlabels(labels):
    length = len(labels)
    leng = len(labels[0])
    if(length == 4):
        ax1  =  plt.subplot2grid((8,1), (0,0), rowspan = 2, colspan = 1)
        ax2 = plt.subplot2grid((8,1), (2,0), rowspan = 2, colspan = 1)
        ax3 = plt.subplot2grid((8,1), (4,0), rowspan = 2, colspan = 1)
        ax4 = plt.subplot2grid((8,1), (6,0), rowspan = 2, colspan = 1)
        y1 = ax1.scatter(np.array(range(1,leng+1)),np.array(labels)[0],label = "bearing1")
        y2 = ax2.scatter(np.array(range(1,leng+1)),np.array(labels)[1],label = "bearing2")
        y3 = ax3.scatter(np.array(range(1,leng+1)),np.array(labels)[2],label = "bearing3")
        y4 = ax4.scatter(np.array(range(1,leng+1)),np.array(labels)[3],label = "bearing4")
        plt.legend(handles = [y1,y2,y3,y4])
    elif(length == 8):
        ax1 = plt.subplot2grid((16,1), (0,0), rowspan = 2, colspan = 1)
        ax2 = plt.subplot2grid((16,1), (2,0), rowspan = 2, colspan = 1)
        ax3 = plt.subplot2grid((16,1), (4,0), rowspan = 2, colspan = 1)
        ax4 = plt.subplot2grid((16,1), (6,0), rowspan = 2, colspan = 1)
        ax5 = plt.subplot2grid((16,1), (8,0), rowspan = 2, colspan = 1)
        ax6 = plt.subplot2grid((16,1), (10,0), rowspan = 2, colspan = 1)
        ax7 = plt.subplot2grid((16,1), (12,0), rowspan = 2, colspan = 1)
        ax8 = plt.subplot2grid((16,1), (14,0), rowspan = 2, colspan = 1)
        y1 = ax1.scatter(np.array(range(1,leng+1)),np.array(labels)[0],label = "bearing1_x")
        y2 = ax2.scatter(np.array(range(1,leng+1)),np.array(labels)[1],label = "bearing1_y")
        y3 = ax3.scatter(np.array(range(1,leng+1)),np.array(labels)[2],label = "bearing2_x")
        y4 = ax4.scatter(np.array(range(1,leng+1)),np.array(labels)[3],label = "bearing2_y")
        y5 = ax5.scatter(np.array(range(1,leng+1)),np.array(labels)[4],label = "bearing3_x")
        y6 = ax6.scatter(np.array(range(1,leng+1)),np.array(labels)[5],label = "bearing3_y")
        y7 = ax7.scatter(np.array(range(1,leng+1)),np.array(labels)[6],label = "bearing4_x")
        y8 = ax8.scatter(np.array(range(1,leng+1)),np.array(labels)[7],label = "bearing4_y")
        plt.show()
        plt.legend(handles = [y1,y2,y3,y4,y5,y6,y7,y8])

def create_dataframe(freq_max1,freq_max2,freq_max3,freq_max4,freq_max5,bearing):
    result = pd.DataFrame()
    result['fmax1'] = list((np.array(freq_max1))[:,bearing])
    result['fmax2'] = list((np.array(freq_max2))[:,bearing])
    result['fmax3'] = list((np.array(freq_max3))[:,bearing])
    result['fmax4'] = list((np.array(freq_max4))[:,bearing])
    result['fmax5'] = list((np.array(freq_max5))[:,bearing])
    x = result[["fmax1","fmax2","fmax3","fmax4","fmax5"]]
    return x

def elbow_method(X):
    distortions = []
    K = range(1,10)
    for k in K:
        kmeanModel = cluster.KMeans(n_clusters = k).fit(X)
        kmeanModel.fit(X)
        distortions.append(sum(np.min(cdist(X, kmeanModel.cluster_centers_, 'euclidean'), axis = 1)) / X.shape[0])
    #  Plot the elbow
    plt.plot(K, distortions, 'bx-')
    plt.xlabel('k')
    plt.ylabel('Distortion')
    plt.title('The Elbow Method showing the optimal k')
    plt.show()