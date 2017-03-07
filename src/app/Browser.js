(function () {

    'user strict';

    var Nightmare = require('nightmare');
    //require('nightmare-window-manager')(Nightmare);
    var electron = require('electron');

    var Browser = {};

    Browser.updateCities = function (callback) {
        var browserConfig = {
            show: true,
            electronPath: electron.app.getPath('exe'),
            openDevTools: {
                mode: 'right'
            },
            gotoTimeout: 60000
        };

        var browser = Nightmare(browserConfig);

        var url = 'https://www.craigslist.org/about/sites';
        /*
         browser.on('did-finish-load', function () {
         console.log(url + ' did-finish-load');

         callback('test');
         });
         */

        browser
            .goto(url)
            .evaluate(function () {

                //window.console.log('test');
                //console.dir(window.document)

                console.log('evaluating...');
                var result = document.querySelector('#logo').innerText
                console.log('result: ' + result);
                return result;

            })
            .end()
            .then(function (result) {
                console.log('ending...');
                console.log('then result: ' + result);
                console.log('browser end');
                callback(result);


            })
            .catch(function (error) {

                console.error('error: ' + error);
                callback(error);

            });

        /*
         browser
         .goto('https://duckduckgo.com')
         .type('#search_form_input_homepage', 'github nightmare')
         .click('#search_button_homepage')
         .wait('#zero_click_wrapper .c-info__title a')
         .evaluate(function () {
         return document.querySelector('#zero_click_wrapper .c-info__title a').href;
         })
         .end()
         .then(function (result) {
         console.log(result);
         })
         .catch(function (error) {
         console.error('Search failed:', error);
         });
         */

        /*


         */

    };

    module.exports = Browser;

})();