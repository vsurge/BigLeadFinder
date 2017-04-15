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

        service.seedSearches = function () {
            service.find().then(function (searches) {

                // $log.debug('searches.find(): ' + JSON.stringify(searches,null,2));
                if (!searches || !searches.docs || searches.docs.length < 1) {

                    service.create('iOS', 'ios', ['sof', 'cpg']);
                    service.create('Angular', 'angular', ['sof', 'cpg']);
                    service.create('Rails', 'rails', ['sof', 'cpg']);
                }
            });
        };

        service.find = function (selector) {
            return DB.findDocs('search', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('search', selector);
        };

        service.create = function (name, query, categories) {

            var search = {};

            search.categories = categories;
            search.query = query;
            search.name = name;

            return DB.create('search', search);
        };


        return service;
    };

    module.exports = MODULE_NAME;

}());