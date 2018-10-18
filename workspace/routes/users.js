var express = require('express');
var router = express.Router();
var middleware = require("../middleware/index")
var User = require('../models/user');
var async = require('async');
var middleware = require('../middleware');
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
        }), function(req, res){
        console.log("sucesss");

    });
    router.post('/register', function (req, res, next) {
        console.log("Username: %s", req.body.username);
        console.log("Password: %s", req.body.password);
        //escape errors
        //body('username, password...').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        //sanitizeBody('username, password...').trim().escape()
        var user = new User({
            username: req.body.username,
            password: req.body.password,
            coderoom: null
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

    router.get("/profile/:id", function (req,res) {
        User.findById(req.params.id,function(err,foundUser) {
            if(err){
                req.redirect("/");
            }
            var flag = true;
            var another_user_flag = false;
            if (req.user) {
                    console.log(req.user);
                    console.log(req.params.id);
                if (req.user.id === req.params.id) {
                    console.log(req.user);

                    flag = false;

                    //TODO should return something different
                    res.render("pages/setting.ejs", {user: foundUser,flag:flag,another_user_flag:another_user_flag});
                }
                else {
                    another_user_flag = true;
                    User.findById(req.user.id, function (err, foundUser_V2) {
                        if(err){
                            req.redirect("/");
                        }
                        else{
                            res.render("pages/setting.ejs", {user: foundUser,another_user: another_user,flag:flag, another_user_flag:another_user_flag});

                        }

                    })
                }
            }
            else{
                res.render("pages/setting.ejs",{user:foundUser, flag:flag,another_user_flag:another_user_flag});
            }

        })
    });

    router.put("/profile/:id",middleware.isLoggedIn,function (req,res) {
        if(req.user.id === req.params.id) {
            //TODO partly update
            var newData = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                city: req.body.city,
                birthday: req.body.birthday,
                mobile: req.body.mobile
            };

            User.findByIdAndUpdate(req.params.id, {$set: newData}, function (err, user) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                }
                else {
                    req.flash("success", "successfully updated!!");

                    console.log(user);
                    res.redirect("/profile/" + user._id);
                }
            });
        }
    });

    router.put("/users/:id/follow", middleware.isLoggedIn, function(req, res, next) {
        console.log("follow: ", req.params.id);
        res.json({'msg': 'follow Not implemented yet.'})
    });

    router.delete("/users/:id/follow", middleware.isLoggedIn, function(req, res, next) {
        console.log("defollow: ", req.params.id);
        res.json({'msg': 'defollow Not implemented yet.'})
    });



    app.use('/', router);
};