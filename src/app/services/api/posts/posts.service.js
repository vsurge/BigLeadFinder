/**
 * Created by vincilbishop on 1/21/16.
 */
(function () {
    'use strict';

    var MODULE_NAME = 'api.posts';

    require('services/db/db.service');
    require('services/api/base/base.factory');
    require('services/api/rejected-posts/rejected-posts.service');

    angular.module(MODULE_NAME, [
        'db.service',
        'api.service_base',
        'api.rejected-posts'
    ]).config(Config).service('PostsService', Service);

    /** @ngInject */
    function Config(remoteProvider) {
        remoteProvider.register('Browser', './Browser');
    }

    /** @ngInject */
    function Service($rootScope, $log, $q, Browser, DB, _, $, ServiceBase, currentWindow, CitiesService, RejectedPostsService) {

        var service = function () {
            ServiceBase.constructor.call(this);

            //this.type = 'post';
            //Object.freeze(this.states);
        };

        service.prototype = Object.create(ServiceBase.constructor.prototype);
        service.prototype.type = 'post';

        service.prototype.seed = function () {
            DB.createIndex('_post_link_type', ['link', 'type']);
            DB.createIndex('_post_query_id', ['query_id']);
            DB.createIndex('_post_state_search', ['state', 'search_id']);
        };

        /*
         States:

         created
         responded
         rejected
         archived
         error
         */
        service.prototype.states = {};
        service.prototype.states.created = 'created';
        service.prototype.states.responded = 'responded';
        service.prototype.states.rejected = 'rejected';
        service.prototype.states.archived = 'archived';
        service.prototype.states.error = 'error';


        service.prototype.updateState = function (_id, newState) {
            var deferred = $q.defer();

            service.prototype.find({_id: _id}).then(function (result) {

                if (result && result.docs && result.docs.length > 0) {
                    var post = result.docs[0];

                    if (newState == service.prototype.states.rejected) {
                        RejectedPostsService.markRejected(post._id);
                    }

                    if (post.state == service.prototype.states.rejected && newState != service.prototype.states.rejected) {
                        RejectedPostsService.unMarkRejected(post._id);
                    }

                    post.state = newState;

                    service.prototype.create(post).then(function (create_result) {

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

        /*
         service.create = function (item) {

         return DB.create('post', item);
         }

         service.find = function (selector, options) {
         return DB.findDocs('post', selector, options);
         };

         service.findByID = function (_id, options) {
         return DB.findByID('post', _id, options);
         };
         service.remove = function (selector) {
         return DB.removeDocs('post', selector);
         };
         */


        service.prototype.updatePosts = function (search) {

            $rootScope.showToast('Update Posts Start');

            $log.debug('Starting updatePosts');

            var chain = $q.when();

            CitiesService.find({}).then(function (result) {

                var promises = [];

                //var cities = [{href: 'https://austin.craigslist.org/', _id: "austin"}];
                var cities = result.docs;

                var cats = search.categories;
                //var cats = [{_id: 'sof', name: "Software/QA/DBA"}, {_id: 'cpg', name: "Computer Programming Gigs"}];
                //var search = {_id: "a1b2c3d4e5", query: 'ios', name:'iOS'};

                var i_total = cities.length * cats.length;

                var i_current = 0;

                cities.forEach(function (city) {

                    cats.forEach(function (cat) {

                        chain = chain.then(function (items) {
                            i_current = i_current + 1;
                            return service.prototype.getCityRss(city, cat, search, chain, {
                                total: i_total,
                                current: i_current
                            });
                        });

                    });
                });

                /*
                 chain.then(function (items) {

                 //$log.debug('AppServices.api.posts.updatePosts(): ' + JSON.stringify(items,null,2));
                 return DB.createCollection('post', items);
                 });
                 */

                chain.then(function () {

                    $rootScope.showToast('Update Posts Complete');
                    return service.prototype.find();
                });


            });

            return chain;
        };

        service.prototype.getCityRss = function (city, cat, query, chain, progress) {

            var self = this;

            //$log.debug('service.getCityRss city: ' + JSON.stringify(city, null, 2));

            progress.percent = (progress.current / progress.total) * 100;
            $rootScope.$broadcast(query._id + '-progress', {city: city, cat: cat, query: query, progress: progress});

            //progress.percent = (progress.current / progress.total) * 100;
            //chain.notify({city:city,cat:cat,query:query,progress:progress});

            var deferred = $q.defer();
            // https://austin.craigslist.org/search/sof?format=rss&query=ios

            var url = 'https://' + city.host + '/search' + city.path + cat + '?format=rss&query=' + encodeURIComponent(query.query);

            //$log.debug('url: ' + url);

            service.prototype.find({
                city_id: city._id,
                search_id: query._id,
                category_id: cat._id
            }).then(function (result) {

                //$log.debug('service.getCityRss result: ' + JSON.stringify(result, null, 2));

                var existing_posts = (result.docs === undefined) ? [] : result.docs;

                RejectedPostsService.find().then(function (rejected_data) {

                    var rejected_posts = (rejected_data.docs === undefined) ? [] : rejected_data.docs;

                    $.get(url, function (data) {
                        var $xml = $(data);
                        //var xmlDoc = $.parseXML(data);
                        //var $xml = $(xmlDoc)
                        //var _items = (items === undefined) ? [] : items;
                        var _items = [];

                        var xml_items = $xml.find("item");

                        xml_items.each(function () {

                            var $this = $(this);
                            var link = $this.find("link").first().text();
                            var a = document.createElement('a');
                            a.id = 'temp_link';
                            a.href = link;
                            var link_parts = a.pathname.split('/');
                            var filename = link_parts.pop();
                            var post_id = filename.split('.')[0];

                            $log.debug('NEW POST: ' + $this.find("title").first().text());

                            var existing_item = _.find(existing_posts, {_id: post_id});
                            var rejected_item = _.find(rejected_posts, {post_id: post_id});

                            if (existing_item || rejected_item) {


                            } else {
                                var item = {
                                    _id: post_id,
                                    title: $this.find("title").first().text(),
                                    link: link,
                                    description: $this.find("description").first().text(),
                                    publish_date: $this.find("date").text(),
                                    city_id: city._id,
                                    search_id: query._id,
                                    category_id: cat._id,
                                    state: self.states.created
                                };

                                _items.push(item);

                            }

                            DB.createCollection('post', _items).then(function (result) {
                                if (_items.length > 0) {
                                    $rootScope.$broadcast(query._id + '-found', {
                                        city: city,
                                        cat: cat,
                                        query: query,
                                        progress: progress
                                    });
                                }
                            });
                        });

                        deferred.resolve(true);

                    }).fail(function (error) {
                        $log.error('service.getCityRss $.get(): ' + JSON.stringify(error, null, 2));
                        deferred.reject(error);
                    });


                });
            }).catch(function (error) {
                $log.error('service.getCityRss service.find(): ' + JSON.stringify(error, null, 2));
                deferred.reject(error)
            });

            return deferred.promise;

        };

        service.prototype.openPost = function (postUrl, newWindow, emailCallback, completionCallback) {

            if (newWindow === undefined) {
                newWindow = false;
            }

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
                                if (emailCallback) {
                                    emailCallback(result);
                                }

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

            }, newWindow);

            //return deferred.promise;
        };

        service.prototype.getPostDetails = function (postUrl) {

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

        return new service();
    };

    module.exports = MODULE_NAME;

}());