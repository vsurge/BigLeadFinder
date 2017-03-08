(function(){
    'use strict';

    var MODULE_NAME = 'app.views.search';
    require('angular-ui-router');
    require('./search.scss');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('SearchCtrl',Controller);

    /* @ngInject */
    function Controller($scope,$log,AppServices) {

        var Init = function () {

        };

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.search', {
                url: '/search',
                views: {
                    'container@': {
                        template: require('./search.html'),
                        controller: 'SearchCtrl',
                        controllerAs: 'vm'
                    }
                }
            });
    };

    module.exports = MODULE_NAME;

})();