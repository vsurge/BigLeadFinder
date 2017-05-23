(function () {
    'use strict';

    require('./api/api.services');
    require('./db/db.service');
    window.JSZip = require('jszip');

    var MODULE_NAME = 'app.services';

    angular.module(MODULE_NAME, [
        'api.services',
        'db.service'
    ]).config(Config).service('AppServices', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('File', './File');
        remoteProvider.register('Process', './Process');

    }

    /* @ngInject */
    function Service(ApiServices,$log,$q,DB,File, Process) {

        this.api = ApiServices;
        this.db = DB;

        var self = this;

        this.seed = function () {



            var deferred = $q.defer();


            if (Process.env.NODE_ENV != 'development') {

                File.getFileBinaryProjectFile(Process.env.SEED_IMPORT,function(error,file){

                    self.importAll(file).then(function (result) {
                        $rootScope.showToast('SEED_IMPORT Complete!')
                        deferred.resolve(result);
                    });

                });

            } else {
                deferred.resolve();
            }



            return deferred.promise;

        }

        this.exportAll = function () {

            return this.exportData().then(function(zip){

                return self.exportFiles(zip).then(function(final_zip){

                    $log.debug('final_zip: ' + JSON.stringify(final_zip,null,2));
                    return final_zip.generateAsync({type:"blob"});
                });
            });
        };

        this.exportFiles = function (zip) {

            //$log.debug('exportFiles: ' + JSON.stringify(zip,null,2));

            var deferred = $q.defer();

            self.api.responses.find({}).then(function(result){

                //$log.debug('result: ' + JSON.stringify(result,null,2));
                var responses = result.docs;

                var promises = [];

                responses.forEach(function(response){

                    //$log.debug('response: ' + JSON.stringify(response,null,2));

                    if (response.message.attachments && response.message.attachments.length > 0 && response.message.attachments[0]) {
                        var deferredFile = $q.defer();
                        promises.push(deferredFile.promise);

                        File.getFileBinaryAttachment(response.message.attachments[0].filename, function (err, buffer) {

                            if (err) {
                                $log.error('exportFiles error: ' + err);
                                deferredFile.reject(err)
                            } else {

                                $log.debug('adding: ' + response.message.attachments[0].filename);
                                zip.folder("LeadFinderExport").folder("files").folder("response_attachments").file(response.message.attachments[0].filename, buffer, {binary: true});

                                deferredFile.resolve({
                                    filename: response.message.attachments[0].filename,
                                    buffer: buffer
                                });
                            }

                        });



                    }
                });


                var allPromises = $q.all(promises);

                allPromises.then(function(files){



                    deferred.resolve(zip);

                })


            });

            return deferred.promise;
        };

        this.exportData = function () {

            var deferred = $q.defer();
            var promises = [];

            for(var key in self.api) {

                (function(service) {

                    var promise = self.api[service].export().then(function(result){
                        return { name:service, docs:result.docs}
                    });
                    promises.push(promise);


                })(key)

            }

           var allPromise = $q.all(promises);

           allPromise.then(function(results){

               //$log.debug('Object.keys(results): ' + JSON.stringify(Object.keys(results),null,2));
               //console.dir(results)

               var zip = new JSZip();

               results.forEach(function(service){

                   zip.folder("LeadFinderExport").folder("data").file(service.name + '.json', JSON.stringify(service.docs,null,2));
               });


               deferred.resolve(zip);

            });

           return deferred.promise;

        };

        this.importAll = function (file) {

            var deferred = $q.defer();

            //$log.debug('importAll');

            this.importData(file).then(function(data_zip){

                //$log.debug('data_zip: ' + JSON.stringify(data_zip,null,2));

                //$log.debug('importData complete: ' + data_zip);

                self.importFiles(data_zip).then(function(zip){
                    deferred.resolve(zip);
                }).catch(function(error){
                    $log.error('importFiles error: ' + error)
                });

            });/*.catch(function(error){
                $log.error('importData error: ' + JSON.stringify(error,null,2))
            });*/

            return deferred.promise;

        };

        this.importFiles = function (zip) {

            //$log.debug('importFiles: ' + JSON.stringify(zip,null,2));
            //$log.debug('importFiles: ' + zip);

            var deferred = $q.defer();
            var promises = [];

            zip.folder("LeadFinderExport").folder("files").folder("response_attachments").forEach(function(relativePath,file_zip){

                var deferredFile = $q.defer();
                promises.push(deferredFile.promise);

                //$log.debug('file_zip: ' + JSON.stringify(file_zip,null,2));
                //$log.debug('relativePath: ' + relativePath);

                file_zip.async("binarystring").then(function success(content) {
                        // use the content

                    //$log.debug('content:')
                    File.saveFile(content,relativePath,function(result){
                            //$log.debug('saveAttachment');
                            deferredFile.resolve(file_zip);
                        })

                    },function error(e) {
                        // handle the error
                        $log.debug('error: ' + e);
                        deferredFile.reject(e);
                    });
            });

            var allPromises = $q.all(promises);

            allPromises.then(function(result){

                deferred.resolve(result);

            });

            return deferred.promise;
        };

        this.importData = function (file) {

            //$log.debug('importData');

            var deferred = $q.defer();

            var new_zip = new JSZip();
            // more files !
            new_zip.loadAsync(file)
                .then(function(zip) {
                    // you now have every files contained in the loaded zip

                    var promises = [];

                    for(var key in self.api) {

                        (function(service) {

                            var deferredFile = $q.defer();
                            promises.push(deferredFile.promise);

                            zip.folder("LeadFinderExport").folder("data").file(service + '.json').async("string").then(function(result){

                                var objects = JSON.parse(result).map(function(item){
                                    delete item._rev;
                                    return item;
                                });

                                console.dir(objects);

                                self.api[service].import(objects).then(function(result){
                                    //$log.debug(service + '.import: ' + result);
                                    deferredFile.resolve(result)
                                }).catch(function(error){
                                    $log.error(service + '.import: ' + error);
                                    deferredFile.reject(error);
                                });

                            });

                        })(key)

                    }

                    var allPromise = $q.all(promises);

                    allPromise.then(function(results){
                        //$log.debug('allPromise: ' + results);
                        deferred.resolve(zip);
                    },function(error){
                        $log.error('allPromise: ' + error);
                        deferred.reject(error);
                    });



                });


            return deferred.promise;

        };

    };

    module.exports = MODULE_NAME;

})();