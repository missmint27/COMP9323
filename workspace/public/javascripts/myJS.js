//FireBase 设置
var config = {
    apiKey: "AIzaSyDyFnZMXeY2gXJNSZe58tqbOkZX7-5yiDM",
    authDomain: "comp9323-97bb4.firebaseapp.com",
    databaseURL: "https://comp9323-97bb4.firebaseio.com",
    projectId: "comp9323-97bb4",
    storageBucket: "comp9323-97bb4.appspot.com",
    messagingSenderId: "837737259182"
};
firebase.initializeApp(config);
//CodeMirro Editor initialize
//Need further changes for optimization.
var editor = CodeMirror.fromTextArea(document.getElementById("code_input"), {
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

var permission = false;
// const roomId = document.getElementById("roomId");
// const userId = document.getElementById("userId");
const code_input = document.getElementById('code_input');
const comment_list = document.getElementById('comment_list');
const user_list = document.getElementById('user_list');

var roomId = '5bab7be8ade838281621911a';
var userId = '5bb053d0efdfca206dc66b3b';
// var users = null;
// var ask_for_permission = null;

//maintaining a global comment dict, it stores the marker of comment in the coding area, using commentId as key
var comment_dict = {};
//change the global comment mode to shift display mode.
var comment_mode = false;


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
    const avatar    = $("<img>", {class: "avatar img-circle b2-avatar",id: "user_avatar" + user_obj.authorId, src:user_obj.avatar});
    const user = $("<span>", {class: "b2-username"}).text(user_obj.username);
    const up        = $("<div>", {class: "ui-up"}).append(avatar, user);
    const down      = $("<div>", {class: "ui-down"});
    const li = $("<li>", {id: snap.key, class: "user-item"}).append($("<div>", {class:"ui-div"}).append(up, down));
    $("ul[id='user_list']").append(li);
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
            const button = $("<button>", {class: "b2-passbutton"}).text("Pass Permission").click({passTo: request_user}, passPermission);
            $("div ul[id=user_list] li[id=" + request_user + "] div[class=ui-div] div[class=ui-down]").append(button);
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
    const avatar    = $("<img>", {class: "avatar img-circle b2-avatar",id: "comment_avatar" + comment_obj.authorId, src:comment_obj.avatar});
    const user_name = $("<span>", {class: "b2-commentname"}).text(comment_obj.author);
    const content   = $("<p>", {class: "b2-commentcontent"}).text(comment_obj.content);
    const up        = $("<div>", {class: "ci-up"}).append(avatar, user_name);
    const down      = $("<div>", {class: "ci-down"}).append(content);
    const li = $("<li>", {id: snap.key, class: "comment-item"}).append($("<div>", {class:"ci-div"}).append(up, down));
    $("ul[id='comment_list']").append(li);
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
});

dbRefCommentList.on('child_removed', snap => {
    const liToRemove = document.getElementById(snap.key);
    let comment_marker = comment_dict[snap.key];
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
    //TODO change
    // const url = 'http://' + host + path + '/run';
    const url = 'http://127.0.0.1:3000/api/coderooms/' + roomId + '/run';
    console.log(url);
    $.ajax({
        url: url,
        method: 'get',
        dataType: 'json'
    }).done(function (data) {
        if (data['output'])
            result.innerText = data['output'];
        else
            result.innerText = data['err'];
    }).fail(function (xhr, status) {
        result.innerText = 'Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg;
    });
}

function postComment() {
    const pos  = editor.getSelectedRange();
    const url  = urlGetter() + '/comments';
    const code = editor.getRange(pos.from, pos.to);
    // const url = 'http://127.0.0.1:3000/api/coderooms/' + roomId + '/comments';
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
            code: code,
            content: document.getElementById('comment_input').value
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
    const button = document.getElementById("comments-btn");
    const comment_block = document.getElementById("comments");
    const user_block = document.getElementById("participants_block");
    if (!comment_mode) {
        comment_block.style.display = "none";
        user_block.style.display = "";
        button.innerHTML = "SHOW COMMENTS";
    } else {
        comment_block.style.display = "";
        user_block.style.display = "none";
        button.innerHTML = "HIDE COMMENTS";
    }
}
function urlGetter() {
    const host = window.location.host;
    const path = window.location.pathname;
    return 'http://' + host + path;
}