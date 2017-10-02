# Detects current OS

find_program(LSB_RELEASE lsb_release)
if(LSB_RELEASE-NOTFOUND)
    message(FATAL_ERROR "${Red}Unsupported OS! This demo is for ${REQUIRED_OS_ID} ${REQUIRED_OS_VERSION}.${CR}")
endif()
execute_process(COMMAND ${LSB_RELEASE} -is
    OUTPUT_VARIABLE LSB_RELEASE_ID
    OUTPUT_STRIP_TRAILING_WHITESPACE
)
if(NOT LSB_RELEASE_ID STREQUAL ${REQUIRED_OS_ID})
    message(STATUS "OS found: ${LSB_RELEASE_ID}")
    message(FATAL_ERROR "${Red}Unsupported OS! This demo is for ${REQUIRED_OS_ID} ${REQUIRED_OS_VERSION}.${CR}")
endif()
execute_process(COMMAND ${LSB_RELEASE} -rs
    OUTPUT_VARIABLE LSB_RELEASE_VERSION
    OUTPUT_STRIP_TRAILING_WHITESPACE
)
if(LSB_RELEASE_VERSION VERSION_LESS ${REQUIRED_OS_VERSION})
    message(FATAL_ERROR "${Red}Unsupported OS version! This demo is for ${REQUIRED_OS_ID} ${REQUIRED_OS_VERSION}.${CR}")
elseif(LSB_RELEASE_VERSION VERSION_GREATER ${REQUIRED_OS_VERSION})
    message(WARNING "${Red}This demo has not been tested on ${REQUIRED_OS_ID} ${LSB_RELEASE_VERSION}.${CR}")
endif()
