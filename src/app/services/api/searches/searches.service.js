/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.searches';

    require('services/api/base/base.factory');
    require('services/db/db.service');

    angular.module(MODULE_NAME, [
        'db.service',
        'api.service_base'
    ]).config(Config).service('SearchesService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _, $, ServiceBase) {

        var service = function() {
            ServiceBase.constructor.call(this);
            this.type = 'search';
        };

        service.prototype = Object.create(ServiceBase.constructor.prototype);
        service.prototype.type = 'search';

        //service.type = 'search';

        service.prototype.seed = function () {
            service.prototype.create({_id:'Search_0',name:'iOS', query:'ios', categories:['sof', 'cpg'], default_response:'response_0'});
            service.prototype.create({_id:'Search_1',name:'Angular', query:'angular', categories:['sof', 'cpg'], default_response:'response_0'});
            service.prototype.create({_id:'Search_2',name:'Rails', query:'rails', categories:['sof', 'cpg'], default_response:'response_0'});
            service.prototype.create({_id:'Search_3',name:'Node', query:'node | nodejs | node.js | "node js"', categories:['sof', 'cpg'], default_response:'response_0'});
        };

        /*
        service.find = function (selector) {
            return DB.findDocs('search', selector);
        };

        service.findByID = function (_id, options) {
            return DB.findByID('search', _id, options);
        };

        service.remove = function (selector) {
            return DB.removeDocs('search', selector);
        };

        service.create = function (search) {

            return DB.create('search', search);
        };
        */


        return new service();
    };

    module.exports = MODULE_NAME;

}());