/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.skus';

    require('angular-resource');
    window.Papa = require('papaparse');

    angular.module(MODULE_NAME,[
        'ngResource'
    ]).service('SkusService', Service);

    /** @ngInject */
    function Service($rootScope,$resource,$http,$log,$q) {
        //var path = 'assets/skus.json';
        var path = 'assets/skus.csv';
        var model =  $resource(path, {}, {});

        model.getDefaultSkus = function (completion) {
            var temp_skus = [];
            Papa.parse(path, {
                download: true,
                header: true,
                dynamicTyping: true,
                step: function(row) {

                    temp_skus.push(row.data[0])
                },
                complete: function() {
                    $rootScope.skus = temp_skus;
                    //$log.debug('getDefaultSkus Loaded: ' + $rootScope.skus.length + ' items.');

                    if (completion) {
                        completion();
                    }
                }
            });
        };
        /*
        model.getDefaultSkus = function () {
            return $http.get(path).then(function(response) {
                $rootScope.skus = Papa.parse(response.data).data;
                $log.debug('$rootScope.skus[0]: ' + JSON.stringify($rootScope.skus[0],null,2));
                //$log.debug('$rootScope.skus: ' + $rootScope.skus);
            },function(error){});
        };
        */

        /*
        model.getDefaultSkus = function () {
            return model.query({},function(result){

                //$log.debug('model.defaultSkus: ',JSON.stringify(model.defaultSkus,null,2));
                $rootScope.skus = fCsv.toJson(result.data);

                $log.debug('$rootScope.skus: ' + JSON.stringify($rootScope.skus,null,2));

            }).$promise;
        };
        */

        //model.getDefaultSkus();

        model.getBase64Image = function (url) {

            var deferred = $q.defer();

            var img = new Image();

            var canvas = document.createElement("canvas");
            canvas.width = 560;
            canvas.height = 180;
            var ctx = canvas.getContext("2d");

            img.onload = function () {
                ctx.drawImage(img, 0, 0);

                var dataURL = canvas.toDataURL("image/png");
                deferred.resolve(dataURL);
            }

            img.setAttribute("src", url);

            return deferred.promise;
        }

        return model;
    };

    module.exports = MODULE_NAME;

}());
