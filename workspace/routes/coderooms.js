var express = require("express");
var router  = express.Router();
var Coderoom = require("../models/coderoom");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var request = require("request");

//INDEX - show all coderooms
router.get("/", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Coderoom.find({name:regex}, function(err, allCoderooms){
           if(err){
               console.log(err);
           } else {
               var noMatch;
               request('https://maps.googleapis.com/maps/api/geocode/json?address=sardine%20lake%20ca&key=AIzaSyBtHyZ049G_pjzIXDKsJJB5zMohfN67llM', function (error, response, body) {
                if (!error && response.statusCode == 200) {
                     // Show the HTML for the Modulus homepage.
                     if(allCoderooms.length < 1){
                         
                          noMatch = "No coderooms match that query, please try again.";
                          console.log(noMatch);
                         //eval(require("locus"));
                          res.render("coderooms/index",{coderooms:allCoderooms,noMatch:noMatch});
                     }
                     console.log("got here");    
                        res.render("coderooms/index",{coderooms:allCoderooms,noMatch:noMatch});
                }
            });
           }
        });
    }
    else{
    // Get all coderooms from DB
    Coderoom.find({}, function(err, allCoderooms){
       if(err){
           console.log(err);
       } else {
                 // Show the HTML for the Modulus homepage.
                res.render("coderooms/index",{coderooms:allCoderooms});
    }});
}});

//CREATE - add new coderooms to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    
    var name = req.body.name;
    var image = req.body.image;
    var code = req.body.code;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCoderoom = {name: name, image: image, description: desc,code: req.body.code,author:author}
    // Create a new campground and save to DB
    Coderoom.create(newCoderoom, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to coderooms page
            res.redirect("/coderooms");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("coderooms/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Coderoom.findById(req.params.id).populate("comments").exec(function(err, foundCoderoom){
        if(err){
            console.log(err);
        } else {
            
            //render show template with that campground
            res.render("coderooms/show", {coderoom: foundCoderoom});
        }
    });
});

router.get("/:id/edit", middleware.checkUserCoderoom, function(req, res){
    
    //find the campground with provided ID
    Coderoom.findById(req.params.id, function(err, foundCoderoom){
        if(err){
            console.log(err);
        } else {
            //render show template with that coderoom
            res.render("coderooms/edit", {coderoom: foundCoderoom});
        }
    });
});

router.put("/:id", function(req, res){
    var newData = {name: req.body.name, image: req.body.image, code: req.body.code,description: req.body.desc};
    Coderoom.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, coderoom){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/coderooms/" + coderoom._id);
        }
    });
});
router.delete("/:id", function(req, res) {
  Coderoom.findByIdAndRemove(req.params.id, function(err, coderoom) {
    Comment.remove({
      _id: {
        $in: coderoom.comments
      }
    }, function(err, comments) {
      req.flash('error', coderoom.name + ' deleted!');
      res.redirect('/coderooms');
    })
  });
});

module.exports = router;

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};