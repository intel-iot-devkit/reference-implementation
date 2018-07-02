# -*- coding: utf-8 -*-
"""
Created on Tue May 22 15:20:01 2018

@author: SHEFALI JAIN
"""

"""
    this script is used the train the Logistic Regression model, having 2 label.Labels are trained on the dataset, which consist of
    Testset1:
        bearing 7(bearing 4, y axis), Fail case
        bearing 2(bearing 2, x axis),pass case
    Testset2:
        bearing 0(bearing 1 ) , Fail case
        bearing 1(bearing 2) , Pass case
"""

# importing libraries

import pandas as pd
import numpy as np

from utils import cal_Labels,cal_max_freq,create_dataframe
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn import metrics

import os

# reading all the files from the testset1 and testset2
#chnaage the full path, to your dataset path

try:
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

# calculating the labels for the bearing which is failed
testset1_labelF = cal_Labels(len(all_files_testset1))
testset2_labelF = cal_Labels(len(all_files_testset2))

# creatine a datafRame for which bearing has failed
result1 = create_dataframe(testset1_freq_max1,testset1_freq_max2,testset1_freq_max3,testset1_freq_max4,testset1_freq_max5,7)
result1['labels'] = testset1_labelF

result2 = create_dataframe(testset2_freq_max1,testset2_freq_max2,testset2_freq_max3,testset2_freq_max4,testset2_freq_max5,0)
result2['labels'] = testset2_labelF

# calculating the labels for the testset1,testet2, which is not failed
testset1_labelP = np.array([0]*1800)
testset2_labelP = np.array([0]*800)

# creating a dataframe for which bearing is passed
result3 = create_dataframe(testset1_freq_max1,testset1_freq_max2,testset1_freq_max3,testset1_freq_max4,testset1_freq_max5,2)
result3 = result3[:1800]
result3['labels'] = testset1_labelP

result4 = create_dataframe(testset2_freq_max1,testset2_freq_max2,testset2_freq_max3,testset2_freq_max4,testset2_freq_max5,1)
result4 = result4[:800]
result4['labels'] = testset2_labelP

# creating the final Result
frames = [result1,result2,result3,result4]
result = pd.concat(frames)

# creating the X, Y variable
x = result[["fmax1","fmax2","fmax3","fmax4","fmax5"]]
y = result['labels']

# spliting the x, y into train and test set
x_train, x_test, y_train, y_test  =  train_test_split(x, y, test_size = 0.3, random_state = 42,stratify = y)

# training the model
logisticRegr  =  LogisticRegression(class_weight = 'balanced',random_state = 42,max_iter = 300)
logisticRegr.fit(x_train, y_train)
predictions  =  logisticRegr.predict(x_test)

# Use score method to get accuracy of model
score  =  logisticRegr.score(x_test, y_test)
print("training accuracy",score)
cm  =  metrics.confusion_matrix(y_test, predictions)
print("confusion matrix for training",cm)

# save the model
filename = "logisticRegressionModel.npy"
np.save(filename,logisticRegr)





