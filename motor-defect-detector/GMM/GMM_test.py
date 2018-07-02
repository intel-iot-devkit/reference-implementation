# -*- coding: utf-8 -*-
"""
Created on Thu May 24 12:59:18 2018

@author: SHEFALI JAIN
"""
"""
    script for testing the bearing set whether they have any issue or not  using the trained GMM model
"""

# import the libraries
import numpy as np
import matplotlib.pyplot as plt

import os

from utils import cal_max_freq,plotlabels,create_dataframe

def main():
    try:
        # user input for the path of the dataset
        filedir = input("enter the complete directory path ")
        filepath = input("enter the folder name")

        #load the files
        all_files = os.listdir(filedir)
        freq_max1,freq_max2,freq_max3,freq_max4,freq_max5 = cal_max_freq(all_files,filepath)
    except IOError:
        print("you have entered either the wrong data directory path or filepath")


    #load the model
    filename = "GMM_all.npy"
    model = np.load(filename).item()

    #checking the iteration
    if (filepath == "1st_test/"):
        rhigh = 8
    else:
        rhigh = 4

    print("for the testset", filepath)
    prediction_last_100 = []
    for i in range(0,rhigh):
        #making the dataframe
        X = create_dataframe(freq_max1,freq_max2,freq_max3,freq_max4,freq_max5,i)
        print("checking for the bearing",i+1)
        label = model.predict(X)
        check_two = list(label[-100:]).count(2)
        ratio = (check_two/100)*100
        print("prediction",ratio)
        if(ratio >= 50):
            print("bearing is suspected to fail")
        else:
            print("bearing is working in normal condition")

        prediction_last_100.append(label[-100:])

    plotlabels(prediction_last_100)
    plt.show()

if __name__== "__main__":
  main()