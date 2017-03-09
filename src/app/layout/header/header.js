(function(){
    'use strict';

    require('./header.scss');

    var MODULE_NAME = 'app.layout.header';

    require('ngprogress/build/ngProgress.js');
    require('ngprogress/ngProgress.css');

    require('angular-breadcrumb');
    require('bootstrap/dist/css/bootstrap.css')

    angular.module(MODULE_NAME,[
        'ngProgress',
        'ncy-angular-breadcrumb'
    ]).controller('HeaderCtrl',Controller);

    /* @ngInject */
    function Controller($rootScope,$scope,ngProgressFactory) {

        $rootScope.ngProgress = ngProgressFactory.createInstance();

        $rootScope.ngProgress.setColor('firebrick');
        $rootScope.ngProgress.setHeight('3px');

        $scope.logout = function () {
            $rootScope.authenticated = false;
        };

    };

    module.exports = MODULE_NAME;

})();