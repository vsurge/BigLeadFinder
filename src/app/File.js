(function () {

    'user strict';

    var electron = require('electron');
    // Module to create native browser window.
    var BrowserWindow = electron.BrowserWindow

    var path = require('path');
    var fs = require('fs');
    var Q = require('q');

    var Service = {};

    Service.init = function () {

        var userData = electron.app.getPath('userData');
        Service.response_attachments = userData + '/' + 'response_attachments/';
        if (!fs.existsSync(Service.response_attachments)) {
            fs.mkdirSync(Service.response_attachments);
        }
    }

    Service.saveFile = function (buffer, filename, completion) {

        //console.log('File.saveFile buffer: ' + JSON.stringify(buffer, null, 2));
        console.log('File.saveFile filename: ' + JSON.stringify(filename, null, 2));

        fs.writeFile(Service.response_attachments + filename, buffer, 'binary',function (err, written, buffer) {

            if (completion) {
                completion(filename,err);
            }
        });

    };

    Service.getFileBinaryAttachment = function (filename, completion) {

        fs.readFile(Service.response_attachments + filename, {}, completion);
    };

    Service.getFileBinaryProjectFile = function (filename, completion) {

        var full_file_path = __dirname + '/../app/' + filename;

        console.log(full_file_path);

        fs.readFile(full_file_path, {}, completion);
    };

    Service.getFileBinary = function (filename, completion) {

        fs.readFile(filename, {}, completion);
    };

    Service.deleteFile = function (filename) {


    };

    Service.responseAttachmentPath = function (filename) {

        return Service.response_attachments + filename;
    };

    Service.responseAttachment = function (filename) {


    };


    Service.init();

    module.exports = Service;

})();

