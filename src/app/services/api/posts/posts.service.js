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
    function Service($rootScope, $log, $q, Browser, DB, _, $, currentWindow) {

        var service = {};

        service.find = function (selector) {
            return DB.findDocs('post', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('post', selector);
        };

        service.createIndexes = function () {

            DB.createIndex('_post_link_type',['link','type'])
            DB.createIndex('_post_query_id',['query_id'])
        };

        service.updatePosts = function () {

            $log.debug('Starting updatePosts');

            var chain = $q.when();

            var promises = [];

            var cities = [{href: 'https://austin.craigslist.org/', _id: "austin"}];
            var cats = [{_id: 'sof', name: "Software/QA/DBA"}, {_id: 'cpg', name: "Computer Programming Gigs"}];
            var query = {_id: "a1b2c3d4e5", query: 'ios'};

            cities.forEach(function (city) {

                cats.forEach(function (cat) {

                    chain = chain.then(function (items) {
                        return service.getCityRss(city, cat, query, items);
                    });

                });
            });

            chain.then(function (items) {

                //$log.debug('AppServices.api.posts.updatePosts(): ' + JSON.stringify(items,null,2));
                return DB.createCollection('post', items);
            });

            chain.then(function () {

                return service.find();
            });

            return chain;
        };

        service.getCityRss = function (city, cat, query, items) {

            var deferred = $q.defer();
            // https://austin.craigslist.org/search/sof?format=rss&query=ios

            var url = city.href + 'search/' + cat._id + '?format=rss&query=' + encodeURIComponent(query.query);

            $.get(url, function (data) {
                var $xml = $(data);
                var _items = (items === undefined) ? [] : items;
                $xml.find("item").each(function () {
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
                        _id: post_id,
                        title: $this.find("title").text(),
                        link: link,
                        description: $this.find("description").text(),
                        publish_date: $this.find("date").text(),
                        city_id: city._id,
                        query_id: query._id,
                        category_id: cat._id
                    };

                    _items.push(item);
                });

                //$log.debug('items: ' + JSON.stringify(_items,null,2));

                deferred.resolve(_items);
            });

            return deferred.promise;

        };

        service.openPost = function (postUrl) {

            //$log.debug('Starting showPost: ' + postUrl);
            var bounds = currentWindow.getBounds()
            //$log.debug('currentWindow.getBounds(): ' + JSON.stringify(bounds,null,2));

            var deferred = $q.defer();

            Browser.openPost(bounds,postUrl, function (email, error) {
                if (email) {

                    //$log.debug('email: ' + JSON.stringify(email, null, 2));
                    //deferred.resolve();

                    //DB.findDocs('post',{link:{$eq:postUrl}}).then(function(results){
                    DB.findDocs('post',{link:postUrl}).then(function(results){
                        //$log.debug('posts: ' + JSON.stringify(results, null, 2));

                        if (results && results.docs && results.docs.length > 0) {

                            var post = results.docs[0];

                            post.email = email;

                            DB.db.put(post).then(function(result){

                                //$log.debug('db.put result: ' + JSON.stringify(result,null,2));

                            }).catch(function(error){
                                $log.error('db.put error:' + error);
                            });


                        }
                    })
                }

                if (error) {
                    $log.error('error: ' + error)

                    //deferred.reject(error);
                }

            }, function () {

            });

            //return deferred.promise;
        };

        service.getPostDetails = function (postUrl) {

            $log.debug('Starting getPostDetails: ' + postUrl);

            var deferred = $q.defer();

            Browser.getPostDetails(postUrl, function (result, error) {
                if (result) {

                    $log.debug('getPostDetails result: ' + JSON.stringify(result, null, 2));
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