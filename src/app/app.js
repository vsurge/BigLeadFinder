(function () {
    'use strict';

    require('angular-material/angular-material.css');

    window.jQuery = window.$ = require('jquery');

    require('angular');
    require('angular-material');
    require('angular-aria');
    require('angular-animate');

    require('./layout/layout');
    require('./views/dashboard/dashboard');
    require('./views/sign-in/sign-in');

    require('./services/app.services');

    require('./app.scss');

    var MODULE_NAME = 'app';

    angular.module(MODULE_NAME, [
        // Vendor Modules
        'ngMaterial',
        //'ngAria',
        //'ngAnimate',
        // App Modules
        'app.layout',
        'app.views.sign-in',
        'app.views.dashboard',
        // App Services
        'app.services'
    ]).run(Run).config(Config).config(Theme)

    /* @ngInject */
    function Run($rootScope,$log){

        $log.debug('app Run-X');

    }

    /* @ngInject */
    function Config($compileProvider) {



    }

    /* @ngInject */
    function Theme($mdThemingProvider) {

        $mdThemingProvider.theme('default');


    }

    module.exports = MODULE_NAME;

})();