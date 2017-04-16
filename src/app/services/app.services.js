(function () {
    'use strict';

    require('./api/api.services');
    require('./db/db.service');


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
                    //var state = JSON.parse(JSON.stringify(input));
                    //$log.debug(state);

                    chain.then(function(){

                        return self.api[service].seed();
                    });

                })(key)

            }

            return chain;

        };
    };

    module.exports = MODULE_NAME;

})();