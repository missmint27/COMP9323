var Coderoom = require("../models/coderoom");
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.user){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect('/login');
    },
};