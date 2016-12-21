#!/bin/sh
set -e

if [ ! -d jars/ ]; then
    mkdir -p jars
fi

rm -rf server-classes
mkdir -p server-classes
find server/src -name "*.java" | xargs javac -cp "jars/*:/usr/lib/java/*" -d server-classes

java -cp "jars/*:/usr/lib/java/*:server-classes" com.intel.pathtoproduct.JavaONEDemoMulti -webapp www/
