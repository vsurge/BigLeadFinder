/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    require('./cities/cities.service');

    var MODULE_NAME = 'ls.craisglist.service';

    angular.module(MODULE_NAME, [
        'lf.cities.service'
    ]).service('lfCraigslist', Service);

    /** @ngInject */
    function Service(lfCitiesService,$log) {

        this.cities = lfCitiesService;
    };

    module.exports = MODULE_NAME;

}());
