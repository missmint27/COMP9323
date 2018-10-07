var Coderoom = require("../models/coderoom");
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.user){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect('/login');
    },
    isOwner: function(req, res, next){
        if(req.user){
            Coderoom.findById(req.params.id, function(err, found_coderoom){
               if(found_coderoom.permitted_user.id.equals(req.user.id)
                   || found_coderoom.author.id.equals(req.user.id)
                   || req.user.isAdmin){
                   next();
               } else {
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("/coderooms/" + req.params.id);
               }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
    }
};