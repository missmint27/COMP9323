var express = require("express");
var router  = express.Router();
var Coderoom = require("../models/coderoom");
var User = require('../models/user');
var middleware = require("../middleware");
var firebase = require('firebase');


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


//create new coderoom，
router.post("/", middleware.isLoggedIn,function(req, res, next) {
    var coderoom = new Coderoom(
        {
            name: req.body.name,
            description: req.body.description,
            author:{
                id: req.user.id,
                username: req.user.username
            },
        });
    coderoom.save(function(err, coderoom) {
        if (err) { return next(err); }
        User.findByIdAndUpdate(req.user.id,
            {$addToSet: {myrooms: {_id:coderoom.id}}}, {new:true}, function(err, user) {
                if(err) { return next(err); }
            });
        fb_root.child('code/').child(coderoom.id).update(
            {'content': "print(\"Hello World\")","upvote":0, "downvote":0}
        );
        fb_root.child('user_list/' + coderoom.id).child(req.user.id)
            .update({
                'username': req.user.username,
                'url': '/users/' + req.user.id,
                'avatar': req.user.avatar
            });
        fb_root.child('permission/' + coderoom.id).update(
            { "userId" : req.user.id}
        );
        res.redirect('/coderooms/' + coderoom.id);
    });
});

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
                        'avatar': req.user.avatar,
                        'id': req.user.id,
                    });
                callback(null, req.user);
            } else { callback(null, {username: 'anonymous user', avatar: DEFAULT_USER_AVATAR, _id: null}); }
        }
    }, function(err, results) {
        res.render('coderooms/coderoom2.ejs', {
            coderoom: {
                name: results.room.name,
                id: results.room._id,
                description: results.room.description,
                room_rank: results.room.upvote.length - results.room.downvote.length
            }, user: {
                username: results.user.username,
                id: results.user.id,
                avatar: results.user.avatar
            }});
    })
});

//pass permission to userId
router.put('/:roomId/permission/:userId', middleware.isLoggedIn, function(req, res, next) {
   console.log(req.user.id, ' is Passing permission to ', req.params.userId);
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
router.delete('/:roomId/permission', middleware.isLoggedIn, function(req, res, next) {
    console.log('Resetting permission');
    Coderoom.findOne({
        '_id': req.params.roomId,
        "author.id": req.user.id
    }, function (err, coderoom) {
        if (err) return next(err);
        if (!coderoom) {
            res.status('400').json({'msg': 'No permission'});
            return;
        }
        const permissionRef = fb_root.child('permission/' + req.params.roomId);
        permissionRef.update( {'userId': req.user.id} );
        console.log("updated");
        res.status('200').json({'msg': 'Reset permission.'});
    });
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
    if (req.user.isAdmin) {
        Coderoom.findByIdAndRemove(req.params.id, function (err,coderoom){
            if (err) console.log(err);
        });
    } else {
        Coderoom.findOneAndRemove({
            '_id': req.params.id,
            "author.id": req.user.id
        }, function (err, coderoom) {
            if (err) return next(err);
        });
        User.findByIdAndUpdate(req.user.id, {$pull: {myrooms: {"_id": req.params.id}}}, {new:true}, function(err, user) {
            if(err) {console.log(err);return next(err);}
        });
    }
    // delete all coderoom entries in fireabse.
    fb_root.child('comment_list/' + req.params.roomId).remove();
    fb_root.child('ask-for-permission/' + req.params.roomId).remove();
    fb_root.child('code/' + req.params.roomId).remove();
    fb_root.child('permission/' + req.params.roomId).remove();
    fb_root.child('user_list/' + req.params.roomId).remove();
    // TODO redirect can cause problem if coderoom is not deleted yet but the homepage reads another round of coderooms
    res.redirect('/');
});

//delete user under this room
router.delete("/:roomId/users", function(req, res, next) {
    if (!req.user) {
        res.json({'msg': 'Done'});
        return;
    }
    console.log("Delete user in this coderoom, userId: ", req.user.id);

    let userListRef = fb_root.child('user_list/' + req.params.roomId);
    let requestListRef = fb_root.child('ask-for-permission/' + req.params.roomId);
    let permissionRef = fb_root.child('permission/' + req.params.roomId);
    userListRef.child(req.user.id).remove();
    requestListRef.child(req.user.id).remove();

    permissionRef.once('value', holder => {
        if (holder.val().userId === req.user.id) {
            console.log("permission leave.");
            requestListRef.once('value', requestList => {
                //pass the permission to the first user asking for permission

                for (let userId in requestList.val()) {
                    permissionRef.update( {'userId': userId} );
                    requestListRef.remove();
                    res.status('200').json({"msg": 'Left, permission transferred to user: ' + userId});
                    return;
                }
                // if no user asking for permission, pass permission to the first user in the user list.
                if (!requestList.val()) {
                    console.log("No user requesting.");
                    userListRef.once('value', userList => {
                        for (let userId in userList.val()) {
                            permissionRef.update({'userId': userId});
                            requestListRef.remove();
                            res.status('200').json({"msg": 'Left, permission transferred to user: ' + userId});
                            return;
                        }
                    });
                }
                //TODO if no user in the room and the permission holder left.
            })
        } else {res.status('200').json({'msg': 'user ' + req.user.id + ' deleted'});}
    });

});

router.post('/:roomId/comments', middleware.isLoggedIn, function(req, res, next) {
    console.log("post comment.");
    fb_root.child('comment_list/' + req.params.roomId).push({
            author: {
                id: req.user.id,
                username: req.user.username,
                avatar: req.user.avatar,
            },
            content: req.body.content,
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
        }
    );
    res.status('200').json({'msg': 'Comment created.'});
});

//this is for subcomment
router.post("/:roomId/comments/inside/:commentId", middleware.isLoggedIn,function (req,res,next) {
    console.log("posting sub comment");
    let subCommentRef = fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId).child("subComments");
    let commentId = subCommentRef.push({
        author: {
            id: req.user.id,
            username:  req.user.username,
            avatar: req.user.avatar,
        },
        content: req.body.comment,
    });
    res.json({'msg': 'commentID: ' + commentId + ' created.'});
});


router.put('/:roomId/comments/:commentId', middleware.isLoggedIn, function(req, res, next) {
    console.log("modify comment.");
    fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId).once('value')
        .then(function (snapshot) {
            if (snapshot.author.id !== req.user.id) {
                res.status('400').json({'msg': "You can't modify other's comment"});
                return;
            }
            fb_root.child('comment_list/' + req.params.roomId).child(req.params.commentId)
                .update({"content": req.body.content});
            res.status('200').json({'msg': 'Comment created.'});
        });
    //TODO err handler?
});

