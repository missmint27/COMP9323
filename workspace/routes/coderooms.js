var express = require("express");
var router  = express.Router();
var Coderoom = require("../models/coderoom");
var User = require('../models/user');
var middleware = require("../middleware");
var firebase = require('firebase');
var pythonExecutor = require('../controllers/pythonExecutor');
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
//firebase root directory
var fb_root = firebase.database().ref();

//testing firebase
router.get('/test', function(req, res) {
    let roomId = '5bab7be8ade838281621911a';
    let userId = '5bb053d0efdfca206dc66b3b';
    console.log("Firebase testing...");
    console.log("TEST ON ROOM ID: ", roomId);
    console.log("TEST ON USER ID: ", roomId);
    res.render('firebase_test', {roomId: roomId, userId: userId});
});

//可工作
router.get("/", function(req, res) {
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
                id: req.user.id,
                username: req.user.username
            }
        });
    coderoom.save(function(err) {
        if (err) { return next(err); }
        fb_root.child('code/').child(coderoom.id).update(
            {'content': "print(\"Hello World\")"}
        );
        fb_root.child('user_list/' + coderoom.id).child(req.user.id)
            .update({
                'username': req.user.username,
                'url': '/users/' + req.user.id,
            });
        fb_root.child('permission/' + coderoom.id).update(
            { "userId" : req.user.id}
        );
        res.json("room id: %s created", coderoom.id);
    });
});

//pass permission to userId
router.put('/:roomId/permission/:userId', middleware.isLoggedIn, function(req, res, next) {
   console.log('Passing permission');
   const permissionRef = fb_root.child('permission/' + req.params.roomId);
   const requestingRef = fb_root.child('ask-for-permission/' + req.params.roomId);

   async.parallel({
       holder: function (callback) {
           permissionRef.once('value').then(function (snapshot) {
               callback(null, snapshot.val().userId);
           });
       },
       target: function (callback) {
           requestingRef.child(req.params.userId).once('value').then(function (snapshot) {
               callback(null, snapshot.val());
           });
       }
   }, function(err, results) {
       console.log(results.holder);
       console.log(req.user.id);
       if(results.holder === req.user.id) {
           console.log(results.target);
           if(results.target) {
               permissionRef.update( {'userId': req.params.userId} );
               requestingRef.remove();
               res.status('200').json({'msg': 'Permission transferd to User: ' + req.params.userId});
           } else {
               res.status('400').json({'msg': 'user ' + req.params.userId + ' is not asking for permission'});
           }
       } else {
           res.status('400').json({'msg': "You Don't have permission."});
       }
   })
});

//require for permission
router.put('/:roomId/permission', middleware.isLoggedIn, function(req, res, next) {
    console.log('requiring permission');
    const requestingRef = fb_root.child('ask-for-permission/' + req.params.roomId);
    const obj = {};
    obj[req.user.id] = true;
    requestingRef.update( obj );
    res.json({'msg': 'Fin'});
});

//可工作
// get coderoom by its id
router.get("/:id",function(req, res, next) {
    console.log("show coderoom by id");
    async.parallel({
        //get the room
        room: function(callback) {
            Coderoom.findById(req.params.id).exec(function (err, coderoom) {
                if (err) { return next(err); }
                callback(null, coderoom);
            })
        },
        //put user into the user list under the coderoom
        user: function(callback) {
            if (req.user) {
                //TODO change to if not user.
                User.findByIdAndUpdate(req.user.id,
                    {coderoom: {_id:req.params.id}}, {new:true}, function(err, user) {
                        if(err) { return next(err); }
                        console.log(user);
                });
                fb_root.child('user_list/' + req.params.id)
                    .child(req.user.id)
                    .update({
                        'username': req.user.username,
                        'permission': false,
                        'ask-for-permission': false,
                        'url': '/users/' + req.user.id
                    });
                callback(null, req.user.id);
            } else { callback(null, null); }
        }
    }, function(err, results) {
        //if user not logged in, user will be null.
        res.json({
            coderoom: results.room,
            user: results.user
        });
    })
});

//可工作
router.get("/:id/run",function(req, res, next) {
    console.log("run code in this coderoom.", req.params.id);
    const dbRefCode = firebase.database().ref().child('code').child(req.params.id);
    dbRefCode.once('value', snap => {
        const content = snap.val();
        pythonExecutor(res, req.params.id, content["content"]);
    });
});

// delete coderoom by its id
router.delete("/:id",middleware.isLoggedIn, function(req, res, next) {
    console.log("Delete coderoom");
    //TODO owner of coderoom can do this
    Coderoom.findByIdAndRemove(req.params.id).exec(function(err, coderoom) {
        if (err) { return next(err); }
        res.json({Message: "Deleted!"});
    });
    // TODO delete the coderoom in all user schema.
    // TODO delete all coderoom entries in fireabse.
    res.status('200').json({'msg': 'coderoom ' + req.params.id + ' deleted'})
});

//delete user under this room
router.delete("/:roomId/users", middleware.isLoggedIn, function(req, res, next) {
    const userId = req.user.id;
    console.log("Delete user in this coderoom, userId: ", userId);

    fb_root.child('user_list/' + req.params.roomId).child(userId).remove();
    res.status('200').json({'msg': 'user ' + userId + ' deleted'});
});

router.post('/:roomId/comments', middleware.isLoggedIn, function(req, res, next) {
    console.log("post comment.");
    fb_root.child('comment_list/' + req.params.roomId).push({
            authorId: req.user.id,
            author: req.user.username,
            content: req.body.content,
            position: req.body.pos
        }
    );
    //TODO err handler?
    res.status('200').json({'msg': 'Comment created.'});
});

router.put('/:roomId/comments/:commentId', middleware.isLoggedIn, function(req, res, next) {
    console.log("modifying comment.");
    fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId).udpate({
            content: req.body.content
        }
    );
    res.status('200').json({'msg': 'Comment modified.'});
});

module.exports = router;

// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };