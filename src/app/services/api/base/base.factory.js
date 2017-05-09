/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.service_base';

    require('services/db/db.service');

    angular.module(MODULE_NAME, [
        'db.service'
    ]).config(Config).service('ServiceBase', Service);

    /** @ngInject */
    function Config(remoteProvider) {

    }

    /** @ngInject */
    function Service($rootScope, $log, $q,DB, _, $) {

        function service() {

            this.type = undefined;
        }

        service.prototype.create = function (item) {

            return DB.create(this.type, item);
        }

        service.prototype.find = function (selector, options) {

            //$log.debug('service.type: ' + this.type);
            return DB.findDocs(this.type, selector, options);
        };

        service.prototype.findByID = function (_id, options) {
            return DB.findByID(this.type, _id, options);
        };

        service.prototype.remove = function (selector) {
            return DB.removeDocs(this.type, selector);
        };

        return new service();
    };

    module.exports = MODULE_NAME;

}());