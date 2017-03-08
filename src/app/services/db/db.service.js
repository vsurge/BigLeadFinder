/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'db.service';

    window.PouchDB = require('pouchdb-browser');
    PouchDB.plugin(require('pouchdb-find'));
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

            service.db = pouchDB('lead_finder');
        };

        service.findDocs = function (type, selector) {

            var defaultSelector = {type: {$eq: type}};

            return service.db.find({
                selector: defaultSelector
            }).then(function (result) {

                return result;

            },function(error){

                $log.error(error);
            });
        };

        service.removeDocs = function (type, selector) {

            return service.findDocs(type, selector).then(function (result) {

                if (result && result.docs) {
                    $log.debug('removing ' + result.docs.length + ' docs.');
                }

                result.docs.forEach(function (doc) {

                    $log.debug('removing: ' + doc._id);
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

        return service;
    };

    module.exports = MODULE_NAME;

}());
