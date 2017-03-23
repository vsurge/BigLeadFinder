(function () {
    'use strict';

    var MODULE_NAME = 'app.post-detail.directive';

    require('./post-detail.directive.scss');

    angular.module(MODULE_NAME, [
    ]).directive('postDetail', Directive);

    /* @ngInject */
    function Link(scope, element, attrs, controller) {

    }

    /* @ngInject */
    function Controller($rootScope, $scope, $log, $sce) {

        $scope.renderHtml = function(html_code)
        {
            return $sce.trustAsHtml(html_code);
        };

        function Init() {

            $scope.$watch('post', function () {
                //$log.debug('directive $scope.post: ' + JSON.stringify($scope.post,null,2));
            });
        }

        Init();

    }

    function Directive() {
        return {
            restrict: 'E',
            template: require('./post-detail.directive.html'),
            controller: Controller,
            scope: {
                post: '=',
                email: '='
            },
            link: Link
        };
    }

    module.exports = MODULE_NAME;

})();