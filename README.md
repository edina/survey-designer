# survey-designer


###Installation instructions

Prerequisites:
- bower
- npm
- jspm

```
npm -g install jspm
jspm install
bower install
```
In case you get a 404 error on jspm packages you need to update the config.js to be:

```
"github:*": "app/jspm_packages/github/*.js" --> "github:*": "jspm_packages/github/*.js" 
"npm:*": "app/jspm_packages/npm/*.js" --> "npm:*": "jspm_packages/npm/*.js"
```

Then for running the app on development server you need either to:

```
npm install
cd app
../node_modules/beefy/bin/beefy
```

or

```
npm -g install beefy
cd app
beefy
```
