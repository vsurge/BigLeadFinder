(function () {

    'user strict';

    var Nightmare = require('nightmare');
    var electron = require('electron');
    var path = require('path');
    var fs = require('fs');

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
        var browserConfig = config || defaultConfig;
        var browser = Nightmare(browserConfig);
        return browser;
    };

    Service.getCities = function (callback) {

        //var timeout = 60000;

        /* var browserConfig = {
            show: false,
            electronPath: electron.app.getPath('exe'),
            openDevTools: {
                mode: 'right'
            },
            gotoTimeout: timeout,
            loadTimeout: timeout,
            executionTimeout: timeout
        }; */

        //var browser = Nightmare(browserConfig);

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