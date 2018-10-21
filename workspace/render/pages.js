var express = require("express");
var router  = express.Router();
var request = require('request');
router.get("/",function (req,res,next) {
    const url = 'http://' + req.headers.host + '/coderooms/';
    request({url: url, json: true}, function (error, response, coderooms) {
        if (error) return next(error);
        if (req.user && req.user.isAdmin) {
            res.render("pages/homepage_manage.ejs", {myrooms: coderooms});
            return;
        }
        if (!req.user) {
            res.render("pages/homepage.ejs", {coderoom_list: coderooms, myrooms: []});
            return;
        }
        const length = coderooms.length;
        let i = 0;
        let ret = {coderoom_list: [], myrooms: []};
        while (i <= length) {
            if (i === length) {
                res.render("pages/homepage.ejs", ret);
                return;
            }
            if (coderooms[i]['author']['id'] === req.user.id) {
                ret['myrooms'].push(coderooms[i]);
            } else {
                ret['coderoom_list'].push(coderooms[i]);
            }
            i++;
        }
    });
});
module.exports = router;


