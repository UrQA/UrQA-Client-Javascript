#!/bin/sh

## Init cmdline
argc=$#
TARGET_PATH=$1
TARGET_VERSION=$2
PLATFORM=$3
CORDOVA_HOME="./cordova"
PROJECT_HOME="./"

echo "Install UrQA-Client-Cordova plugin to : " $TARGET_PATH

# copy files javascript
cp -r $CORDOVA_HOME/www/* $TARGET_PATH/www/
cp -r $PROJECT_HOME/release/$TARGET_VERSION/urqa-cordova-* $TARGET_PATH/www/js/

# copy file android platform source
cp -r $CORDOVA_HOME/src/* $TARGET_PATH/platforms/android/src/
cp -r $CORDOVA_HOME/libs/* $TARGET_PATH/platforms/android/libs/
