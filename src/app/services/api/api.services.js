/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    require('./cities/cities.service');
    require('./posts/posts.service');

    var MODULE_NAME = 'api.services';

    angular.module(MODULE_NAME, [
        'api.cities',
        'api.posts'
    ]).service('ApiServices', Service);

    /** @ngInject */
    function Service(CitiesService,PostsService,$log) {

        this.cities = CitiesService;
        this.posts = PostsService;
    };

    module.exports = MODULE_NAME;

}());
