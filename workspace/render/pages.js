var express = require("express");
var router  = express.Router();
var flash = require("connect-flash");
var Coderoom = require('../models/coderoom');
var async = require('async');
var User = require('../models/user');
var middleware = require("../middleware");
var request = require('request');
const DEFAULT_USER_AVATAR = 'https://res.cloudinary.com/db1kyoeue/image/upload/v1538825655/sujhmatymeuigsghpfby.png';

router.get("/",function (req,res,next) {
    async.parallel({
        coderooms: function(callback) {
            const url = 'http://' + req.headers.host + '/coderooms/';
            request({url: url, json: true}, function (error, response, body) {
                if (error) return next(error);
                callback(null, body);
            });
        },
        user_info: function(callback) {
            if(req.user) {
                const url = 'http://' + req.headers.host + '/users/' + req.user.id;
                request({url: url, json: true}, function (error, response, body) {
                    if (error) return next(error);
                    callback(null, body);
                });
            } else {
                callback(null, null);
            }
        }
    }, function(err, results) {
        if (req.user && req.user.isAdmin) {
            res.render("pages/homepage_manage.ejs",{
                myrooms: results.coderooms,
            });
            return;
        }
        const length = results.coderooms.length;
        let i = 0; let ret = {coderoom_list: [], myrooms: []};
        while (i<=length) {
            if ((i === length) || !results.user_info) {
                res.render("pages/homepage.ejs",ret);
                return;
            }
            if (results.coderooms[i]['author']['id'] === req.user.id) {
                ret['myrooms'].push(results.coderooms[i]);
            } else {
                ret['coderoom_list'].push(results.coderooms[i]);
            }
            i++;
        }
    })
});

module.exports = router;


