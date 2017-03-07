/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'lf.cities.service';

    require('angular-local-storage');

    //var Nightmare = require('nightmare');
    //require('nightmare-window-manager')(Nightmare);

    angular.module(MODULE_NAME, [
        'LocalStorageModule'
    ]).config(Config).service('lfCitiesService', Service);

    /** @ngInject */
    function Config(remoteProvider) {

        /*
         //const Nightmare = require('nightmare');
         //var nightmare = Nightmare({ show: true });
         //
         remoteProvider.register('winMgr','nightmare-window-manager');
         //remoteProvider.register('nightmare-window-manager');

         remoteProvider.register('Nightmare', function(remote) {

         var Nightmare = remote.require('nightmare');

         console.dir(Nightmare.action);

         remote.require('nightmare-window-manager')(Nightmare);

         return Nightmare;
         });
         */

        remoteProvider.register('nightmare');
        remoteProvider.register('electron');
        remoteProvider.register('Browser','./Browser');



    }

    /** @ngInject */
    function Service($rootScope, $log, $q, path, electron, localStorageService, nightmare, Browser) {

        var service = {};

        //var Browser = require('electron').remote.require('./Browser');

        service.updateCities = function () {

            //var test = localStorageService.get('test');

            $log.debug('Starting updateCities');

            Browser.updateCities(function(result){
                $log.debug('result: ' + result);
            });

            /*

            var jqueryPath = path.resolve('../src/node_modules/jquery/dist/jquery.min.js');

            //$log.debug('jqueryPath: ' + jqueryPath);

            //$log.debug('jqueryPath: ' + jqueryPath);

            var hostConsole = window.console;

            //.wait('h1')
            var url = 'https://www.craigslist.org/about/sites';
            /* browser.on('did-finish-load', function () {
             console.log(url + ' Did finish loading');


             }); */

            /*
            console.dir(window.document)

            browser
                .goto(url)
                .evaluate(function () {

                    //window.console.log('test');
                    //console.dir(window.document)

                })
                .end()
                .then(function () {

                    $log.debug('log debug');
                    console.log('browser end');
                });
            */

            /*
             .inject('js',jqueryPath).evaluate(function () {

             var $j = window.jQuery.noConflict();
             var result = $j('.logo').innerText;

             // now we're executing inside the browser scope.
             console.log('logo: ' + result);

             return result;
             })
             * */
            /*
             .evaluate(function () {
             var result = document.querySelector('.logo').innerText;
             console.log('result: ' + result);
             return result;
             })
             .end()
             .then(function (result) {
             //hostConsole.log('then result: ' + JSON.stringify(result,null,2));
             console.log('then result: ' + JSON.stringify(result, null, 2));
             });

             /*.catch(function (error) {
             $log.debug('Ending updateCities');
             console.log('error:', error);
             });*/
            /*
             .evaluate(function () {

             var $jQuery = jQuery.noConflict();
             var logo = $jQuery('.logo').innerText;

             // now we're executing inside the browser scope.
             console.log('logo: ' + logo);
             var result =  document.querySelector('h1').innerText;
             console.log('result: ' + result);
             return result;
             })

             .inject('js',jqueryPath)
             .evaluate(function () {

             var $jQuery = jQuery.noConflict();
             var logo = $jQuery('.logo').innerText;

             // now we're executing inside the browser scope.
             console.log('logo: ' + logo);
             var result =  document.querySelector('h1').innerText;
             console.log('result: ' + result);
             })

             */
        };

        return service;
    };

    module.exports = MODULE_NAME;

}());
