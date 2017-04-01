/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.posts';

    require('services/db/db.service');

    angular.module(MODULE_NAME, [
        'db.service'
    ]).config(Config).service('PostsService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _, $) {

        var service = {};

        service.find = function (selector) {
            return DB.findDocs('post', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('post', selector);
        };

        service.updatePosts = function () {

            $log.debug('Starting updatePosts');

            var chain = $q.when();

            var promises = [];

            var cities = ['https://austin.craigslist.org/'];
            var cats = ['sof','cpg'];
            var query = 'ios';

            cities.forEach(function(cityUrl){

                cats.forEach(function(cat){

                    chain = chain.then(function(items){
                        return service.getCityRss(cityUrl,cat,query,items);
                    });

                });
            });

            chain.then(function(items){

                //$log.debug('AppServices.api.posts.updatePosts(): ' + JSON.stringify(items,null,2));
                return DB.createCollection('post',items);
            });

            chain.then(function(){

                return service.find();
            });

            return chain;
        };

        service.getCityRss = function (cityUrl, cat, query, items) {

            var deferred = $q.defer();
            // https://austin.craigslist.org/search/sof?format=rss&query=ios

            var url = cityUrl + 'search/' + cat + '?format=rss&query=' + encodeURIComponent(query);

            $.get(url, function(data) {
                var $xml = $(data);
                var _items = (items === undefined) ? [] : items;
                $xml.find("item").each(function() {
                    var $this = $(this);

                    var link = $this.find("link").text();

                    var a = document.createElement('a');
                    a.id = 'temp_link';
                    a.href = link;
                    var link_parts = a.pathname.split('/');
                    //$log.debug('link_parts: ' + JSON.stringify(link_parts,null,2));
                    var filename = link_parts.pop();
                    var post_id = filename.split('.')[0];

                    var item = {
                            _id:post_id,
                            title: $this.find("title").text(),
                            link: link,
                            description: $this.find("description").text(),
                            publish_date: $this.find("date").text()
                        }



                    _items.push(item);
                });

                //$log.debug('items: ' + JSON.stringify(_items,null,2));

                deferred.resolve(_items);
            });

            return deferred.promise;

        };

        service.openPost = function (postUrl) {

            $log.debug('Starting showPost: ' + postUrl);

            var deferred = $q.defer();

            Browser.openPost(postUrl,function (result, error) {
                if (result) {

                    $log.debug('result: ' + JSON.stringify(result,null,2));
                    deferred.resolve();
                }

                if (error) {
                    $log.error('error: ' + error)

                    deferred.reject(error);
                }

            },function(){

            });

            return deferred.promise;
        };

        service.getPostDetails = function (postUrl) {

            $log.debug('Starting getPostDetails: ' + postUrl);

            var deferred = $q.defer();

            Browser.getPostDetails(postUrl,function (result, error) {
                if (result) {

                    $log.debug('getPostDetails result: ' + JSON.stringify(result,null,2));
                    deferred.resolve(result);
                }

                if (error) {
                    $log.error('getPostDetails error: ' + error)

                    deferred.reject(error);
                }

            });

            return deferred.promise;
        };

        return service;
    };

    module.exports = MODULE_NAME;

}());