# https://github.com/jsdoc3/jsdoc
# install js doc
# 	npm install jsdoc@"<=3.3.0"
# 	or
# 	npm install git+https://github.com/jsdoc3/jsdoc.git

sudo npm install jsdoc@"<=3.3.0" -g

VERSION="`cat version`" 

echo "UrQA-Client-Javascript Document Create Ver :" $VERSION

sudo jsdoc -c jsdoc_conf.json -d release/$VERSION/docs

#firefox release/$VERSION/docs/index.html