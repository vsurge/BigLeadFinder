/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.settings';

    require('services/api/base/base.factory');
    require('services/db/db.service');

    angular.module(MODULE_NAME, [
        'db.service'
    ]).config(Config).service('SettingsService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Process', './Process');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Process, DB, _, $, ServiceBase) {

        var service = function(){
            ServiceBase.constructor.call(this);
            this.type = 'settings';

            var self = this;

            this.refreshDefaultSettings().then(function(result){
                self.defaultSettings = result;
            });
        };

        service.prototype = Object.create(ServiceBase.constructor.prototype);

        service.prototype.seed = function () {
            var settings = {
                _id: "settings_0",
                name: "default",
                email: {
                    from:Process.env.SMTP_FROM,
                    test_mode: true,
                    test_mode_email: Process.env.SMTP_TEST_TO,
                    smtp: {
                        host: Process.env.SMTP_HOST,
                        port: 465,
                        secure: true, // upgrade later with STARTTLS
                        auth: {
                            user: Process.env.SMTP_USER,
                            pass: Process.env.SMTP_PASS
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

        service.prototype.refreshDefaultSettings = function () {

            var deferred = $q.defer();

            service.prototype.find({name: 'default'}).then(function (result) {

                //$log.debug('service.getDefaultSettings: ' + JSON.stringify(result,null,2));

                if (result && result.docs && result.docs.length > 0) {

                    deferred.resolve(result.docs[0]);
                } else {
                    deferred.reject({message: 'Not found.'})
                }

            }).catch(function (error) {
                $log.error('service.getDefaultSettings.error: ' + error)
                deferred.reject(error)
            });

            return deferred.promise;
        };

        /*
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
        */

        /*
        function Init() {

            service.refreshDefaultSettings();

        }

        Init();
        */

        return new service();
    };

    module.exports = MODULE_NAME;

}());