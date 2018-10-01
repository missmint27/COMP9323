// var Comment = require("../models/comment");
var Coderoom = require("../models/coderoom");
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.user){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
    checkUserCoderoom: function(req, res, next){
        if(req.isAuthenticated()){
            Coderoom.findById(req.params.id, function(err, found_coderoom){
               if(found_coderoom.permitted_user.id.equals(req.user._id)
                   || found_coderoom.author.id.equals(req.user._id)
                   || req.user.isAdmin){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   console.log("BADD!!!");
                   res.redirect("/coderooms/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
    },
    checkUserComment: function(req, res, next){
        console.log("YOU MADE IT!");
        if(req.isAuthenticated()){
            Comment.findById(req.params.commentId, function(err, comment){
               if(comment.author.id.equals(req.user._id) || req.user.isAdmin){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("/coderooms/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("login");
        }
    }
}