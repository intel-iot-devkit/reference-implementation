# -*- coding: utf-8 -*-
"""
Created on Thu May 24 17:08:00 2018

@author: SHEFALI JAIN
"""
"""
    this script is used the train the kmeans model, having 8 clusrer.Clusters are trained on the dataset, which consist of
    Testset1:
        bearing 7(bearing 4, y axis), Fail case
        bearing 2(bearing 2, x axis),pass case
    Testset2:
        bearing 0(bearing 1 ) , Fail case
        bearing 1(bearing 2) , Pass case

"""
# import the libraries

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn import cluster
from utils import cal_max_freq,create_dataframe,elbow_method

import os

try:
    # reading all  the files from the testset1, and testset2

    # reading all  the files from the testset1, and testset2
    filedir_testset1 = input("enter the complete directory path for the testset1 ")
    filedir_testset2 = input("enter the complete directory path for the testset2 ")
    all_files_testset1 = os.listdir(filedir_testset1)
    all_files_testset2 = os.listdir(filedir_testset2)

    # relative path of the dataset, after the current working directory

    path_testset2 = "2nd_test/"
    path_testset1 = "1st_test/"

    testset1_freq_max1,testset1_freq_max2,testset1_freq_max3,testset1_freq_max4,testset1_freq_max5 = cal_max_freq(all_files_testset1,path_testset1)
    testset2_freq_max1,testset2_freq_max2,testset2_freq_max3,testset2_freq_max4,testset2_freq_max5 = cal_max_freq(all_files_testset2,path_testset2)

except IOError:
    print("you have entered either the wrong data directory path for either testset1 or testset2")

result1 = create_dataframe(testset1_freq_max1,testset1_freq_max2,testset1_freq_max3,testset1_freq_max4,testset1_freq_max5,7)
result2 = create_dataframe(testset2_freq_max1,testset2_freq_max2,testset2_freq_max3,testset2_freq_max4,testset2_freq_max5,0)

result3 = create_dataframe(testset1_freq_max1,testset1_freq_max2,testset1_freq_max3,testset1_freq_max4,testset1_freq_max5,2)
result3 = result3[:1800]

result4 = create_dataframe(testset2_freq_max1,testset2_freq_max2,testset2_freq_max3,testset2_freq_max4,testset2_freq_max5,1)
result4 = result4[:800]


#creating the final Result
frames = [result1,result3,result2,result4]
result = pd.concat(frames)

X = result[["fmax1","fmax2","fmax3","fmax4","fmax5"]]

#elbow method: to calculate the optimal no of cluster

#elbow_method(X)
#plt.show()

#clustering
k_means = cluster.KMeans(n_clusters = 8,n_init = 10,max_iter = 1000,n_jobs = -1,random_state = 42)
kmeans_model = k_means.fit(X)
label = kmeans_model.labels_

#plot the labels
plt.scatter((np.array(range(1,len(result)+1))),label)

#save the model
filename = "kmeanModel.npy"
np.save(filename,kmeans_model)



