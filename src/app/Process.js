(function () {

    'user strict';

    var electron = require('electron');
    var result = require('dotenv').config({path:__dirname + '/.env'});

    var Service = {};

    Service.init = function () {

        Service.env = process.env;

        console.log('dotenv result: ' + JSON.stringify(result,null,2));
    };

    Service.init();

    module.exports = Service;

})();

