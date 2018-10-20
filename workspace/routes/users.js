var express = require('express');
var router = express.Router();
var middleware = require("../middleware/index");
var coderoom = require("../models/coderoom");
var User = require('../models/user');
var async = require('async');
var middleware = require('../middleware');
const DEFAULT_USER_AVATAR = 'https://res.cloudinary.com/db1kyoeue/image/upload/v1538825655/sujhmatymeuigsghpfby.png';
    module.exports = (app, passport) => {
    router.get('/logout', middleware.isLoggedIn, function(req, res){
        req.logout();
        res.redirect('/');
    });
    router.get('/login', function (req, res) {
        res.render('pages/signin.ejs', {title: 'Log in', errors: req.flash('error')});
    });
    router.get('/register', function (req, res) {
        res.render('pages/signup.ejs', {title: "Sign up"});
    });
    router.post("/login", passport.authenticate("local",
        {
            successRedirect: "/",
            failureRedirect: "/login",
        }));

    router.post('/register', function (req, res, next) {
        var user = new User({
            username: req.body.username,
            password: req.body.password,
            coderoom: null,
            avatar: DEFAULT_USER_AVATAR,
        });
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });

    router.post('/register/admin', function (req, res, next) {
        console.log("New admin created.");
        var user = new User({
            username: req.body.username,
            password: req.body.password,
            coderoom: null,
            avatar: DEFAULT_USER_AVATAR,
            isAdmin: true,
        });
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });

    router.get('/users/:id', function(req, res, next) {
        User.findById(req.params.id).exec(function(err, user) {
            if (err) return next(err);
            const user_info = {
                username:   user.username,
                userId:     user._id,
                email:      user.email,
                birthday:   user.birthday,
                country:    user.country,
                city:       user.city,
                avatar:     user.avatar,
                coderoom:   user.coderoom,
                following:  user.following,
                follower:   user.follower,
            };
            res.json(user_info);
        })
        //TODO get the full info.
    });

    router.get("/logout", function(req, res){
        req.logout();
        req.flash("success", "LOGGED YOU OUT!");
        res.redirect("/");
    });

    router.get("/profiles/:id", function (req,res, next) {
        async.parallel({
            target: function(callback) {
                User.findById(req.params.id, function(err, target) {
                    if(err) {return next(err); }
                    callback(null, target);
                })
            },
            me: function(callback) {
                if (req.user && req.user.id === req.params.id) {
                    callback(null, null);
                } else {
                    User.findById(req.user.id, function(err, me) {
                        if(err) {return next(err); }
                        callback(null, me);
                    })
                }
            },
            rooms: function(callback) {
                coderoom.find({"author.id": req.params.id},function (err, coderooms) {
                    if(err){ return next(err); }
                    callback(null, coderooms);
                })
            }
        }, function(err, results) {
            if(results.me) {
                res.render('pages/profile.ejs', {me: results.me, user: results.target, allcoderooms: results.rooms});
            } else {
                res.render('pages/setting.ejs', {me: results.target, user: null, allcoderooms: results.rooms});
            }
        })

    });

    router.put("/profiles/:id",middleware.isLoggedIn,function (req,res, next) {
        console.log("Update profile");
        if(req.user.id === req.params.id) {
            var newData = {
                firstName: req.body.profileName,
                lastName: req.body.profileLastName,
                email: req.body.profileEmail,
                city: req.body.profileLocation,
                postCode: req.body.profileBio,
                // mobile: req.body.mobile
            };
            User.findByIdAndUpdate(req.params.id, {$set: newData}, function (err, user) {
                if (err) {
                    console.log(err);

                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else {
                    console.log("success");
                    req.flash("success", "successfully updated!!");
                    res.redirect("/profiles/" + user._id);
                }
            });
        }
    });

    router.put("/users/:id/follow", middleware.isLoggedIn, function(req, res, next) {
        console.log("User: "+ req.user.id + "is trying to follow: ", req.params.id);

        // update the followee
        User.findByIdAndUpdate(req.params.id,
            {$addToSet: {follower: {"_id": req.user.id, 'avatar': req.user.avatar, 'username': req.user.username}}},
            {new:true},
            function(err, followee) {
                if(err) {console.log(err);return next(err);}
                console.log(followee);
                //TODO ugly
                // update the follower
                User.findByIdAndUpdate(req.user.id,
                    {$addToSet: {following: {"_id": req.params.id, 'avatar': followee['avatar'], 'username': followee['username']}}},
                    {new:true}, function(err, follower) {
                        if(err) {console.log(err);return next(err);}
                        console.log(follower);
                    });
        });
        res.json({'msg': 'followed user: ' + req.params.id})
    });

    router.delete("/users/:id/follow", middleware.isLoggedIn, function(req, res, next) {
        console.log("User: "+ req.user.id + "is trying to defollow: ", req.params.id);
        // update the follower
        //TODO basic info about the followee
        User.findByIdAndUpdate(req.user.id, {$pull: {following: {"_id": req.params.id}}}, {new:true}, function(err, user) {
            if(err) {console.log(err);return next(err);}
            console.log(user);
        });
        // update the followee
        User.findByIdAndUpdate(req.params.id, {$pull: {follower: {"_id": req.user.id}}}, {new:true}, function(err, user) {
            if(err) {console.log(err);return next(err);}
            console.log(user);
        });
        res.json({'msg': 'defollowed user: ' + req.params.id})
    });

    router.put("/profiles/:id/avatar", middleware.isLoggedIn, function(req, res, next) {
        console.log("Updating avatar");
        if (req.user.id !== req.params.id) {
            res.json({"msg": "No permission."});
            return;
        }
        User.findByIdAndUpdate(req.params.id, {avatar: req.body.url}, {new:true}, function(err, user) {
            if(err) {console.log(err);return next(err);}
            console.log(user);
            res.json({"msg": "Uploaded!"});
        });
    });
    app.use('/', router);
};