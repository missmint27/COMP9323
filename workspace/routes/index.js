var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var flash = require("connect-flash");
//root route
router.get("/", function(req, res){
    console.log("here")
    //res.render("pages/landing");
});
router.get("/profile",function(req, res) {
    res.render("users/profile");
})

router.get("/coderoom",function(req, res) {
    console.log("here");
    res.render("coderoom");
})

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    if(req.body.isAdmin == "secret123"){
        newUser.isAdmin = true;
    }
    req.flash("success","welcome");
    console.log(req.body);

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash()["error", err.message];
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash()["success", "Successfully Signed Up! Nice to meet you " + req.body.username];
           res.redirect("/coderooms"); 
        });
    });
});


//show login form
router.get("/login", function(req, res){
    
   res.render("login"); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
        
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "LOGGED YOU OUT!");
   res.redirect("/campgrounds");
});

//get profile
router.get("/users/:id",function(req, res) {
    User.findById(req.params.id, function(err,foundUser){
        if(err){
            req.flash("error","something went wrong");
            req.redirect("/");
        }
        else{
            res.render("users/profile",{user:foundUser});
        }
    })
})

//update profile
router.put("/users/:id",function(req,res){
    var newData ={nickname: req.body.nickname, country: req.body.region, mobile: req.body.mobile};
    User.findByIdAndUpdate(req.params.id,{$set: newData},function(err,user){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }
        else{
            req.flash("success","successfully updated!!");
            console.log("you made it!");
            console.log(user);
            res.redirect("/users/" + user._id);
        }
    })
})

module.exports = router;