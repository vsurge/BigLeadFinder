(function () {

    var electron = require('electron');
    var File = require('./File.js');

    var path = require('path');
    var fs = require('fs');
    var Q = require('q');

    var nodemailer = require('nodemailer');

    var Service = {};

    Service.init = function () {

        //console.log('File.response_attachments: ' + File.response_attachments);
    }

    Service.sendEmail = function (message,settings,callback) {

        console.log('message: ' + JSON.stringify(message,null,2));
        //console.log('settings: ' + JSON.stringify(settings,null,2));

        var transporter = nodemailer.createTransport(settings);

        /*
        // verify connection configuration
        transporter.verify(function(error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log('Server is ready to take our messages');
            }
        });
        */

        transporter.sendMail(message,callback);
    }

    Service.init();

    module.exports = Service;

})();

