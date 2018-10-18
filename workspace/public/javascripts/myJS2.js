//FireBase 设置
const config = {
    apiKey: "AIzaSyDyFnZMXeY2gXJNSZe58tqbOkZX7-5yiDM",
    authDomain: "comp9323-97bb4.firebaseapp.com",
    databaseURL: "https://comp9323-97bb4.firebaseio.com",
    projectId: "comp9323-97bb4",
    storageBucket: "comp9323-97bb4.appspot.com",
    messagingSenderId: "837737259182"
};
firebase.initializeApp(config);

const roomId = document.getElementById("roomId").innerText;
const userId = document.getElementById("userId").innerText;
const code_input = document.getElementById('code_input');
//maintaining a global comment dict, it stores the marker of comment in the coding area, using commentId as key
let comment_dict = {};
//change the global comment mode to shift display mode.
let comment_mode = false;
let permission = false;

console.log("userID: ", userId);
console.log("roomID: ", roomId);
//CodeMirro Editor initialize
//Need further changes for optimization.
let editor = CodeMirror.fromTextArea(document.getElementById("code_input"), {
    mode: "python",
    theme: "darcula",
    lineNumbers: true,
// autoMatchBrackets: true,
    readOnly: !permission,                 //set to true if user have the permission.
});
//when editor's content changed, call updateCode()
editor.on('change', updateCode);

//return pos: {from: {line:int, ch:int}, to:{line: int, ch: int}}
editor.getSelectedRange = function() {
    return { from: editor.getCursor(true), to: editor.getCursor(false) };
};

//dbRefObject is the root directory of firebase
const dbRefObject = firebase.database().ref();
const dbRefCommentList = dbRefObject.child('comment_list').child(roomId);
const dbRefUserList = dbRefObject.child('user_list').child(roomId);
const dbRefCode = dbRefObject.child('code').child(roomId);
const dbRefRoomPermission = dbRefObject.child('permission/' + roomId);
const dbRefAskForPermission = dbRefObject.child('ask-for-permission/' + roomId);


//track the permission status.
//if permission is true, set the editor readOnly to false, theme will be changed as well.
dbRefRoomPermission.on('value', snap => {
    const permission_holder = snap.val().userId;
    console.log("permission holder: ", permission_holder);
    const permission_write = document.getElementById('write-permission');
    if (permission_holder !== userId && permission === false) {
    } else {
        permission = permission_holder === userId;
        dbRefCode.once('value', codeSnap => {
            const content = codeSnap.val();
            //global var permission
            code_input.value = content['content'];
            editor.setValue(code_input.value);
            editor.setOption("readOnly", !permission);
            if(permission) {
                editor.setOption("theme", 'darcula');
                permission_write.className = "have-this-permission";
            } else {
                editor.setOption("theme", 'lucario');
                permission_write.className = "no-permission";
            }
        });
    }
});


//initialize code input
dbRefCode.once('value', snap => {
    const content = snap.val();
    code_input.value = content['content'];
    editor.setValue(code_input.value);
});

//synchronize code input
dbRefCode.on('value', snap => {
    const content = snap.val();
    code_input.value = content['content'];
    if (!permission)
        editor.setValue(code_input.value);
});

//同步user list, 因为user list是由子elem构成的所以按照子elem来增删（用户进入/离开房间）
dbRefUserList.on('child_added', snap => {
    const user_obj = snap.val();
    const avatar   = $("<img>", {alt: user_obj.username, class: "avatar mr-2",id: "user_avatar" + user_obj.authorId, src:user_obj.avatar});
    const user     = $("<span>", {class: "h6 mb-0", "data-filter-by": "text"}).text(user_obj.username);
    const add = $("<div>", {id: snap.key, class: "custom-control custom-checkbox"})
        .append($("<div>", {class:"d-flex align-items-center", id: user_obj.userId}).append(avatar, user));
    $("div[id='user-group']").append(add);

});

dbRefUserList.on('child_removed', snap => {
    const liToRemove = document.getElementById(snap.key);
    liToRemove.remove();
});

// Ask for permission need to be after user list, because it needs the elements user list generates.
dbRefAskForPermission.on('child_added', snap => {
    if (permission) {
        const request_user = snap.key;
        if (snap.val()) {
            const button = $("<button>", {class: "btn btn-warning", style: "display: inline; width: 10em; margin-left:6em;"}).text("Pass Permission").click({passTo: request_user}, passPermission);
            $("div[id=" + request_user + "] div[class='d-flex align-items-center']").append(button);
        }
    }
});

