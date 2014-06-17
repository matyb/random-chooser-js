Random Chooser  [![Build Status](https://travis-ci.org/matyb/random-chooser-js.png?branch=master)](https://travis-ci.org/matyb/random-chooser-js)
==============
For when you wish to select an item at random from a list. Uses HTML5 local storage for persistence if its available.

Heavily relies on Node/NPM/Grunt to build for web and phonegap, which can subsequently be built into mobile specific targets.

__Installation:__
* Install NodeJS
* Install phonegap
* clone latest from github
* cd into the random-chooser-js directory
* Issue the command 'npm install'
* Lastly issue the command 'grunt'
* Install the phonegap mobile app on any mobile/tablet devices you wish to test with.

__Development:__

After issuing grunt, the appserver and autoreload server start. At this point:

1. tests are run
2. the javascript is linted
3. the app is built(js/css optimized and distinct html is produced for each target)
4. target specific app is deployed to dev, dist/web and dist/phonegap
5. dev/phonegap browsers auto reload to reflect changes.

will occur to check the validity of the application. 1-4 will occur again anytime Gruntfile.js is edited or any javascript (including tests) is saved. 2-4 occur anytime markup or css change.
* **For rapid development** open random-chooser-js/dev/index.html in any desktop or mobile browsers you wish to test in.
* **To deploy the mobile site** copy the contents of random-chooser-js/dist/web/ into your remote site where its expecting to find index.html and .htaccess
* **To load in the phone gap mobile app** take note of the text that looks like:
```
[phonegap] starting app server...
[phonegap] listening on 192.168.1.101:3000
[phonegap]
[phonegap] ctrl-c to stop the server
```
paste the address from this into your phonegap mobile app and click connect.
