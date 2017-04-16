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
    function Service($rootScope, $log, $q, $interpolate, File, Email, DB, _, $, SettingsService) {

        var service = {};

        service.seed = function () {

            var response = {
                _id: "response_0",
                name: "Response1",
                settings_id:'settings_0',
                message: {
                    subject: '',
                    text: '',
                    attachments:[]
                }
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
                    //$log.debug('saveAttachment complete: ' + error);

                    if (callback) {
                        callback(filename, error);
                    }
                })
            });

            //reader.readAsArrayBuffer(file);
            reader.readAsBinaryString(file);
        };

        service.sendResponse = function (post, response, callback) {

            //$log.debug('response: ' + JSON.stringify(response, null, 2));

            SettingsService.find({_id:response.settings_id}).then(function(result){

                //$log.debug('settings results: ' + JSON.stringify(result, null, 2));

                if (result && result.docs && result.docs.length > 0)
                {
                    var settings = result.docs[0];

                    response.message.from = settings.email.from;
                    response.message.to = settings.email.test_mode_email;

                    // TODO: parse and replace the response for tokens from the post

                    var subFn = $interpolate(response.message.subject);
                    var textFn = $interpolate(response.message.text);

                    response.message.subject = subFn(post);
                    response.message.text = textFn(post);

                    $log.debug('response.message: ' + JSON.stringify(response.message, null, 2));

                    Email.sendEmail(response.message, settings.email.smtp, callback);
                } else {

                    if (callback) {
                        callback({message:'Could not find settings from response: ' + JSON.stringify(response, null, 2)})
                    }
                }

            });
        };

        service.find = function (selector) {
            return DB.findDocs('response', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('response', selector);
        };

        service.create = function (response, file) {

            var deferred = $q.defer();

            if (file) {
                service.saveAttachment(file, function (filename, error) {

                    if (error) {
                        $log.error('response.create.saveAttachment: '  + error);
                        deferred.reject(error);
                    } else {

                        var attachment = {};
                        attachment.filename = file.name;
                        attachment.path = File.responseAttachmentPath(file.name);
                        response.message.attachments = [attachment];

                        CreateResponseRecord(response,deferred);
                    }
                });
            } else {

                CreateResponseRecord(response,deferred);

            }

            function CreateResponseRecord(response,deferred){
                DB.create('response', response).then(function (result) {

                    deferred.resolve(result);

                }).catch(function (error) {
                    deferred.reject(error);
                });
            }

            //$log.debug('response, attachment: ' + response, attachment)


            return deferred.promise;
        }

        return service;
    };

    module.exports = MODULE_NAME;

}());