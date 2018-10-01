var express = require("express");
var router  = express.Router();
var Coderoom = require("../models/coderoom");
// var Comment = require("../models/comment");
// var File = require('../models/pythonFile');
var middleware = require("../middleware");
var request = require("request");
var firebase = require('firebase');
var pythonExecutor = require('../controllers/pythonExecutor');
const fs = require('fs');
const spawn = require('child_process').spawn;
const async = require('async');

var config = {
    apiKey: "AIzaSyDyFnZMXeY2gXJNSZe58tqbOkZX7-5yiDM",
    authDomain: "comp9323-97bb4.firebaseapp.com",
    databaseURL: "https://comp9323-97bb4.firebaseio.com",
    projectId: "comp9323-97bb4",
    storageBucket: "comp9323-97bb4.appspot.com",
    messagingSenderId: "837737259182"
};
firebase.initializeApp(config);
//testing firebase
router.get('/test', function(req, res) {
    console.log("Firebase testing...");
    res.render('firebase_test');
});

//可工作
router.get("/", middleware.isLoggedIn, function(req, res) {
    console.log("Show all coderooms");
    Coderoom.find().exec(function(err, coderoom) {
        if (err) { return next(err); }
        res.json(coderoom);
    });
});

//search for coderooms
router.get("/search",function(req, res) {
    console.log("query coderooms: ", req.query);
    Coderoom.find(req.query).exec(function(err, coderoom) {
        if (err) { return next(err); }
        res.json(coderoom);
    })
});

//可工作
// create new coderoom
//建立新coderoom，
router.post("/", middleware.isLoggedIn,function(req, res) {
    var coderoom = new Coderoom(
        {
            name: req.body.name,
            description: req.body.description,
            author:{
                id: req.session.passport.user.id,
                username: req.session.passport.user.username
            }
        });
    coderoom.save(function(err) {
        if (err) { return next(err); }
        firebase.database().ref().child('code/').child(coderoom.id).update(
            {'content': "print(\"Hello World\")"}
        );
        firebase.database().ref().child('user_list/' + coderoom.id).child(req.session.passport.user.id)
            .update({
                'username': req.session.passport.user.username,
                'permission': true,
                'ask-for-permission': false,
                'url': '/users/' + req.session.passport.user.id
            });
        res.json("room id: %s created", coderoom.id);
    });
});
//可工作
// get coderoom by its id
router.get("/:id",function(req, res) {
    console.log("show coderoom by id");
    async.parallel({
        room: function(callback) {
            Coderoom.findById(req.params.id).exec(function (err, coderoom) {
                if (err) { return next(err); }
                callback(coderoom);
            })
        },
        user: function(callback) {
            firebase.database().ref().child('user_list/' + req.params.id)
                .child(req.session.passport.user.id)
                    .update({
                        'username':req.session.passport.user.username,
                        'permission': false,
                        'ask-for-permission': false,
                        'url': '/users/' + req.session.passport.user.id
                    });
            callback(null, user.id);
        }
    }, function(err, results) {
        res.json({
            coderoom: result.coderoom,
            user: result.user
        });
    })
});

//可工作
router.get("/:id/run",function(req, res) {
    console.log("run code in this coderoom.");
    const dbRefCode = firebase.database().ref().child('code').child(req.params.id);
    dbRefCode.once('value', snap => {
        const content = snap.val();
        pythonExecutor(res, req.params.id, content["content"]);
    });
});

// delete coderoom by its id
router.delete("/:id",function(req, res) {
    console.log("Delete coderoom");
    Coderoom.findByIdAndRemove(req.params.id).exec(function(err, coderoom) {
        if (err) { return next(err); }
        res.json({Message: "Deleted!"});
    });
    // TODO delete the coderoom in user schema.
    // TODO delete all coderoom entries in fireabse.
});

