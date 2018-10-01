var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var flash = require("connect-flash");
var Coderoom = require('../models/coderoom');
var async = require('async');
var User = require('../models/user');

router.get("/", function(req, res, next){
    console.log("homepage222");
    if (!req.user) { return res.redirect('/login'); }
    async.parallel({
        coderooms: function (callback) {
            Coderoom.find().exec(callback);
        },
        user_info: function (callback) {
            User.findById(req.session.passport.user.id).exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        res.json({user_info: results.user_info, coderooms_list: results.coderooms});
    });
});