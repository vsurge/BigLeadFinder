(function () {
    'use strict';

    var MODULE_NAME = 'app.layout.side-nav';

    require('./side-nav.scss');
    require('angular-material-sidenav');
    require('angular-material-sidenav/angular-material-sidenav.css');

    angular.module(MODULE_NAME, [
        'sasrio.angular-material-sidenav'
    ]).config(Config).controller('SidenavCtrl', Controller);

    /* @ngInject */
    function Config(ssSideNavSectionsProvider, $mdThemingProvider) {
        ssSideNavSectionsProvider.initWithSections([{
            id:'app.dashboard',
            name:'Dashboard',
            state:'app.dashboard',
            type:'link'
        },
            {
                id:'app.barcode',
                name:'Barcode',
                state:'app.barcode',
                type:'link'
            }]);


    };

    /* @ngInject */
    function Controller($scope, $timeout, ssSideNav) {
        $scope.menu = ssSideNav;

        // Show or Hide menu

         ssSideNav.setVisible('app.dashboard');
         ssSideNav.setVisibleFor([{
         id: 'app.dashboard',
         value: true
         }]);

    };

    module.exports = MODULE_NAME;

})();