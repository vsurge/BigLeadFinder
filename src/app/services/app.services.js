(function () {
    'use strict';

    require('./api/api.services');
    require('./db/db.service');
    window.JSZip = require('jszip');

    var MODULE_NAME = 'app.services';

    angular.module(MODULE_NAME, [
        'api.services',
        'db.service'
    ]).service('AppServices', Service);

    /* @ngInject */
    function Service(ApiServices,$log,$q,DB) {

        this.api = ApiServices;
        this.db = DB;

        var self = this;

        this.seed = function () {

            var chain = $q.when();

            for(var key in self.api) {

                (function(service) {

                    //$log.debug(JSON.stringify(service));

                    chain.then(function(){

                        return self.api[service].seed();
                    });

                })(key)

            }

            return chain;

        }

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

           var allPromise = $q.all(promises)

           allPromise.then(function(results){

               //$log.debug('Object.keys(results): ' + JSON.stringify(Object.keys(results),null,2));
               console.dir(results)

               var zip = new JSZip();

               results.forEach(function(service){

                   zip.folder("LeadFinderExport").folder("data").file(service.name + '.json', JSON.stringify(service.docs,null,2));
               });


               zip.generateAsync({type:"blob"}).then(function(result){

                   deferred.resolve(result)

               })
            });

           return deferred.promise;

        };

        this.importData = function () {

            var deferred = $q.defer();

            return deferred.promise;

        };

        this.importData = function (element) {

            var deferred = $q.defer();

            var new_zip = new JSZip();
            // more files !
            new_zip.loadAsync(element.files['0'])
                .then(function(zip) {
                    // you now have every files contained in the loaded zip

                    var promises = [];

                    for(var key in self.api) {

                        (function(service) {

                            zip.folder("LeadFinderExport").folder("data").file(service + '.json').async("string").then(function(result){

                                var objects = JSON.parse(result).map(function(item){
                                    delete item._rev;
                                    return item;
                                });

                                console.dir(objects);

                                var promise = self.api[service].import(objects);
                                promises.push(promise);
                            });

                        })(key)

                    }

                    var allPromise = $q.all(promises);

                    allPromise.then(function(results){

                        deferred.resolve(result)
                    });



                });


            return deferred.promise;

        };

    };

    module.exports = MODULE_NAME;

})();