#!/bin/sh

## Init cmdline
argc=$#
TARGET_PATH=$1
TARGET_VERSION=$2
PROJECT_HOME="./"

echo $TARGET_VERSION

if [ -z "$TARGET_VERSION" ]; then

	echo "please insert urqa lib version info"
	echo "ex) install_tizen_web.sh /target/path 0.0.2"

else

	echo "Install UrQA-Client-web plugin to : " $TARGET_PATH

	# copy files javascript
	cp -r $PROJECT_HOME/release/$TARGET_VERSION/urqa-web-* $TARGET_PATH/js/
	

fi
