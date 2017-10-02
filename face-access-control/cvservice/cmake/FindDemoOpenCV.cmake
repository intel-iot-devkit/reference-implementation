# Use system variables set by CV SDK
if(NOT DEFINED OpenCV_DIR AND DEFINED ENV{OpenCV_DIR})
    set(OpenCV_DIR "$ENV{OpenCV_DIR}")
endif()

if(NOT DEFINED OpenCV_DIR)
    if(EXISTS "${INTEL_CVSDK_DIR}/opencv/share/OpenCV" )
        set(OpenCV_DIR "${INTEL_CVSDK_DIR}/opencv/share/OpenCV")
    elseif(EXISTS "$ENV{INTEL_CVSDK_DIR}/opencv/share/OpenCV")
        set(OpenCV_DIR "$ENV{INTEL_CVSDK_DIR}/opencv/share/OpenCV")
    elseif(EXISTS "/opt/intel/computer_vision_sdk_2017.0.113/opencv/share/OpenCV")
        set(OpenCV_DIR "/opt/intel/computer_vision_sdk_2017.0.113/opencv/share/OpenCV")
    endif()
endif()

# Avoid system installed OpenCV
find_package(OpenCV PATHS ${OpenCV_DIR} QUIET NO_SYSTEM_ENVIRONMENT_PATH NO_CMAKE_SYSTEM_PATH)

if(OpenCV_FOUND)
    message(STATUS "Intel OpenCV was found")
    message(STATUS "OpenCV_INCLUDE_DIRS=${OpenCV_INCLUDE_DIRS}")
    message(STATUS "OpenCV_LIBS=${OpenCV_LIBS}")
endif()
