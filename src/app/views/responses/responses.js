(function(){
    'use strict';

    var MODULE_NAME = 'app.views.responses';
    require('angular-ui-router');

    angular.module(MODULE_NAME,[
        'ui.router'
    ]).config(Config).controller('ResponsesCtrl',Controller);

    /* @ngInject */
    function Controller($scope,$log,AppServices) {

        var Init = function () {

        }

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.responses', {
                url: '/responses',
                views: {
                    'container@': {
                        template: require('./responses.html'),
                        controller: 'ResponsesCtrl',
                        controllerAs: 'vm'
                    }
                },
                ncyBreadcrumb: {
                    label: 'Responses'
                }
            });
    };

    module.exports = MODULE_NAME;

})();