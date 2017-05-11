/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.email-settings';

    require('services/api/base/base.factory');
    require('services/db/db.service');

    angular.module(MODULE_NAME, [
        'db.service'
    ]).config(Config).service('EmailSettingsService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Process', './Process');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Process, DB, _, $, ServiceBase) {

        var service = function(){
            ServiceBase.constructor.call(this);
            //this.type = 'email_settings';

        };

        service.prototype = Object.create(ServiceBase.constructor.prototype);
        service.prototype.type = 'email_settings';

        service.prototype.seed = function () {
            var settings = {
                _id: "email_settings_0",
                name: "default",
                email: {
                    from:Process.env.SMTP_FROM,
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

            return service.prototype.create(settings);
        };

        return new service();
    };

    module.exports = MODULE_NAME;

}());