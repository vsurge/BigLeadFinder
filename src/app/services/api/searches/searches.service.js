/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.searches';

    require('services/db/db.service');

    angular.module(MODULE_NAME, [
        'db.service'
    ]).config(Config).service('SearchesService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _, $) {

        var service = {};

        service.seed = function () {
            service.create({_id:'Search_0',name:'iOS', query:'ios', categories:['sof', 'cpg'], default_response:'response_0'});
            service.create({_id:'Search_1',name:'Angular', query:'angular', categories:['sof', 'cpg'], default_response:'response_0'});
            service.create({_id:'Search_2',name:'Rails', query:'rails', categories:['sof', 'cpg'], default_response:'response_0'});
        };

        service.find = function (selector) {
            return DB.findDocs('search', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('search', selector);
        };

        service.create = function (search) {

            return DB.create('search', search);
        };


        return service;
    };

    module.exports = MODULE_NAME;

}());