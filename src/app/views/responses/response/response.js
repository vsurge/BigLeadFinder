(function(){
    'use strict';

    var MODULE_NAME = 'app.views.response';
    require('angular-ui-router');
    require('./response.scss');
    require('dropzone');
    require('dropzone/dist/dropzone.css');
    require('ngdropzone');

    angular.module(MODULE_NAME,[
        'ui.router',
        'thatisuday.dropzone'
    ]).config(Config).controller('ResponseCtrl',Controller);

    /* @ngInject */
    function Controller($scope,$log,AppServices,response) {

        $scope.response = response.docs[0];

        $scope.updateResponse = function (response) {
            //$log.debug('settings: ' + JSON.stringify(settings,null,2));
            AppServices.api.responses.create(response)
        }

        //Set options for dropzone
        //Visit http://www.dropzonejs.com/#configuration-options for more options
        $scope.dzOptions = {
            url : function (files) {
                $log.debug('addedfile ' + JSON.stringify(files,null,2));
            },
            autoProcessQueue:true,
            paramName : 'photo',
            addRemoveLinks : true
        };


        //Handle events for dropzone
        //Visit http://www.dropzonejs.com/#events for more events
        $scope.dzCallbacks = {
            'addedfile' : function(file){
                //console.log('addedfile ' + JSON.stringify(file,null,2));
                //$scope.newFile = file;
            },
            'success' : function(file, xhr){
                $log.debug(file, xhr);
            }
        };

        var Init = function () {
            $log.debug('response: ' + JSON.stringify(response,null,2));
        };

        Init();

    };

    /* @ngInject */
    function Config($stateProvider) {
        $stateProvider
            .state('app.response', {
                url: '/response/:_id',
                views: {
                    'container@': {
                        template: require('./response.html'),
                        controller: 'ResponseCtrl',
                        controllerAs: 'vm'
                    }
                },
                resolve:{
                    response:function ($stateParams,AppServices) {
                        return AppServices.api.responses.find({_id:$stateParams._id});
                    }
                },
                ncyBreadcrumb: {
                    label: 'Responses',
                    parent:'app.responses'
                }
            });
    };

    module.exports = MODULE_NAME;

})();