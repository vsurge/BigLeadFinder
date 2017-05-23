/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.app-settings';

    require('services/api/base/base.factory');
    require('services/db/db.service');
    window.JSZip = require('jszip');

    angular.module(MODULE_NAME, [
        'db.service'
    ]).config(Config).service('AppSettingsService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Process', './Process');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Process, DB, _, $, ServiceBase) {

        var service = function(){

            ServiceBase.constructor.call(this);

            var self = this;

            this.refreshDefaultSettings();
            /*
            this.refreshDefaultSettings().then(function(result){
                self.defaultSettings = result;
            });
            */
        };

        service.prototype = Object.create(ServiceBase.constructor.prototype);

        service.prototype.type = 'app_settings';

        service.prototype.seed = function () {

            var settings = {
                _id: "app_settings_0",
                name: "default",
                test_mode: true,
                test_mode_email: Process.env.SMTP_TEST_TO,
            };

            return service.prototype.create(settings);
        };

        service.prototype.refreshDefaultSettings = function () {

            var self = this;
            var deferred = $q.defer();

            service.prototype.find({name: 'default'}).then(function (result) {

                //$log.debug('service.getDefaultSettings: ' + JSON.stringify(result,null,2));

                if (result && result.docs && result.docs.length > 0) {

                    self.defaultSettings = result.docs[0];
                    deferred.resolve(result.docs[0]);
                } else {
                    deferred.reject({message: 'Not found.'})
                }

            }).catch(function (error) {
                $log.error('service.getDefaultSettings.error: ' + error);
                deferred.reject(error)
            });

            return deferred.promise;
        };









        return new service();
    };

    module.exports = MODULE_NAME;

}());