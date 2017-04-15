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
                _id: "settings_0",
                name: "default",
                email: {
                    from:'',
                    test_mode: true,
                    test_mode_email: '',
                    smtp: {
                        host: "",
                        port: 465,
                        secure: true, // upgrade later with STARTTLS
                        auth: {
                            user: '',
                            pass: ''
                        },
                        tls: {
                            // do not fail on invalid certs
                            rejectUnauthorized: false
                        }
                    }
                }
            };

            return service.create(settings);
        };

        service.refreshDefaultSettings = function () {

            var deferred = $q.defer();

            service.find({name: 'default'}).then(function (result) {

                //$log.debug('service.getDefaultSettings: ' + JSON.stringify(result,null,2));

                if (result && result.docs && result.docs.length > 0) {

                    service.defaultSettings = result.docs[0];
                    deferred.resolve(service.defaultSettings);
                } else {
                    deferred.reject({message: 'Not found.'})
                }

            }).catch(function (error) {
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

            return DB.create('setting', settings).then(function () {
                service.refreshDefaultSettings();
            });
        }


        function Init() {

            service.refreshDefaultSettings();

        }

        Init();

        return service;
    };

    module.exports = MODULE_NAME;

}());