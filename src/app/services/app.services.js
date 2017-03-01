(function () {
    'use strict';

    require('./api/api.services');
    require('./craigslist/craigslist.service');

    var MODULE_NAME = 'app.services';

    angular.module(MODULE_NAME, [
        'api.services',
        'ls.craisglist.service'
    ]).service('AppServices', Service);

    /* @ngInject */
    function Service(ApiServices,lfCraigslist,$log) {

        this.api = ApiServices;
        this.cl = lfCraigslist;
    };

    module.exports = MODULE_NAME;

})();