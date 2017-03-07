/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    require('./cities/cities.service');

    var MODULE_NAME = 'api.services';

    angular.module(MODULE_NAME, [
        'api.cities'
    ]).service('ApiServices', Service);

    /** @ngInject */
    function Service(CitiesService,$log) {

        this.cities = CitiesService;
    };

    module.exports = MODULE_NAME;

}());
