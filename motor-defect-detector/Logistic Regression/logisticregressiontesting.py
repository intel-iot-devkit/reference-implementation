# -*- coding: utf-8 -*-
"""
Created on Mon May 14 14:09:55 2018

@author:SHEFALI JAIN
"""
"""
    script for testing the bearing set whether they have any issue or not
"""

# import the libraries
import numpy as np

from utils import cal_max_freq,plotlabels,create_dataframe

import os

def main():
    try:
        # user input for the path of the dataset
        filedir = input("enter the complete directory path ")
        filepath = input("enter the folder name")

        # load the files
        all_files = os.listdir(filedir)
        freq_max1,freq_max2,freq_max3,freq_max4,freq_max5 = cal_max_freq(all_files,filepath)
    except IOError:
        print("you have entered either the wrong data directory path or filepath")

    # load the model
    filename = "logisticRegressionModel.npy"
    logisticRegr = np.load(filename).item()

    #checking the iteration
    if (filepath=="1st_test/"):
        rhigh = 8
    else:
        rhigh = 4

    print("for the testset",filepath)
    prediction_last_100 = []
    for i in range(0,rhigh):
        print("checking for the bearing",i+1)
        # creating  the dataframe
        x = create_dataframe(freq_max1,freq_max2,freq_max3,freq_max4,freq_max5,i)
        predictions  =  logisticRegr.predict(x)
        prediction_last_100.append(predictions[-100:])
        # count no of zeros
        zero = list(predictions).count(0)
        ones = list(predictions).count(1)
        print("the no of paased files",zero)
        print("the no of failed files", ones)
        check_one = list(predictions[-100:]).count(1)
        check_zero = list(predictions[-100:]).count(0)

        if(check_one > check_zero):
             print("bearing is suspected, there are chances to fail")
        else:
             print("bearing has no issue")

    # plotting the last 100 prediction for each bearing
    plotlabels(prediction_last_100)


if __name__  == "__main__":
  main()