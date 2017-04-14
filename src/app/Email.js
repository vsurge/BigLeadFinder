(function () {

    'user strict';

    var electron = require('electron');
    var File = require('./File.js');

    var path = require('path');
    var fs = require('fs');
    var Q = require('q');

    var Service = {};

    Service.init = function () {

        console.log('File.response_attachments: ' + File.response_attachments);
    }

    Service.sendEmail = function (email,settings) {

        console.log('email: ' + JSON.stringify(email,null,2));
        console.log('settings: ' + JSON.stringify(settings,null,2));

    }

    Service.init();

    module.exports = Service;

})();

