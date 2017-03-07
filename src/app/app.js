(function () {
    'use strict';

    require('angular-material/angular-material.css');

    window.$ = window.jQuery = require('jquery');
    window._ = require('underscore');

    require('angular');
    require('angular-material');
    require('angular-aria');
    require('angular-animate');

    require('angular-electron');

    require('./layout/layout');
    require('./views/dashboard/dashboard');
    require('./views/cities/cities');
    require('./views/sign-in/sign-in');

    require('./services/app.services');

    require('./app.scss');

    var MODULE_NAME = 'app';

    angular.module(MODULE_NAME, [
        // Vendor Modules
        'ngMaterial',
        'angular-electron',
        //'ngAria',
        //'ngAnimate',
        // App Modules
        'app.layout',
        'app.views.sign-in',
        'app.views.dashboard',
        'app.views.cities',
        // App Services,
        'app.services'
    ]).constant('_',
        window._
    ).run(Run).config(Config).config(Theme)

    /* @ngInject */
    function Run($rootScope,$log,process,AppServices){

        $log.debug('Node v' + process.versions.node);
        $log.debug('Chrome v' + process.versions.chrome);
        $log.debug('Electron v' + process.versions.electron);

        AppServices.db.initDb();

    }

    /* @ngInject */
    function Config($qProvider,$urlRouterProvider) {

        $qProvider.errorOnUnhandledRejections(false);
        $urlRouterProvider.otherwise('/cities');
    }

    /* @ngInject */
    function Theme($mdThemingProvider) {

        $mdThemingProvider.theme('default');
    }

    module.exports = MODULE_NAME;

})();