router.put('/:roomId/comments/upvote/:path',middleware.isLoggedIn, function(req, res) {
    console.log("modify upvote.");
    const commentRef = fb_root.child('comment_list/' + req.params.roomId).child(req.params.path);
    const upvote_obj = {};
    upvote_obj[req.user.id] = true;
    commentRef.child('upvote').update(upvote_obj);
    commentRef.child('downvote/' + req.user.id).remove();
    res.json({'msg': 'Upvoted comment: ' + req.params.path});
    //TODO err handler?
});

router.put('/:roomId/comments/downvote/:path',middleware.isLoggedIn, function(req, res) {
    console.log("modify downvote.");
    const commentRef = fb_root.child('comment_list/' + req.params.roomId).child(req.params.path);
    const downvote_obj = {};
    downvote_obj[req.user.id] = true;
    commentRef.child('downvote').update(downvote_obj);
    commentRef.child('upvote/' + req.user.id).remove();
    res.json({'msg': 'Upvoted comment: ' + req.params.path});
    //TODO err handler?
});

router.put('/:roomId/upvote',middleware.isLoggedIn, function(req, res,next) {
    console.log("modify room upvote.");
    Coderoom.findByIdAndUpdate(req.params.roomId, {$addToSet: {upvote: {_id: req.user.id}}}, {new:true}, function(err, coderoom) {
        if(err) {console.log(err);return next(err);}
        Coderoom.findByIdAndUpdate(req.params.roomId, {$pull: {downvote: req.user.id}}, {new:true}, function(err, coderoom) {
            if(err) {console.log(err);return next(err);}
            res.json({'msg': 'Upvoted!', 'new_rank': parseInt(coderoom.upvote.length) - parseInt(coderoom.downvote.length)});
        });
    });

});

router.put('/:roomId/downvote',middleware.isLoggedIn, function(req, res, next) {
    console.log("modify room downvote.");
    Coderoom.findByIdAndUpdate(req.params.roomId, {$addToSet: {downvote: {_id: req.user.id}}}, {new:true}, function(err, coderoom) {
        if(err) {console.log(err);return next(err);}
        Coderoom.findByIdAndUpdate(req.params.roomId, {$pull: {upvote: req.user.id}}, {new:true}, function(err, coderoom) {
            if(err) {console.log(err);return next(err);}
            res.json({'msg': 'Downvoted!', 'new_rank': parseInt(coderoom.upvote.length) - parseInt(coderoom.downvote.length)});
        });
    });
});


module.exports = router;
