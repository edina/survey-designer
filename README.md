# survey-designer

[![Build Status](https://api.travis-ci.org/edina/survey-designer.png?branch=master)](https://travis-ci.org/edina/survey-designer)


###Installation instructions

Prerequisites:
- npm
- jspm

```
npm -g install jspm
jspm install
```
In case you get a 404 error on jspm packages you need to update the config.js to be:

```
"github:*": "app/jspm_packages/github/*.js" --> "github:*": "jspm_packages/github/*.js"
"npm:*": "app/jspm_packages/npm/*.js" --> "npm:*": "jspm_packages/npm/*.js"
```

Add configuration file:
```
cp cfg.js.example cfg.js
```
You need to edit the cfg.js and add the configuration for the pcapi


Then for running the app on development server you need either to:

```
npm -g install http-server
http-server
```

For releasing a new survey designer library you need to:

```
npm run bundle
```

For testing the app you need to:
```
jspm setmode remote
npm run test
```

For running end to end tests you need firstly to download and start selenium server, check the [documentation](http://nightwatchjs.org/guide) and then go and run the tests:
```
./nightwatch --test test/e2e/surveyDesigner/create_survey.js
```