dbRefAskForPermission.on('child_removed', snap => {
    if (permission) {
        const request_user = snap.key;
        if (snap.val()) {
            $("div ul[id=user_list] li[id=" + request_user + "] div button").remove();
        }
    }
});

//同步comment list，与user list类似，但是comment可以改，user不行
dbRefCommentList.on('child_added', snap => {
    const comment_obj = snap.val();
    console.log(comment_obj);

    var score = parseInt(comment_obj.upvote) - parseInt(comment_obj.downvote);
    score = score.toString();
    //this is the score
    const likeordislike = $("<div class=\"chat-item-likeordis\">" +
        "<div class=\"chat-item-like\"><i class=\"up\"></i></div>" +
        "<div class=\"chat-likenum\"><p>3</p></div> "+
        "<div class=\"chat-item-dislike\"><i class=\"down\"></i></div></div>");

    console.log(comment_obj.upvote);
    console.log(comment_obj.downvote);
    const img    = $("<img>", {
        alt: comment_obj.author,
        class: "avatar",
        id: "comment_avatar" + comment_obj.authorId,
        src:comment_obj.avatar});
    comments = {};
    var subcomments = comment_obj.subcomments;


    const title = $("<div>", {class: "chat-item-title"})
        .append($("<span>", {class:"chat-item-author", 'data-filter-by':"text"}).text(comment_obj.author));
    const body  = $("<div>", {class: "chat-item-body", 'data-filter-by':"text"}).text(comment_obj.content);


    const item = $("<div>", {class: "media-body"}).append(title, body);
    for(var i in subcomments){
        var subauthor = subcomments[i].subauthor;
        var comment = subcomments[i].subcomment;
        var subid = subcomments[i].subid;
        const sub_author = $("<div>",{class:"chat-item-subauthor"}).text(subauthor);
        const subcomment = $("<div>",{class:"chat-item-subcomment"}).text(comment);
        item.append(sub_author, subcomment);

    }
    const reply_up = $("<div>", {class: "chat-item-up"}).append(likeordislike,img, item);
    const reply_input = $("<input>",{class:"chat-item-input form-control"});
    const reply_button = $("<button>", {class:"chat-item-reply btn btn-primary btn-small"}).text("");
    const button_content = $("<i>", {class: "fa fa-paper-plane"});
    reply_button.append(button_content);

    const reply_down = $("<div>", {class: "chat-item-down"}).append(reply_input, reply_button);
    const add = $("<div>", {id: snap.key, class: "chat-item"}).append(reply_up, reply_down);
    $("div[id='chat-box']").append(add);

    if (comment_obj.position) {
        const pos = comment_obj.position;
        const code = comment_obj.code;
        if (code === editor.getRange(pos.from, pos.to)) {
            comment_dict[snap.key] = editor.getDoc().markText({
                line: pos.from.line,
                ch: pos.from.ch
            }, {
                line: pos.to.line,
                ch: pos.to.ch
            }, {
                className: "cm-marker",
            });
        }
    }
 //this is for upvote and downvote
    var ele = document.getElementById(snap.key);
    var ele1 = ele.getElementsByClassName("up");
    ele1[0].addEventListener("click",function (ev) { upvote(snap.key, comment_obj.upvote,comment_obj.downvote);});

    var ele_down = document.getElementById(snap.key);
    var ele_down_1 = ele_down.getElementsByClassName("down");
    ele_down_1[0].addEventListener("click",function (evt) { downvote(snap.key, comment_obj.upvote, comment_obj.downvote)});

    // this is for subcomment
    var text_class =  document.getElementsByClassName("chat-item-input form-control")
    var text = text_class[text_class.length - 1].value;
    var button_class = document.getElementsByClassName("chat-item-reply btn btn-primary btn-small");
    button_class[button_class.length - 1].addEventListener("click",function () {
            comment_submit(snap.key)

    }) ;

});
function comment_submit(path) {
    const url = urlGetter() + "/comments/" + "inside/" + path
    var d1 = document.getElementById(path);
    var text =  d1.getElementsByClassName("chat-item-input form-control")[0].value
    console.log(text);
    $.ajax({
        url:url,
        method:"post",
        data:{
            comment: text,
        }
    }).done(function () {
        console.log("comments inside comments");

    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    })

}

function upvote(path,upvote,downvote) {
    const url  = urlGetter() + '/comments/'+"vote/" + path;
    upvote = parseInt(upvote);
    upvote += 1
    upvote = upvote.toString();
    $.ajax({
        url: url,
        method:'put',
        data:{
            upvote:upvote,
            downvote:downvote
        }
       }).done(function (data) {
            console.log(data);
        }).fail(function (xhr, status) {
            console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
        })
    }


