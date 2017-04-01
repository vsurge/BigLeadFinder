(function () {

    'user strict';

    var Nightmare = require('nightmare');
    require('nightmare-evaluate-async')(Nightmare)

    var electron = require('electron');
    var path = require('path');
    var fs = require('fs');
    var Q = require('q');
    var vo = require('vo');


    var Service = {};

    Service.browserFactory = function (config) {

        var timeout = 60000;
        var defaultConfig = {
            show: false,
            electronPath: electron.app.getPath('exe'),
            openDevTools: {
                mode: 'right'
            },
            gotoTimeout: timeout,
            loadTimeout: timeout,
            executionTimeout: timeout
        };

        var browserConfig = defaultConfig;

        if (config) {
            browserConfig = Object.assign(defaultConfig,config)
        }

        var browser = Nightmare(browserConfig);
        return browser;
    };

    Service.getCities = function (callback) {

        var browser = Service.browserFactory();

        var sites_url = 'https://www.craigslist.org/about/sites';
        var jqueryPath = path.resolve('../src/node_modules/jquery/dist/jquery.js');
        //var jq = fs.readFileSync(jqueryPath, "utf8");

        /*
        browser.on('did-finish-load', function () {
            console.log(url + ' Did finish loading');

            //browser.inject('js','jquery.js')

        });
        */

        //.inject('js',jqueryPath)
        /*
         .evaluate(function(_jq){
         window.$ = window.jQuery = eval(_jq);
         },jq)
        */
        browser
            .goto(sites_url)
            .inject('js',jqueryPath)
            .wait(500)
            .evaluate(function () {

                var result = {};

                var cities = [];

                var boxes = $('.colmask').first().find('.box > ul > li > a').each(function(index,element){

                    var host_parts = element.hostname.split('.');

                    cities.push({
                        href:element.href,
                        _id:host_parts[0],
                        city_name:element.innerText
                    });

                });

                result.cities = cities;

                return result;


            })
            .end()
            .then(function (result) {
                console.log('Browser.getCities end()');
                //console.log('result: ' + JSON.stringify(result,null,2));
                callback(result,null);

            })
            .catch(function (error) {

                console.error('Browser.getCities error: ' + error);
                callback(null,error);

            });

    };

    Service.openPost = function (postUrl,emailCallback,completionCallback) {

        console.log('x openPost: ' + postUrl)
        var jqueryPath = path.resolve('../src/node_modules/jquery/dist/jquery.js');
        var noConflictPath = path.resolve('./app/jQueryNoConflict.js');

        //var qPath = path.resolve('../src/node_modules/q/q.js');

        if (!Service.visibleBrowser) {
            Service.visibleBrowser = Service.browserFactory({show:true,openDevTools:false});
        }

        Service.visibleBrowser
            .goto(postUrl)
            .then(function(){})
            .inject('js',jqueryPath)
            .inject('js',noConflictPath)
            .wait('.anonemail')
            .evaluate(function () {

                var p = JQ('.anonemail').text()
                return p;

            })
            .then(function (result) {

                console.log('email result: ' + JSON.stringify(result,null,2));

                if (emailCallback) {
                    emailCallback(result)
                }

            })

        console.log('Service.visibleBrowser: ' + JSON.stringify(Service.visibleBrowser,null,2));

        var Positioner = require('electron-positioner');
        var positioner = new Positioner(Service.visibleBrowser)
        positioner.move('topLeft')

    };

    Service.getPostDetails = function (postUrl,completionCallback) {

        console.log('getPostDetails: ' + postUrl)
        var jqueryPath = path.resolve('../src/node_modules/jquery/dist/jquery.js');
        var noConflictPath = path.resolve('.jQueryNoConflict.js');
        //var qPath = path.resolve('../src/node_modules/q/q.js');
        //var promisePath = path.resolve('../src/node_modules/promise/index.js');

        var browser = Service.browserFactory({show:true,openDevTools:false});

        var emailQ = Q.defer()
        var postQ = Q.defer()

        browser
            .goto(postUrl)
            .inject('js',jqueryPath)
            .inject('js',noConflictPath)
            .wait('#titletextonly')
            .then(function(){

                browser.evaluate(function () {

                    var browserPost = {}
                    var title = JQ('#titletextonly').text()
                    browserPost.title = title
                    var body = JQ('#postingbody')
                    body.find('div:first').remove()
                    browserPost.body = body.html()

                    return browserPost;

                }).then(function(result){
                    postQ.resolve(result)
                })



                if (browser.exists('.reply_button.js-only')) {

                    var post = {}
                    //console.log('reply exists!')
//.mouseover('.reply_button.js-only')
                    browser
                        .click('.reply_button.js-only')
                        .wait('.anonemail')
                        .evaluate(function () {

                            var p = JQ('.anonemail').text()
                            return p;

                        })
                        .then(function (result) {

                            console.log('email result: ' + JSON.stringify(result,null,2));

                            post.email = result
                            emailQ.resolve(post)

                        })


                } else {
                    emailQ.resolve(post)
                }


            })

        Q.allSettled([postQ.promise,emailQ.promise])
            .then(function (results) {

                var post = {};
                results.forEach(function (result) {

                    if (result.state === "fulfilled") {
                        //var value = result.value;
                        Object.assign(post,result.value)
                    } else {
                        //var reason = result.reason;
                    }
                });

                console.log(JSON.stringify(post,null,2))
                browser.end().then(function(){

                   if (completionCallback) {
                       completionCallback(post)
                   }

                })
            });


    };

    Service.getPostDetailsX = function (postUrl,completionCallback) {

        console.log('getPostDetails: ' + postUrl)
        var jqueryPath = path.resolve('../src/node_modules/jquery/dist/jquery.js');
        //var qPath = path.resolve('../src/node_modules/q/q.js');
        var browser = Service.browserFactory({show:true,openDevTools:false});

        var emailQ = Q.defer()
        var postQ = Q.defer()

        // button .reply_button js-only
        browser.on('did-finish-load',function(){

            console.log('did-finish-load')

            var post = {}

            if (browser.exists('.reply_button.js-only')) {
                //console.log('reply exists!')
//.mouseover('.reply_button.js-only')
                browser
                    .click('.reply_button.js-only')
                    .wait('.anonemail')
                    .evaluate(function () {

                        var p = $('.anonemail').text()
                        return p;

                    })
                    .then(function (result) {

                        console.log('email result: ' + JSON.stringify(result,null,2));

                        post.email = result
                        emailQ.resolve(post)

                        //callback(result,null);

                    })


            } else {
                emailQ.resolve(post)
            }

        })

        browser
            .goto(postUrl)
            .inject('js',jqueryPath)
            .wait('#titletextonly')
            .evaluate(function () {

                var browserPost = {}
                var title = $('#titletextonly').text()
                browserPost.title = title
                var body = $('#postingbody')
                body.find('div:first').remove()
                browserPost.body = body.html()

                return browserPost;
            })
            .end()
            .then(function (result) {
                //console.log('Browser.getPostDetails end()');
                //console.log('result: ' + JSON.stringify(result,null,2));

                postQ.resolve(result)

                //callback(result,null);

            })
            .catch(function (error) {

                console.error('Browser.getPostDetails error: ' + error);
                postQ.reject(error)

            });

        Q.allSettled([emailQ.promise,postQ.promise])
            .then(function (results) {

                var post = {};
                results.forEach(function (result) {

                    if (result.state === "fulfilled") {
                        var value = result.value;
                        Object.assign(post,result.value)
                    } else {
                        var reason = result.reason;
                    }
                });

                console.log(JSON.stringify(post,null,2))
            });



        /*
         .wait(10000)
         .evaluate(function () {

         })
         .end()
         .then(function (result) {
         console.log('Browser.openPost end()');
         //console.log('result: ' + JSON.stringify(result,null,2));
         callback(result,null);

         })
         .catch(function (error) {

         console.error('Browser.openPost error: ' + error);
         callback(null,error);

         });
         */

    };

    module.exports = Service;

})();

/*
 .evaluate(function () {

 var result = {};
 result.$ = JSON.stringify(window.$,null,2);
 if (!window.$) {
 result.$ = 'missing';
 } else {

 }
 result.jQuery = window.jQuery().jquery;
 if (!window.jQuery) {
 result.jQuery = 'missing';
 }
 var logo = document.querySelector('#logo').innerText
 result.logo = logo;
 return result;


 })
* */