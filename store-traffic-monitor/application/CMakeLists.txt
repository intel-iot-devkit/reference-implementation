cmake_minimum_required(VERSION 3.4)
project (store-traffic-monitor)

set(OPENCV_INCLUDE $ENV{INTEL_CVSDK_DIR}/opencv/include/)
set(OPENCV_LIB $ENV{INTEL_CVSDK_DIR}/opencv/lib)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
set(CMAKE_EXE_LINKER_FLAGS "-L$ENV{DL_SDK_LIB}")

set(InferenceEngine_INCLUDE_DIRS $ENV{INTEL_CVSDK_DIR}/deployment_tools/inference_engine/include)
list(APPEND CMAKE_MODULE_PATH "$ENV{INTEL_CVSDK_DIR}/deployment_tools/inference_engine/samples/cmake")
include(feature_defs)

add_subdirectory($ENV{INTEL_CVSDK_DIR}/deployment_tools/inference_engine/samples/extension ${CMAKE_BINARY_DIR}/extension)

include_directories(include
                    ${OPENCV_INCLUDE}
                    $ENV{DL_SDK_INCLUDE}
                    $ENV{INTEL_CVSDK_DIR}/deployment_tools/inference_engine/samples/extension)

link_directories(${OPENCV_LIB}
                $ENV{INTEL_CVSDK_DIR}/deployment_tools/inference_engine/samples/build/intel64/Release/lib)

add_executable(store-traffic-monitor src/main.cpp)

target_link_libraries(store-traffic-monitor pthread rt dl opencv_core opencv_video opencv_videoio opencv_imgproc opencv_photo opencv_highgui opencv_imgcodecs inference_engine cpu_extension)