router.delete("/:roomId/users/:id", function(req, res) {
    //need to change after impliment firebase
    console.log("Delete user in this coderoom");
    async.waterfall([
        function(callback) {
            Coderoom.findById(req.params.roomId).exec(function(err, coderoom) {
                if (err) { return next(err); }
                callback(null, coderoom);
            });
        },
        function(arg1, callback) {
            let user_list = arg1.users;
            for (user in user_list) {
                if (user_list[user].id == req.params.id) {
                    user_list.splice(user, 1);
                }
            }
            callback(null, user_list);
        }
    ], function(err, result) {
        Coderoom.findByIdAndUpdate(req.params.roomId, {$set: {result}}, function(err, updated) {
            if (err) {return next(err); }
            res.json(updated);
        })
    });
});

module.exports = router;

//
// //INDEX - show all coderooms
// router.get("/", function(req, res){
//     if(req.query.search){
//         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         Coderoom.find({name:regex}, function(err, allCoderooms){
//            if(err){
//                console.log(err);
//            } else {
//                var noMatch;
//                request('https://maps.googleapis.com/maps/api/geocode/json?address=sardine%20lake%20ca&key=AIzaSyBtHyZ049G_pjzIXDKsJJB5zMohfN67llM', function (error, response, body) {
//                 if (!error && response.statusCode == 200) {
//                      // Show the HTML for the Modulus homepage.
//                      if(allCoderooms.length < 1){
//
//                           noMatch = "No coderooms match that query, please try again.";
//                           console.log(noMatch);
//                          //eval(require("locus"));
//                           res.render("coderooms/index",{coderooms:allCoderooms,noMatch:noMatch});
//                      }
//                      console.log("got here");
//                         res.render("coderooms/index",{coderooms:allCoderooms,noMatch:noMatch});
//                 }
//             });
//            }
//         });
//     }
//     else{
//     // Get all coderooms from DB
//     Coderoom.find({}, function(err, allCoderooms){
//        if(err){
//            console.log(err);
//        } else {
//                  // Show the HTML for the Modulus homepage.
//                 res.render("coderooms/index",{coderooms:allCoderooms});
//     }});
// }});
//
// //CREATE - add new coderooms to DB
// //router.post("/", middleware.isLoggedIn, function(req, res){
// router.post("/", function(req, res){
//     // get data from form and add to campgrounds array
//
//     var name = req.body.name;
//     var image = req.body.image;
//     var code = req.body.code;
//     var desc = req.body.description;
//     var author = {
//         id: req.user._id,
//         username: req.user.username
//     }
//     var newCoderoom = {name: name, image: image, description: desc,code: req.body.code,author:author}
//     // Create a new campground and save to DB
//     Coderoom.create(newCoderoom, function(err, newlyCreated){
//         if(err){
//             console.log(err);
//         } else {
//             //redirect back to coderooms page
//             res.redirect("/coderooms");
//         }
//     });
// });
//
// //NEW - show form to create new campground
// router.get("/new", middleware.isLoggedIn, function(req, res){
//    res.render("coderooms/new");
// });
//
// // SHOW - shows more info about one campground
// router.get("/:id", function(req, res){
//     //find the campground with provided ID
//     Coderoom.findById(req.params.id).populate("comments").exec(function(err, foundCoderoom){
//         if(err){
//             console.log(err);
//         } else {
//             //render show template with that campground
//             res.render("coderooms/show", {coderoom: foundCoderoom});
//         }
//     });
// });
//
// router.get("/:id/edit", middleware.checkUserCoderoom, function(req, res){
//
//     //find the campground with provided ID
//     Coderoom.findById(req.params.id, function(err, foundCoderoom){
//         if(err){
//             console.log(err);
//         } else {
//             //render show template with that coderoom
//             res.render("coderooms/edit", {coderoom: foundCoderoom});
//         }
//     });
// });
//
// router.put("/:id", function(req, res){
//     var newData = {name: req.body.name, image: req.body.image, code: req.body.code,description: req.body.desc};
//     Coderoom.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, coderoom){
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             req.flash("success","Successfully Updated!");
//             res.redirect("/coderooms/" + coderoom._id);
//         }
//     });
// });
// router.delete("/:id", function(req, res) {
//   Coderoom.findByIdAndRemove(req.params.id, function(err, coderoom) {
//     Comment.remove({
//       _id: {
//         $in: coderoom.comments
//       }
//     }, function(err, comments) {
//       req.flash('error', coderoom.name + ' deleted!');
//       res.redirect('/coderooms');
//     })
//   });
// });
//
//
// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };