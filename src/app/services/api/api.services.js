/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    require('./cities/cities.service');
    require('./posts/posts.service');
    require('./searches/searches.service');
    require('./responses/responses.service');
    require('./app-settings/app-settings.service');
    require('./email-settings/email-settings.service');

    var MODULE_NAME = 'api.services';

    angular.module(MODULE_NAME, [
        'api.cities',
        'api.posts',
        'api.searches',
        'api.responses',
        'api.app-settings',
        'api.email-settings'
    ]).service('ApiServices', Service);

    /** @ngInject */
    function Service($log,$q,CitiesService,PostsService,SearchesService,ResponsesService,AppSettingsService,EmailSettingsService) {

        this.cities = CitiesService;
        this.posts = PostsService;
        this.searches = SearchesService;
        this.responses = ResponsesService;
        this.app_settings = AppSettingsService;
        this.email_settings = EmailSettingsService;
    };

    module.exports = MODULE_NAME;

}());
