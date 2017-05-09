/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'db.service';

    window.PouchDB = require('pouchdb-browser');
    window.PouchDB.plugin(require('pouchdb-find'));
    //window.PouchDB.adapter('worker', require('worker-pouch'));
    require('angular-pouchdb');

    angular.module(MODULE_NAME, [
        'pouchdb'
    ]).config(Config).service('DB', Service);

    /** @ngInject */
    function Config() {

    }

    /** @ngInject */
    function Service($rootScope, $log, $q, pouchDB, _) {

        var service = {};

        service.initDb = function () {

           // service.db = pouchDB('lead_finder', {adapter: 'worker'});
            service.db = pouchDB('lead_finder');
            service.createIndex('_type',['type'])
            $log.debug('db.adapter: ' + service.db.adapter);
            //PouchDB.debug.enable('*');
            PouchDB.debug.disable();
        };

        service.createIndex = function (name,fields) {

            return service.db.createIndex({
                index: {
                    name: name,
                    fields: fields
                }
            }).then(function(result){
                //$log.debug('result: ' + JSON.stringify(result,null,2))

            }).catch(function(error){
                $log.debug('error: ' + error);

                //deferred.reject(error)
            });
        };

        service.findByID = function (type, _id, options) {

            var deferred = $q.defer();

            service.findDocs(type,{_id:_id.toString()},options).then(function (results) {

                //$log.debug('findByID results: ' + JSON.stringify(results,null,2));
                deferred.resolve(results.docs[0]);

            },function(error){

                $log.error(error);
                deferred.reject(error)
            });

            return deferred.promise;
        };

        service.findDocs = function (type, selector, options) {

            var predicate = {};
            var finalSelector = {};
            var defaultSelector = {type: {$eq: type}};

            //$log.debug('selector: ',JSON.stringify(selector,null,2))

            if (selector) {
                finalSelector = {$and:[defaultSelector,selector]};
            } else {
                finalSelector = defaultSelector
            }

            predicate.selector = finalSelector;

            if (options) {
                predicate = Object.assign(predicate,options)
            }

            //$log.debug('predicate: ',JSON.stringify(predicate,null,2))

            return service.db.find(predicate).then(function (results) {

                //$log.debug('findDocs results: ' + JSON.stringify(results,null,2));

                return results;

            },function(error){

                $log.error(error);
            });
        };

        service.removeDocs = function (type, selector) {

            return service.findDocs(type, selector).then(function (result) {

                if (result && result.docs) {
                    //$log.debug('removing ' + result.docs.length + ' docs.');
                }

                result.docs.forEach(function (doc) {

                    //$log.debug('removing: ' + doc._id);
                    service.db.remove(doc);
                });

            })

        }

        service.create = function(type,doc) {

            return service.createCollection(type,[doc]);
        }

        service.createCollection = function (type, docs) {

            var deferred = $q.defer();

            var docs = _.map(docs, function (doc) {
                doc.type = type;
                return doc;
            });

            //$log.debug('db.createCollection: ' + JSON.stringify(docs,null,2));

            service.db.bulkDocs(docs)
                .then(function (result) {
                    // handle result

                    deferred.resolve(result);

                })
                .catch(function (err) {
                    $log.error(err);
                    deferred.reject(err);
                })
                .finally(function () {

                });

            return deferred.promise;
        };

        service.initDb();

        return service;
    };

    module.exports = MODULE_NAME;

}());
