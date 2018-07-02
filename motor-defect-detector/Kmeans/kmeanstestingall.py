2# -*- coding: utf-8 -*-
"""
Created on Thu May 24 17:13:42 2018

@author: SHEFALI JAIN
"""
"""
    this script is used to test  which bearing has failed using the trained Kmeans model.
"""
# import the libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from utils import cal_max_freq,plotlabels

import os

def main():
    try:
        # user input for the path of the dataset
        filedir = input("enter the complete directory path ")
        filepath = input("enter the folder name")

        # load the files
        all_files = os.listdir(filedir)
        freq_max1,freq_max2,freq_max3,freq_max4,freq_max5  =  cal_max_freq(all_files,filepath)
    except IOError:
        print("you have entered either the wrong data directory path or filepath")

    # load the model
    filename = "kmeanModel.npy"
    model = np.load(filename).item()

    # checking the iteration
    if (filepath == "1st_test/"):
        rhigh = 8
    else:
        rhigh = 4


    testlabels = []
    for i in range(0,rhigh):
        print("checking for the bearing",i+1)
        result = pd.DataFrame()
        result['freq_max1'] = list((np.array(freq_max1))[:,i])
        result['freq_max2'] = list((np.array(freq_max2))[:,i])
        result['freq_max3'] = list((np.array(freq_max3))[:,i])
        result['freq_max4'] = list((np.array(freq_max4))[:,i])
        result['freq_max5'] = list((np.array(freq_max5))[:,i])

        X = result[["freq_max1","freq_max2","freq_max3","freq_max4","freq_max5"]]

        label = model.predict(X)
        labelfive = list(label[-100:]).count(5)
        labelsix = list(label[-100:]).count(6)
        labelseven = list(label[-100:]).count(7)
        totalfailur = labelfive+labelsix+labelseven#+labelfour
        ratio = (totalfailur/100)*100
        if(ratio >= 25):
            print("bearing is suspected to fail")
        else:
            print("bearing is working in normal condition")

        testlabels.append(label[-100:])

    # ploting the labels
    plotlabels(testlabels)
    plt.show()


if __name__== "__main__":
  main()