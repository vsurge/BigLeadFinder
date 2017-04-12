/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.responses';

    require('services/db/db.service');

    angular.module(MODULE_NAME, [
        'db.service'
    ]).config(Config).service('ResponsesService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _, $) {

        var service = {};

        service.find = function (selector) {
            return DB.findDocs('response', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('response', selector);
        };

        service.create = function (query,categories) {

            var search = {};

            search.categories = categories;
            search.query = query;

            return DB.create('response',search);
        }

        return service;
    };

    module.exports = MODULE_NAME;

}());