(function(){
    'use strict';

    var MODULE_NAME = 'app.views.email-settings';
    require('angular-ui-router');

    require('datatables.net');
    require('angular-datatables/dist/angular-datatables');
    require('angular-datatables/dist/css/angular-datatables.css');
    require('material-design-lite/material.css');
    require('dataTables.material');
    require('dataTables.material.css');

    require('./email-settings-detail/email-settings-detail');

    angular.module(MODULE_NAME,[
        'ui.router',
        'datatables',
        'app.views.email-settings-detail'
    ]).config(Config).controller('EmailSettingsCtrl',Controller);

    /* @ngInject */
    function Controller($scope,$log,$state,AppServices,email_settings, DTOptionsBuilder, DTColumnDefBuilder) {

        function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            // Unbind first in order to avoid any duplicate handler (see https://github.com/l-lin/angular-datatables/issues/87)
            $('td', nRow).unbind('click');
            $('td', nRow).bind('click', function () {
                $scope.$apply(function () {
                    $scope.onRowSelect(aData);
                });
            });
            return nRow;
        }

        $scope.onRowSelect = function (item) {

            //$log.debug('item: ' + JSON.stringify(item,null,2));
            $state.go('app.email-settings-detail',item);

        };

        $scope.data = [];



        /*
         $scope.$watch('cities',function(){
         $scope.data = $rootScope.cities;
         },true)
         */

        $scope.AppServices = AppServices;

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('simple_numbers')
            //.withOption('rowCallback', rowCallback)
            .withOption('searching', false)
            .withOption('order', [[ 0, "asc" ]]);
        $scope.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0).withOption('visible', false),
            DTColumnDefBuilder.newColumnDef(1).withOption('className', 'mdl-data-table__cell--non-numeric'),
        ];

        $scope.editSettings = function (item) {
            $state.go('app.email-settings-detail',item);
        }

        function Init() {

            //$log.debug('$scope.data: ' + JSON.stringify($scope.data,null,2));


            if (email_settings && email_settings.docs) {
                $scope.data = email_settings.docs;


            }
        }

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.email-settings', {
                url: '/email-settings',
                views: {
                    'container@': {
                        template: require('./email-settings.html'),
                        controller: 'EmailSettingsCtrl',
                        controllerAs: 'vm'
                    }
                },
                resolve:{
                    email_settings: function (AppServices) {

                        return AppServices.api.email_settings.find({});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Email Settings',
                    parent:'app.responses'
                }
            });
    };

    module.exports = MODULE_NAME;

})();