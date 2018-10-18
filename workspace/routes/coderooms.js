var express = require("express");
var router  = express.Router();
var Coderoom = require("../models/coderoom");
var User = require('../models/user');
var middleware = require("../middleware");
var firebase = require('firebase');
var request = require('request');
var pythonExecutor = require('../controllers/pythonExecutor');
const async = require('async');
const DEFAULT_USER_AVATAR = 'https://res.cloudinary.com/db1kyoeue/image/upload/v1538825655/sujhmatymeuigsghpfby.png';

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

//functioning
router.get("/", function(req, res, next) {
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

//functioning
//create new coderoom，
router.post("/", middleware.isLoggedIn,function(req, res) {
    var coderoom = new Coderoom(
        {
            name: req.body.name,
            description: req.body.description,
            author:{
                id: req.user.id,
                username: req.user.username
            },
            upvote:0,
            downvote:0
        });
    coderoom.save(function(err) {
        if (err) { return next(err); }
        fb_root.child('code/').child(coderoom.id).update(
            {'content': "print(\"Hello World\")","upvote":0, "downvote":0}
        );
        fb_root.child('user_list/' + coderoom.id).child(req.user.id)
            .update({
                'username': req.user.username,
                'url': '/users/' + req.user.id,
                'avatar': DEFAULT_USER_AVATAR
            });
        fb_root.child('permission/' + coderoom.id).update(
            { "userId" : req.user.id}
        );
        console.log(coderoom.id);
        res.redirect('/coderooms/' + coderoom.id);
    });
});

router.put('/:roomId', function(req, res, next) {
    console.log("modify coderoom.");
    // eval(require("locus"));
    // fb_root.child(req.params.)
    console.log(req.params);
    fb_root.child("code").child(req.params.roomId).once('value')
        .then(function (snapshot) {
            console.log("here");
            fb_root.child("code").child(req.params.roomId)
                .update({"upvote":req.body.upvote, "downvote": req.body.downvote});
            res.status('200').json({'msg': 'coderoom upvote.'});
        });
    //TODO err handler?
});



//functioning
// get coderoom by its id
router.get("/:id",function(req, res, next) {
    console.log("show coderoom by id");
    async.parallel({
        //get the room
        room: function(callback) {
            Coderoom.findById(req.params.id).exec(function (err, coderoom) {
                if (err) { return next(err); }
                if (!coderoom) {
                    res.status('404').json({'msg': 'coderoom not found'});
                    return;
                }
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
                    });
                fb_root.child('user_list/' + req.params.id)
                    .child(req.user.id)
                    .update({
                        'username': req.user.username,
                        'url': '/users/' + req.user.id,
                        'avatar': req.user.avatar
                    });
                callback(null, req.user);
            } else { callback(null, {username: 'anonymous user', avatar: DEFAULT_USER_AVATAR, _id: null}); }
        }
    }, function(err, results) {
        //if user not logged in, user will be null.
        console.log("USER INSIDE: ", results.user);
        res.render('coderooms/coderoom2.ejs', {
            coderoom: {
                name: results.room.name,
                id: results.room._id,
                description: results.room.description,
            }, user: {
                username: results.user.username,
                id: results.user.id,
                avatar: results.user.avatar
            }});
    })
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
       if(results.holder === req.user.id) {
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



//Revoke permission
router.delete('/:roomId/permission', middleware.isOwner, function(req, res, next) {
    console.log('Resetting permission');
    const permissionRef = fb_root.child('permission/' + req.params.roomId);
    permissionRef.update( {'userId': req.user.id} );
    res.redirect('/');
});

//require for permission
router.put('/:roomId/permission', middleware.isLoggedIn, function(req, res, next) {
    console.log('requiring permission');
    const requestingRef = fb_root.child('ask-for-permission/' + req.params.roomId);
    let obj = {};
    obj[req.user.id] = true;
    requestingRef.update( obj );
    res.json({'msg': 'Fin'});
});


//functioning
router.get("/:id/run",function(req, res, next) {
    console.log("run code in this coderoom.", req.params.id);
    const dbRefCode = firebase.database().ref().child('code').child(req.params.id);
    dbRefCode.once('value', snap => {
        const content = snap.val();
        pythonExecutor(res, req.params.id, content["content"]);
    });
});

// delete coderoom by its id
router.delete("/:id",middleware.isOwner, function(req, res, next) {
    console.log("Delete coderoom");
    //TODO owner of coderoom can do this
    Coderoom.findByIdAndRemove(req.params.id).exec(function(err, coderoom) {
        if (err) { return next(err); }
    });
    // delete all coderoom entries in fireabse.
    fb_root.child('comment_list/' + req.params.roomId).remove();
    fb_root.child('ask-for-permission/' + req.params.roomId).remove();
    fb_root.child('code/' + req.params.roomId).remove();
    fb_root.child('permission/' + req.params.roomId).remove();
    fb_root.child('user_list/' + req.params.roomId).remove();
    fb_root.child('user_list/' + req.params.roomId).remove();
    // TODO redirect can cause problem if coderoom is not deleted yet but the homepage reads another round of coderooms
    res.redirect('/');
});

//delete user under this room
router.delete("/:roomId/users", middleware.isLoggedIn, function(req, res, next) {
    console.log("Delete user in this coderoom, userId: ", req.user.id);
//
    let obj = {};
    obj[req.user.id] = false;
    fb_root.child('user_list/' + req.params.roomId).child(req.user.id).remove();
    fb_root.child('ask-for-permission/' + req.params.roomId).update(obj);
//
// //TODO if the user is holding the permission.
// //     fb_root.child('permission/' + req.params.roomId)
// //         .once('value').then(function (snapshot) {
// //             if (snapshot.val().userId === req.user.id) {
// //
// //             }
// //     });
    res.status('200').json({'msg': 'user ' + req.user.id + ' deleted'});
});

router.post('/:roomId/comments', middleware.isLoggedIn, function(req, res, next) {
    console.log("post comment.");
    fb_root.child('comment_list/' + req.params.roomId).push({
            authorId: req.user.id,
            author: req.user.username,
            avatar: DEFAULT_USER_AVATAR,
            content: req.body.content,
            upvote: req.body.upvote,
            downvote: req.body.downvote,
            position: {
                from: {
                    line: parseInt(req.body.pos.from.line),
                    ch: parseInt(req.body.pos.from.ch),
                },
                to: {
                    line: parseInt(req.body.pos.to.line),
                    ch: parseInt(req.body.pos.to.ch),
                }
            },
            code: req.body.code,
            subcomments:{}
        }
    );
    //TODO err handler?
    res.status('200').json({'msg': 'Comment created.'});
});



//this is for subcomment
router.post("/:roomId/comments/inside/:commentId", middleware.isLoggedIn,function (req,res,next) {
    console.log("you get there man");
    console.log(req.params);
    fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId).once('value').then(function (value) {
        console.log("way much beeter");
        console.log(req.user);

        var fb_subomments = fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId).push();
        var sub_comments = fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId).child("subcomments");
        var key = fb_subomments.getKey();
        var subcomments = {};
        var temp_comment = {};
        temp_comment["subauthor"] = req.user.username;
        temp_comment["subid"] = req.user.id;
        temp_comment["subcomment"] = req.body.comment;
        subcomments[key] = temp_comment
        sub_comments.update(subcomments);
        console.log("much much better")
    })

})


router.put('/:roomId/comments/:commentId', function(req, res, next) {
    console.log("modify comment.");
    fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId).once('value')
        .then(function (snapshot) {
            // if (snapshot.authorId !== req.user.id) {
            //     res.status('400').json({'msg': "You can't modify other's comment"});
            //     return;
            // }
            console.log("here");
            fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId)
                .update({"content": req.body.content,"upvote":req.body.upvote, "downvote": req.body.downvote});
            res.status('200').json({'msg': 'Comment created.'});
        });
    //TODO err handler?
});

router.put('/:roomId/comments/vote/:commentId',function(req, res) {
    console.log("modify upvote.");
    fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId).once('value')
        .then(function (snapshot) {
            console.log("here");
            fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId)
                .update({"upvote":req.body.upvote, "downvote": req.body.downvote});
            res.status('200').json({'msg': 'Comment created.'});
        });
    //TODO err handler?
});




module.exports = router;
