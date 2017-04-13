/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.settings';

    require('services/db/db.service');

    angular.module(MODULE_NAME, [
        'db.service'
    ]).config(Config).service('SettingsService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _, $) {

        var service = {};

        service.seedDefaultSettings = function () {
            var settings = {
                _id:"settings_0",
                name:"default"//,
                // email:{
                //     smtp_server:"demo.smtp.com",
                //     smtp_port:25,
                //     smtp_username:"test@user.com",
                //     smtp_password:"abc123"
                // }
            };

            return service.create(settings);
        };

        service.getDefaultSettings = function () {

            var deferred = $q.defer();

            service.find({name:'default'}).then(function(result){

                //$log.debug('service.getDefaultSettings: ' + JSON.stringify(result,null,2));

                if (result && result.docs && result.docs.length > 0) {
                    deferred.resolve(result.docs[0]);
                } else {
                    deferred.reject({message:'Not found.'})
                }

            }).catch(function(error){
                $log.error('service.getDefaultSettings.error: ' + error)
                deferred.reject(error)
            });

            return deferred.promise;
        };

        service.find = function (selector) {
            return DB.findDocs('setting', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('setting', selector);
        };

        service.create = function (settings) {

            return DB.create('setting',settings);
        }



        return service;
    };

    module.exports = MODULE_NAME;

}());