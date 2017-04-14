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
        remoteProvider.register('File', './File');
        remoteProvider.register('Email', './Email');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, File, Email, DB, _, $, SettingsService) {

        var service = {};

        service.seedResponse = function () {

            var response = {
                _id: "response_0",
                name: "Response1",
                body: "Lorem Ipsum dolor sit amit."
            };
            // Save File
            // Create Response
            return service.create(response)
        };

        service.saveAttachment = function (file, callback) {

            $log.debug('saveAttachment file: ' + JSON.stringify(file, null, 2));

            var reader = new FileReader();
            reader.addEventListener("loadend", function () {
                // reader.result contains the contents of blob as a typed array

                File.saveFile(reader.result, file.name, function (filename, error) {
                    $log.debug('saveAttachment complete: ' + error);

                    if (callback) {
                        callback(filename,error);
                    }
                })
            });

            //reader.readAsArrayBuffer(file);
            reader.readAsBinaryString(file);
        };

        service.sendResponse = function (post, response) {


        };

        service.find = function (selector) {
            return DB.findDocs('response', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('response', selector);
        };

        service.create = function (response, attachment) {

            var deferred = $q.defer();

            if (attachment) {
                response.attachment = attachment.name;
            }

            //$log.debug('response, attachment: ' + response, attachment)

            DB.create('response', response).then(function () {

                if (attachment) {
                    service.saveAttachment(attachment, function (filename,error) {

                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve();
                        }
                    });
                } else {

                    deferred.resolve();

                }

            }).catch(function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }

        return service;
    };

    module.exports = MODULE_NAME;

}());