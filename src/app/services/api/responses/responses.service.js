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
        remoteProvider.register('Process', './Process');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, $interpolate, File, Email, DB, _, $, SettingsService, PostsService, Process) {

        var service = {};

        service.seed = function () {

            var response = {
                _id: "response_0",
                name: "Response1",
                settings_id: 'settings_0',
                message: {
                    subject: Process.env.SMTP_SUBJECT,
                    text: Process.env.SMTP_TEXT,
                    attachments: [{
                        filename:Process.env.RESPONSE_FILENAME,
                        path:Process.env.RESPONSE_PATH
                    }]
                }
            };

            //$log.debug('response: ' + JSON.stringify(response,null,2));
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

            $rootScope.showToast('Send Response Start');

            //$log.debug('response: ' + JSON.stringify(response, null, 2));

            SettingsService.find({_id: response.settings_id}).then(function (result) {

                //$log.debug('settings results: ' + JSON.stringify(result, null, 2));

                if (result && result.docs && result.docs.length > 0) {
                    var settings = result.docs[0];

                    response.message.from = settings.email.from;

                    if (settings.email.test_mode === false) {
                        response.message.to = post.email;
                    } else {
                        response.message.to = settings.email.test_mode_email;
                    }



                    // TODO: parse and replace the response for tokens from the post

                    var subFn = $interpolate(response.message.subject);
                    var textFn = $interpolate(response.message.text);

                    response.message.subject = subFn(post);
                    response.message.text = textFn(post);

                    //$log.debug('response.message: ' + JSON.stringify(response.message, null, 2));

                    Email.sendEmail(response.message, settings.email.smtp, function (err, info) {

                        if (err) {

                            $log.debug('Email.sendEmail error: ' + JSON.stringify(err, null, 2));
                            post.state = PostsService.states.error;
                            post.error = err;
                            $rootScope.showToast('Send Response Error');
                        } else {
                            $log.debug('Email.sendEmail info: ' + JSON.stringify(info, null, 2));
                            post.state = PostsService.states.responded;
                            $rootScope.showToast('Send Response Success');
                        }

                        if (info) {
                            post.response_info = info;
                        }

                        PostsService.create(post).then(function (result) {
                            if (callback) {
                                callback(err, info, result)
                            }
                        })

                    });

                } else {

                    if (callback) {
                        callback({message: 'Could not find settings from response: ' + JSON.stringify(response, null, 2)})
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

        service.create = function (response) {

            return DB.create('response', response);
        };

        service.createWithAttachment = function (response, file) {

            var deferred = $q.defer();

            if (file) {
                service.saveAttachment(file, function (filename, error) {

                    if (error) {
                        $log.error('response.create.saveAttachment: ' + error);
                        deferred.reject(error);
                    } else {

                        var attachment = {};
                        attachment.filename = file.name;
                        attachment.path = File.responseAttachmentPath(file.name);
                        response.message.attachments = [attachment];

                        CreateResponseRecord(response, deferred);
                    }
                });
            } else {

                CreateResponseRecord(response, deferred);

            }

            function CreateResponseRecord(response, deferred) {
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