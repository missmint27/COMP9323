var express = require('express');
var router = express.Router();
var User = require('../models/user');
module.exports = (app, passport) => {
    router.get('/login', function (req, res) {
        res.render('login_form', {title: 'Log in', errors: req.flash('error')});
    });
    router.get('/register', function (req, res) {
        res.render('login_form', {title: "Sign up"});
    });
    router.post('/login',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        })
    );
    router.post('/register', function (req, res, next) {
        console.log("Username: %s", req.body.username);
        console.log("Password: %s", req.body.password);
        //escape errors
        //body('username, password...').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        //sanitizeBody('username, password...').trim().escape()
        var user = new User({
            username: req.body.username,
            password: req.body.password
        });
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            // Successful - redirect to new author record.
            res.redirect('/');
        });
    });

    app.use('/', router);
};
