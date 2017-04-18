(function () {

    'user strict';

    var Nightmare = require('nightmare');
    require('nightmare-evaluate-async')(Nightmare)
    require('nightmare-window-manager')(Nightmare)
    var electron = require('electron')
    // Module to create native browser window.
    var BrowserWindow = electron.BrowserWindow

    var electron = require('electron');
    var path = require('path');
    var fs = require('fs');
    var Q = require('q');
    var vo = require('vo');

    var Service = {};

    Service.browserFactory = function (config) {

        var timeout = 120000;
        var defaultConfig = {
            show: false,
            electronPath: electron.app.getPath('exe'),
            openDevTools: {
                mode: 'right'
            },
            gotoTimeout: timeout,
            loadTimeout: timeout,
            executionTimeout: timeout,
            waitTimeout:timeout
        };

        var browserConfig = defaultConfig;

        if (config) {
            browserConfig = Object.assign(defaultConfig,config)
        }

        var browser = Nightmare(browserConfig);
        return browser;
    };

    Service.isWindowOpen = function (browser) {

        browser.evaluate_now(function(done){
            return document;
        },function(){
            console.log('done!')
        }).then(
            function(doc){
                console.log('doc: ' + doc)
            }
        );
    };

    Service.getCities = function (callback) {

        var browser = Service.browserFactory();

        var sites_url = 'https://www.craigslist.org/about/sites';
        var jqueryPath = path.resolve('../src/node_modules/jquery/dist/jquery.js');

        browser
            .goto(sites_url)
            .inject('js',jqueryPath)
            .wait(500)
            .evaluate(function () {

                var result = {};

                var cities = [];

                var boxes = $('.colmask').first().find('.box > ul > li > a').each(function(index,element){

                    var host_parts = element.hostname.split('.');

                    /* if (element.href === 'http://miami.craigslist.org/brw/') {
                        cities.push({
                            href:element.href,
                            host:element.host,
                            path:element.pathname,
                            _id:host_parts[0],
                            city_name:element.innerText
                        });
                    } */

                    cities.push({
                        href:element.href,
                        host:element.host,
                        path:element.pathname,
                        _id:host_parts[0],
                        city_name:element.innerText
                    });



                });

                result.cities = cities;

                return result;


            })
            .end()
            .then(function (result) {
                //console.log('Browser.getCities end()');
                //console.log('result: ' + JSON.stringify(result,null,2));
                callback(result,null);

            })
            .catch(function (error) {

                console.error('Browser.getCities error: ' + error);
                callback(null,error);

            });

    };

    Service.openPost = function (bounds,postUrl,emailCallback,completionCallback,newWindow) {

        //console.log('openPost: ' + postUrl)
        var jqueryPath = path.resolve('../src/node_modules/jquery/dist/jquery.js');
        var noConflictPath = path.resolve('./app/jQueryNoConflict.js');

        //var qPath = path.resolve('../src/node_modules/q/q.js');

        //var windows = BrowserWindow.getAllWindows()

        if (Service.visibleBrowser && newWindow) {
            //console.log('Service.visibleBrowser: ' + Service.visibleBrowser)
            //Service.isWindowOpen(Service.visibleBrowser)
            //console.log('Service.visibleBrowser.running: ' + Service.visibleBrowser.running)

            Service.visibleBrowser._endNow();
            Service.visibleBrowser = null;

        }

        if (!Service.visibleBrowser) {

            var positionConfig = Object.assign(bounds,{x:bounds.x + bounds.width,width:bounds.width * .666})
            var config = Object.assign({show:true,openDevTools:false},positionConfig)

            Service.visibleBrowser = Service.browserFactory(config);

            //console.log('Service.visibleBrowser: ' + JSON.stringify(Service.visibleBrowser,null,2));
        }

        Service.visibleBrowser
            .goto(postUrl)
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

            }).catch(function(error){
                console.log(error)
            })
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