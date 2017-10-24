cmake_minimum_required(VERSION 2.8.11)
project(FAC)
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_SOURCE_DIR}/cmake")

# Fancy colorized output messages
string(ASCII 27 Esc)
set(CR "${Esc}[m")
set(Red "${Esc}[1;31m")
set(Green "${Esc}[1;32m")
set(Blue "${Esc}[1;34m")

# Allow users to manually set OpenCV path if desired
set(OpenCV_DIR CACHE PATH "Path to Intel OpenCV library")

message(STATUS "${Blue}Intel Face Access Control (FAC) Demo${CR}")

# Check OS
message(STATUS "${Blue}Checking OS version...${CR}")

set(REQUIRED_OS_ID "Ubuntu")
set(REQUIRED_OS_VERSION "16.04")
include(osdetect)

# Check for Intel OpenCV
message(STATUS "${Blue}Checking prerequisites...${CR}")

find_package(DemoOpenCV)
if(NOT OpenCV_FOUND)
    message(FATAL_ERROR "${Red}Intel OpenCV was not found!\n${Blue}Have you sourced the ${Green}setupvars.sh${Blue} script provided by the Intel CV SDK?${CR}")
endif( )

include_directories(${OpenCV_INCLUDE_DIRS})

# Install paho MQTT dependency
include(pahomqtt)

# Application executables
set(DETECTOR cvservice)
set(DSOURCES src/cvservice.cpp src/mqtt.cpp)
add_executable(${DETECTOR} ${DSOURCES})
add_dependencies(${DETECTOR} pahomqtt)
set_target_properties(${DETECTOR} ${TRAINER} PROPERTIES COMPILE_FLAGS "-pthread -std=c++11")
target_link_libraries (${DETECTOR} ${OpenCV_LIBS} paho-mqtt3cs)

# Install
install(TARGETS ${DETECTOR} DESTINATION bin)

