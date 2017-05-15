/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.rejected-posts';

    require('services/db/db.service');
    require('services/api/base/base.factory');

    angular.module(MODULE_NAME, [
        'db.service',
        'api.service_base'
    ]).config(Config).service('RejectedPostsService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _, $,ServiceBase, currentWindow, CitiesService) {

        var service = function(){
            ServiceBase.constructor.call(this);

            //this.type = 'post';
            //Object.freeze(this.states);
        };

        service.prototype = Object.create(ServiceBase.constructor.prototype);
        service.prototype.type = 'rejected_post';

        service.prototype.seed = function () {

        };

        service.prototype.isRejected = function (post_id) {

            return service.prototype.find({post_id:post_id}).then(function(result){
                if (result && result.docs && result.docs.length > 0) {
                    return true;
                } else {
                    return false;
                }
            })
        };

        service.prototype.markRejected = function (post_id) {

            return service.prototype.create({post_id:post_id});
        };

        service.prototype.unMarkRejected = function (post_id) {

            return service.prototype.remove({post_id:post_id});
        };

        return new service();
    };

    module.exports = MODULE_NAME;

}());