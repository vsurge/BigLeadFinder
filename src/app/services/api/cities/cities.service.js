/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.cities';

    //require('angular-local-storage');
    //window.PouchDB = require('pouchdb-browser');
    //PouchDB.plugin(require('pouchdb-find'));
    //require('angular-pouchdb');

    require('services/db/db.service');

    //var Nightmare = require('nightmare');
    //require('nightmare-window-manager')(Nightmare);

    angular.module(MODULE_NAME, [
        'pouchdb',
        'db.service'
    ]).config(Config).service('CitiesService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _,$mdToast) {

        var service = {};

        service.seed = function () {};

        service.find = function (selector) {
            return DB.findDocs('city',selector);

        };

        service.remove = function (selector) {
            return DB.removeDocs('city',selector);
        };

        service.updateCities = function () {

            //$log.debug('Starting updateCities');

            $rootScope.showToast('Update Cities Start');

            var deferred = $q.defer();

            Browser.getCities(function (result, error) {
                if (result) {
                    //$log.debug('result: ' + JSON.stringify(result,null,2));
                    $log.debug('Found ' + result.cities.length + ' cities.')
                    //localStorageService.set('cities',result.cities);

                    if (result.cities.length > 0) {

                        service.remove().then(function (){
                            return DB.createCollection('city',result.cities);
                        }).then(function(){
                            deferred.resolve()
                        });

                    } else {
                        deferred.resolve(result);
                    }

                }

                if (error) {
                    $log.error('error: ' + error)

                    deferred.reject(error);
                }

                $rootScope.showToast('Update Cities Complete');

            });

            return deferred.promise;
        };

        return service;
    };

    module.exports = MODULE_NAME;

}());
