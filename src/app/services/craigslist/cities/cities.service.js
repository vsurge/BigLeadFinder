/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'lf.cities.service';

    angular.module(MODULE_NAME,[
    ]).config(Config).service('lfCitiesService', Service);

    /** @ngInject */
    function Config(remoteProvider){
        //const Nightmare = require('nightmare');
        //var nightmare = Nightmare({ show: true });
        remoteProvider.register('nightmare');
        remoteProvider.register('electron');
    }

    /** @ngInject */
    function Service($rootScope,$log,$q,nightmare,electron) {

        var service = {};

        var browser = nightmare({ show: true, electronPath: electron.app.getPath('exe')});

        service.testNightmare = function () {

            browser.goto('https://www.craigslist.org')
                .end()
                .then(function (result) {
                    $log.debug('result: ' + JSON.stringify(result,null,2));
                })
                .catch(function (error) {
                    $log.error('error:', error);
                });

        }

        service.updateCities = function (completion) {

            $log.debug('lfCitiesService.updateCities');

            service.openCities().then(function(cl){
                $log.debug('Got window: ' + cl);
            });

        };

        service.openCities = function(ready) {

            var deferred = $q.defer();

            $.ajax( "//medialab.github.io/artoo/public/dist/artoo-latest.min.js" )
                .done(function(data) {

                    var cl = window.open('https://www.craigslist.org/about/sites');

                    $log.debug(cl);

                    $(cl.document).ready(function(){

                        var actualCode = '(' + function() {
                                window.console.log('Hello World!');
                            } + ')();';
                        var script = document.createElement('script');
                        script.textContent = actualCode;
                        (cl.document.head||cl.document.documentElement).appendChild(script);
                        //script.remove();

                        deferred.resolve(cl);

                    });

                });

            return deferred.promise;
        };

        return service;
    };

    module.exports = MODULE_NAME;

}());
