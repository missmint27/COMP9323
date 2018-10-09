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
                callback(null, {avatar: DEFAULT_USER_AVATAR});
            }
        }
    }, function(err, results) {
        res.render("pages/homepage.ejs",{
            prev_coderoom: {name: "test", author: "test", description: "test", _id: "5bab7be8ade838281621911a"},
            coderoom_list: results.coderooms,
            user_info: results.user_info
        });
    })
});

// router.get("/coderooms/:id", function(req, res, next) {
//     console.log('url: ', req.url);
//     console.log('host: ', req.headers.host);
//     console.log("Coderoom id: ", req.params.id);
//     res.send("Coderoom id: " +  req.params.id);
// });

router.get("/profiles/:id", function(req, res, next) {
    console.log("User id: ", req.params.id);
    res.send("User id: " + req.params.id);
})
module.exports = router;


