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
        const length = results.coderooms.length;
        let i = 0, found = false;
        console.log(results.user_info);
        if (!results.user_info) {
            res.render("pages/homepage.ejs",{
                prev_coderoom: null,
                coderoom_list: results.coderooms,
                user_info: results.user_info
            });
            return;
        }
        while (i<length && found === false) {
            if (results.coderooms[i]['_id'] === results.user_info.coderoom) {
                res.render("pages/homepage.ejs",{
                    prev_coderoom: results.coderooms[i],
                    coderoom_list: results.coderooms,
                    user_info: results.user_info
                });
                found = true;
            }
            i++;
        }
        console.log(results.coderooms);
    })
});

module.exports = router;


