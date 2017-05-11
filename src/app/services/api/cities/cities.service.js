/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.cities';

    require('services/api/base/base.factory');
    require('services/db/db.service');

    //var Nightmare = require('nightmare');
    //require('nightmare-window-manager')(Nightmare);

    angular.module(MODULE_NAME, [
        'pouchdb',
        'db.service',
        'api.service_base'
    ]).config(Config).service('CitiesService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _,$mdToast,ServiceBase) {

        var service = function(){
            ServiceBase.constructor.call(this);
            //this.type = 'city';
        };

        service.prototype = Object.create(ServiceBase.constructor.prototype);

        service.prototype.type = 'city';

        service.prototype.seed = function () {};

        /*
        service.find = function (selector) {
            return DB.findDocs('city',selector);

        };

        service.remove = function (selector) {
            return DB.removeDocs('city',selector);
        };
        */

        service.prototype.updateCities = function () {

            //$log.debug('Starting updateCities');

            $rootScope.showToast('Update Cities Start');

            var deferred = $q.defer();

            Browser.getCities(function (result, error) {
                if (result) {
                    //$log.debug('result: ' + JSON.stringify(result,null,2));
                    $log.debug('Found ' + result.cities.length + ' cities.')
                    //localStorageService.set('cities',result.cities);

                    if (result.cities.length > 0) {

                        service.prototype.remove().then(function (){
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

        return new service();
    };

    module.exports = MODULE_NAME;

}());
