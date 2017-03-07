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

            var defaultSelector = {type: {$eq: 'city'}};

            return service.db.find({
                selector: defaultSelector
            });

        };

        service.removeDocs = function (type, selector) {

            return service.findDocs(type,selector).then(function(result){

                $log.debug('removing ' + result.docs.length + ' docs.');
                result.docs.forEach(function(doc){

                    $log.debug('removing: ' + doc._id);
                    service.db.remove(doc);
                });

            })

        }

        service.createCollection = function (type, items) {

            var deferred = $q.defer();

            var docs = _.map(items, function (item) {
                item.type = type;
                return item;
            });

            service.db.bulkDocs(docs)
                .then(function (result) {
                    // handle result

                    deferred.resolve(result);

                })
                .catch(function (err) {
                    $log.error(err);
                    deferred.reject(err);
                });

            return deferred.promise;
        };

        return service;
    };

    module.exports = MODULE_NAME;

}());
