var express = require("express");
var router  = express.Router({mergeParams: true});
var Coderoom = require("../models/coderoom");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    console.log(req.params.id);
    Coderoom.findById(req.params.id, function(err, coderoom){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {coderoom: coderoom});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup campground using ID
   Coderoom.findById(req.params.id, function(err, coderoom){
       if(err){
           console.log(err);
           res.redirect("/coderooms");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               coderoom.comments.push(comment);
               coderoom.save();
               console.log(comment);
               req.flash('success', 'Created a comment!');
               res.redirect('/coderooms/' + coderoom._id);
           }
        });
       }
   });
});

router.get("/:commentId/edit", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Comment.findById(req.params.commentId, function(err, comment){
        if(err){
            console.log(err);
        } else {
             res.render("comments/edit", {coderoom_id: req.params.id, comment: comment});
        }
    })
});

router.put("/:commentId", function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
           res.render("edit");
       } else {
           res.redirect("/coderooms/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId",middleware.checkUserComment, function(req, res){
    Comment.findByIdAndRemove(req.params.commentId, function(err){
        if(err){
            console.log("PROBLEM!");
        } else {
            res.redirect("/coderooms/" + req.params.id);
        }
    })
});

module.exports = router;