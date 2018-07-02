# -*- coding: utf-8 -*-
"""
Created on Mon Jun  4 11:46:36 2018

@author: SHEFALI JAIN
"""
"""
     this script is used to plot the frequency vs time graph.
"""
# import the libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from utils import cal_max_freq,plotlabels

import os

def reshapelist(lst):
    return (list(map(list, zip(*lst))))

try:
    # user input for the path of the dataset
    filedir = input("enter the complete directory path ")
    filepath = input("enter the folder name")

    #load the files
    all_files = os.listdir(filedir)
    freq_max1,freq_max2,freq_max3,freq_max4,freq_max5 = cal_max_freq(all_files,filepath)
except IOError:
    print("you have entered either the wrong data directory path or filepath")

freq = [freq_max1,freq_max2,freq_max3,freq_max4,freq_max5]

max_type = input("enter the max type in range 1-5")
max_type=int(max_type)
if(max_type >= 1 and max_type <= 5):
    freqmax = reshapelist(freq[max_type-1])
else:
    print("you have enter the max type range except 1-5.")

# plot the figure
fig  =  plt.figure()
plotlabels(freqmax)
fig.suptitle(("freq_max"+str(max_type )+'vs time '), fontsize = 20)
plt.ylabel('frequency', fontsize = 15)
plt.xlabel('time', fontsize = 15)
fig.savefig(("freq_"+str(max_type)+'.jpg'))