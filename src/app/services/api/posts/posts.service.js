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

        /*
         States:

         created
         responded
         rejected
         archived
         error
         */

        service.states = {};
        service.states.created = 'created';
        service.states.responded = 'responded';
        service.states.rejected = 'rejected';
        service.states.archived = 'archived';
        service.states.error = 'error';
        Object.freeze(service.states);

        service.updateState = function (_id, newState) {
            var deferred = $q.defer();

            service.find({_id: _id}).then(function (result) {

                if (result && result.docs && result.docs.length > 0) {
                    var post = result.docs[0];

                    post.state = newState;

                    service.create(post).then(function (create_result) {

                        deferred.resolve(create_result)
                    })

                } else {

                    deferred.reject({message: 'No results found.'});
                }


            }).catch(function (error) {
                $log.error('updateState: ' + error);
                deferred.reject(error);
            });

            return deferred.promise;
        };

        service.create = function (item) {

            return DB.create('post', item);
        }

        service.find = function (selector) {
            return DB.findDocs('post', selector);
        };

        service.remove = function (selector) {
            return DB.removeDocs('post', selector);
        };

        service.createIndexes = function () {

            DB.createIndex('_post_link_type', ['link', 'type'])
            DB.createIndex('_post_query_id', ['query_id'])
        };

        service.updatePosts = function (search) {

            $log.debug('Starting updatePosts');

            var chain = $q.when();

            var promises = [];

            var cities = [{href: 'https://austin.craigslist.org/', _id: "austin"}];

            var cats = search.categories;
            //var cats = [{_id: 'sof', name: "Software/QA/DBA"}, {_id: 'cpg', name: "Computer Programming Gigs"}];
            //var search = {_id: "a1b2c3d4e5", query: 'ios', name:'iOS'};

            cities.forEach(function (city) {

                cats.forEach(function (cat) {

                    chain = chain.then(function (items) {
                        return service.getCityRss(city, cat, search, items);
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

            var url = city.href + 'search/' + cat + '?format=rss&query=' + encodeURIComponent(query.query);

            $log.debug('url: ' + url);

            service.find({
                city_id: city._id,
                search_id: query._id,
                category_id: cat._id
            }).then(function (result) {

                $log.debug('service.getCityRss result: ' + JSON.stringify(result, null, 2));

                var existing_posts = (result.docs === undefined) ? [] : result.docs;

                $.get(url, function (data) {
                    var $xml = $(data);
                    //var xmlDoc = $.parseXML(data);
                    //var $xml = $(xmlDoc)
                    var _items = (items === undefined) ? [] : items;
                    $xml.find("item").each(function () {
                        var $this = $(this);

                        var link = $this.find("link").first().text();

                        var a = document.createElement('a');
                        a.id = 'temp_link';
                        a.href = link;
                        var link_parts = a.pathname.split('/');
                        //$log.debug('link_parts: ' + JSON.stringify(link_parts,null,2));
                        var filename = link_parts.pop();
                        var post_id = filename.split('.')[0];

                        //$log.debug('title: ' + $this.find("title").first().text());

                        var item = {
                            _id: post_id,
                            title: $this.find("title").first().text(),
                            link: link,
                            description: $this.find("description").first().text(),
                            publish_date: $this.find("date").text(),
                            city_id: city._id,
                            search_id: query._id,
                            category_id: cat._id,
                            state: service.states.created
                        };

                        // Let's retain the state for any existing item...
                        var existing_item = _.find(existing_posts, {_id: item._id});

                        if (existing_item) {
                            $log.debug('service.getCityRss existing item found! ' + JSON.stringify(existing_item, null, 2));
                            item.state = existing_item.state;
                        }

                        _items.push(item);
                    });

                    //$log.debug('items: ' + JSON.stringify(_items,null,2));

                    deferred.resolve(_items);
                });
            });

            return deferred.promise;

        };

        service.openPost = function (postUrl) {

            //$log.debug('Starting showPost: ' + postUrl);
            var bounds = currentWindow.getBounds()
            //$log.debug('currentWindow.getBounds(): ' + JSON.stringify(bounds,null,2));

            var deferred = $q.defer();

            Browser.openPost(bounds, postUrl, function (email, error) {
                if (email) {

                    //$log.debug('email: ' + JSON.stringify(email, null, 2));
                    //deferred.resolve();

                    //DB.findDocs('post',{link:{$eq:postUrl}}).then(function(results){
                    DB.findDocs('post', {link: postUrl}).then(function (results) {
                        //$log.debug('posts: ' + JSON.stringify(results, null, 2));

                        if (results && results.docs && results.docs.length > 0) {

                            var post = results.docs[0];

                            post.email = email;

                            DB.db.put(post).then(function (result) {

                                //$log.debug('db.put result: ' + JSON.stringify(result,null,2));

                            }).catch(function (error) {
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