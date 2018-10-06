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
            failureRedirect: "/login"
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
            // Successful - redirect to new author record.
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

    //for short info.
    router.get('/api/users/:id', function(req, res, next) {
        User.findById(req.params.id).exec(function(err, user) {
            if (err) return next(err);
            const user_info = {
                username:   user.username,
                userId:     user._id,
                avatar:     user.avatar,
                coderoom:   user.coderoom
            };
            res.json(user_info);
        })
    });
    app.use('/', router);
};



router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "LOGGED YOU OUT!");
    res.redirect("/");
});

router.get("/profile/:id",middleware.isLoggedIn, function (req,res) {
    User.findById(req.params.id,function(err,foundUser) {
        if(err){
            req.redirect("/");
        }
        else {
            res.render("pages/setting.ejs", {user: foundUser});
        }
    })

})
router.put("/profile/:id",middleware.isLoggedIn,function (req,res) {
    var newData ={firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, city: req.body.email, city: req.body.city, birthday:req.body.birthday,  mobile: req.body.mobile};
    User.findByIdAndUpdate(req.params.id,{$set: newData},function(err,user){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }
        else{
            req.flash("success","successfully updated!!");

            console.log(user);
            res.redirect("/profile/" + user._id);
        }
    })


})

