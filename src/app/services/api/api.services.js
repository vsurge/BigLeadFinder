/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    require('./cities/cities.service');
    require('./posts/posts.service');
    require('./searches/searches.service');

    var MODULE_NAME = 'api.services';

    angular.module(MODULE_NAME, [
        'api.cities',
        'api.posts',
        'api.searches'
    ]).service('ApiServices', Service);

    /** @ngInject */
    function Service(CitiesService,PostsService,SearchesService,$log) {

        this.cities = CitiesService;
        this.posts = PostsService;
        this.searches = SearchesService;
    };

    module.exports = MODULE_NAME;

}());
