#!/bin/sh

## Init cmdline
argc=$#
TARGET_PATH=$1
PLATFORM=$2
CORDOVA_HOME="./cordova"
PROJECT_HOME="./"

echo "Install UrQA-Client-Cordova plugin to : " $TARGET_PATH

# copy files javascript
cp -r $CORDOVA_HOME/www/* $TARGET_PATH/www/
cp -r $PROJECT_HOME/common_lib/* $TARGET_PATH/www/js/

# copy file android platform source
cp -r $CORDOVA_HOME/src/* $TARGET_PATH/platforms/android/src/
cp -r $CORDOVA_HOME/libs/* $TARGET_PATH/platforms/android/libs/
