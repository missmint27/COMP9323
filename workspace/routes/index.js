var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var flash = require("connect-flash");
var Coderoom = require('../models/coderoom');
var async = require('async');
var User = require('../models/user');
//root route
router.get("/", function(req, res, next){
    console.log("homepage333");
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
//
// router.get("/coderooms",function(req, res) {
//     console.log("Show all coderooms");
//     Coderoom.find().exec(function(err, coderoom) {
//         res.json(coderoom);
//     })
// });

router.get("/coderooms/:id",function(req, res) {
    console.log("Show all coderooms");
    Coderoom.findById(req.params.id).exec(function(err, coderoom) {
        res.json(coderoom);
    });
});
//
// // show register form
// router.get("/signup", function(req, res){
//    res.send("Not implemented: signup.");
// });
//
// //handle sign up logic
// router.post("/signup", function(req, res){
//     var newUser = new User({username: req.body.username});
//     if(req.body.isAdmin == "secret123"){
//         newUser.isAdmin = true;
//     }
//     req.flash("success","welcome");
//     console.log(req.body);
//
//     User.register(newUser, req.body.password, function(err, user){
//         if(err){
//             console.log(err);
//             req.flash()["error", err.message];
//             return res.render("register");
//         }
//         passport.authenticate("local")(req, res, function(){
//            req.flash()["success", "Successfully Signed Up! Nice to meet you " + req.body.username];
//            res.redirect("/coderooms");
//         });
//     });
// });
//
//
// //show login form
// router.get("/login", function(req, res){
//    res.render("login");
// });
//
// //handling login logic
// router.post("/login", passport.authenticate("local",
//     {
//         successRedirect: "/",
//         failureRedirect: "/login"
//     }), function(req, res){
//
// });
//
// // logout route
// router.get("/logout", function(req, res){
//    req.logout();
//    req.flash("success", "LOGGED YOU OUT!");
//    res.redirect("/campgrounds");
// });
//
// //get profile
// router.get("/users/:id",function(req, res) {
//     User.findById(req.params.id, function(err,foundUser){
//         if(err){
//             req.flash("error","something went wrong");
//             req.redirect("/");
//         }
//         else{
//             res.render("users/profile",{user:foundUser});
//         }
//     })
// })
//
// //update profile
// router.put("/users/:id",function(req,res){
//     var newData ={nickname: req.body.nickname, country: req.body.region, mobile: req.body.mobile};
//     User.findByIdAndUpdate(req.params.id,{$set: newData},function(err,user){
//         if(err){
//             req.flash("error",err.message);
//             res.redirect("back");
//         }
//         else{
//             req.flash("success","successfully updated!!");
//             console.log("you made it!");
//             console.log(user);
//             res.redirect("/users/" + user._id);
//         }
//     })
// })

module.exports = router;