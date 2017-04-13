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

        service.seedResponse = function () {

            var response = {_id:"response_0",name:"Response1",body:"Lorem Ipsum dolor sit amit.",attachment:"/opt/var/bin/file.doc"};
            // Save File
            // Create Response
            return service.create(response)
        };

        service.saveAttachment = function (data,filename) {

            $log.debug('data: ' + JSON.stringify(data,null,2));
            $log.debug('filename: ' + filename);
        };

        service.find = function (selector) {
            return DB.findDocs('response', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('response', selector);
        };

        service.create = function (response) {

            return DB.create('response',response);
        }

        return service;
    };

    module.exports = MODULE_NAME;

}());