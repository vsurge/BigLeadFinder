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
    function Service(ApiServices,$log,DB) {

        this.api = ApiServices;
        this.db = DB;
    };

    module.exports = MODULE_NAME;

})();