function downvote(path, upvote,downvote) {

    const url = urlGetter() + "/comments/" +"vote/" + path;
    downvote = parseInt(downvote);
    downvote -= 1
    downvote = downvote.toString();

    $.ajax({
        url: url,
        method:'put',
        data:{
            upvote:upvote,
            downvote: downvote}
        }).done(function (data) {
            console.log(data)}).fail(function (xhr, status){
        console.log(xhr.status);
    })}


dbRefCommentList.on('child_removed', snap => {
    const liToRemove = document.getElementById(snap.key);
    const comment_marker = comment_dict[snap.key];
    console.log("Comment removed");
    liToRemove.remove();
    comment_marker.clear();
});

//TODO change.
// dbRefCommentList.on('child_changed', snap => {
//     const liChanged = document.getElementById(snap.key);
//     liChanged.innerText = JSON.stringify(snap.val());
// });

window.onbeforeunload = function (e) {
    const url = urlGetter() + '/users';
    // const url = 'http://127.0.0.1:3000/api/coderooms/' + roomId + '/users';
    $.ajax({
        url: url,
        method: 'delete',
        dataType: 'json',
    }).done(function (data) {
        console.log(data);
    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    });
};
//function to update code to firebase
function updateCode() {
    firebase.database().ref().child('code/').child(roomId).update(
        {'content': editor.getValue()}
    );
}

function run() {
    const result = document.getElementById('result');
    const host = window.location.host;
    const path = window.location.pathname;
    const url = 'http://' + host + path + '/run';
    console.log(url);
    $.ajax({
        url: url,
        method: 'get',
        dataType: 'json'
    }).done(function (data) {
        result.innerText = null;
        if (data['output']) {
            result.innerText += data['output']
        }
        if (data['err']) {
            result.innerText += data['err'];
        }
    }).fail(function (xhr, status) {
        result.innerText = 'Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg;
    });
}

function postComment() {
    const pos  = editor.getSelectedRange();
    const url  = urlGetter() + '/comments';
    const code = editor.getRange(pos.from, pos.to);
    console.log(url);
    $.ajax({
        url: url,
        method: 'post',
        dataType: 'json',
        data: {
            pos: {
                from: {
                    ch:pos.from.ch,
                    line:pos.from.line
                },
                to: {
                    ch:pos.to.ch,
                    line:pos.to.line
                }
            },
            upvote:0,
            downvote:0,
            code: code,
            content: document.getElementById('chat-message').value
        }
    }).done(function (data) {
        console.log(data);
    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    });
}

//change the user's state to ask-for-permission: true
function requirePermission() {
    const url = urlGetter() + '/permission';
    $.ajax({
        url: url,
        method: 'put',
        dataType: 'json',
    }).done(function (data) {
        console.log(data);
    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    });
}

//Bind with user list's button, pass the permission to this user(if you got the permission)
function passPermission(event) {
    const passToId = event.data.passTo;
    const url = urlGetter() + '/permission/' + passToId;
    console.log("Pass to: ", passToId);
    $.ajax({
        url: url,
        method: 'put',
        dataType: 'json',
    }).done(function (data) {
        console.log(data);
    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    });
}

//TODO Delete after testing.
function resetPermission() {
    const passToId = '5bb053d0efdfca206dc66b3f';
    const url = urlGetter() + '/permission/' + passToId;
    // const url = 'http://127.0.0.1:3000/api/coderooms/' + roomId + '/permission/' + passToId;
    $.ajax({
        url: url,
        method: 'delete',
        dataType: 'json',
    }).done(function (data) {
        console.log(data);
    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    });
}

//TODO merge with comment-block and user-block's display control part
function modeChange() {
    comment_mode = !comment_mode;
    let marker_list=document.getElementsByClassName("cm-marker");
    let length = marker_list.length;
    let css = null;
    if (comment_mode) {
        css = "background-color : #ff7"
    }
    while(length--) {
        marker_list[length].style.cssText=css;
    }
    hideComments();
}

function hideComments() {
    const button = document.getElementById("comment-btn-text");
    if (!comment_mode) {
        button.innerHTML = "Show Comments";
    } else {
        button.innerHTML = "Hide Comments";
    }
}
function urlGetter() {
    const host = window.location.host;
    const path = window.location.pathname;
    return 'http://' + host + path;
}
