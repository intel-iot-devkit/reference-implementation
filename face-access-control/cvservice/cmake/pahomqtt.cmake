# This module installs paho mqtt as an external dependency
# Depends on openSSL

include(ExternalProject)
find_package(Git REQUIRED)
find_package(PkgConfig REQUIRED)
pkg_search_module(OPENSSL REQUIRED openssl)

ExternalProject_add(
    pahomqtt
    GIT_REPOSITORY "https://github.com/eclipse/paho.mqtt.c.git"
    GIT_TAG "master"
    UPDATE_COMMAND ""
    PATCH_COMMAND ""
    SOURCE_DIR "${CMAKE_BINARY_DIR}/paho-src"
    CMAKE_ARGS -DPAHO_WITH_SSL=TRUE -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}/paho-build
)

include_directories(${CMAKE_BINARY_DIR}/paho-build/include)
link_directories(${CMAKE_BINARY_DIR}/paho-build/lib)

