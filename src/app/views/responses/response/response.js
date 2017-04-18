(function(){
    'use strict';

    var MODULE_NAME = 'app.views.response';
    require('angular-ui-router');
    require('./response.scss');
    window.Dropzone = require('dropzone');

    window.Dropzone.autoDiscover = false;

    require('dropzone/dist/dropzone.css');
    require('ngdropzone');

    angular.module(MODULE_NAME,[
        'ui.router',
        'thatisuday.dropzone'
    ]).config(Config).controller('ResponseCtrl',Controller);

    /* @ngInject */
    function Controller($scope,$log,$timeout,AppServices,response,$,_) {

        $scope.dzMethods = {};
        $scope.response = response.docs[0];

        $scope.updateResponse = function (response) {
            var files = $scope.dropzone.getAcceptedFiles();
            var file = undefined;

            if (files && files.length > 0) {
                file = files[0];
            }

            AppServices.api.responses.createWithAttachment(response,file).then(function(){
                $scope.dropzone.removeAllFiles(true);

                Response(AppServices,{_id:$scope.response._id}).then(function(updatedResponse){

                    $scope.response = updatedResponse.docs[0];

                    //$log.debug('$scope.response: ' + JSON.stringify($scope.response,null,2));
                })
            });
        };

        //$scope.dropzone = $("div#responseAttachmentDropzone").dropzone({url:'/no/url'});

        //Set options for dropzone
        //Visit http://www.dropzonejs.com/#configuration-options for more options
        $scope.dzOptions = {
            url : function (files) {
                //$log.debug('addedfile ' + JSON.stringify(files,null,2));

            },
            uploadMultiple:false,
            autoProcessQueue:false,
            paramName : 'file',
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
                //$log.debug(file, xhr);
            }
        };

        var Init = function () {
            //$log.debug('response: ' + JSON.stringify($scope.response,null,2));

            $timeout(function(){
                $scope.dropzone = $scope.dzMethods.getDropzone();
            })
        };

        Init();

    };

    /* @ngInject */
    function Config($stateProvider, remoteProvider) {

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
                    response:Response
                },
                ncyBreadcrumb: {
                    label: 'Responses',
                    parent:'app.responses'
                }
            });
    };

    /* @ngInject */
    function Response (AppServices,$stateParams) {
        return AppServices.api.responses.find({_id:$stateParams._id});
    }

    module.exports = MODULE_NAME;

})();