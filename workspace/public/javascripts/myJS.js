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
    var permission = false;
    var roomId = '5bab7be8ade838281621911a';//需要动态获取roomid
    var userId = '5bb053d0efdfca206dc66b3b';
    var users = null;
    var ask_for_permission = null;
    //CodeMirro Editor initialize
    //Need further changes for optimization.
    var editor = CodeMirror.fromTextArea(document.getElementById("code_input"), {
        mode: "python",
        theme: "darcula",
        lineNumbers: true,
        // autoMatchBrackets: true,
        readOnly: !permission,                 //set to true if user have the permission.
        // highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true}
    });
    var comment_dict = {};
    var comment_mode = false;
    //when editor's content changed, call updateCode()
    editor.on('change', updateCode);
    editor.getSelectedRange = function() {
        return { from: editor.getCursor(true), to: editor.getCursor(false) };
    };

    //dbRefObject 是firebase根目录
    const dbRefObject = firebase.database().ref();
    const dbRefCommentList = dbRefObject.child('comment_list').child(roomId);
    const dbRefUserList = dbRefObject.child('user_list').child(roomId);
    const dbRefCode = dbRefObject.child('code').child(roomId);
    const dbRefRoomPermission = dbRefObject.child('permission/' + roomId);
    const dbRefAsk4Permission = dbRefObject.child('ask-for-permission/' + roomId);

    const code_input = document.getElementById('code_input');
    const code = document.getElementById('code');
    const comment_list = document.getElementById('comment_list');
    const user_list = document.getElementById('user_list');

    //track the permission status.
    //if permission is true, set the editor readOnly to false, theme will be changed as well.
    dbRefRoomPermission.on('value', snap => {
        const permission_holder = snap.val().userId;
        console.log("permission holder: ", permission_holder);
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
                } else {
                    editor.setOption("theme", 'lucario');
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

    //synchronize code display
    dbRefCode.on('value', snap => {
        const content = snap.val();
        code.innerText = content['content'];
    });

    //同步user list, 因为user list是由子elem构成的所以按照子elem来增删（用户进入/离开房间）
    //TODO add a ask-for-permission button
    dbRefUserList.on('child_added', snap => {
        const user = $("<span>").text(snap.val().username);
        const button = $("<button>").text("Pass Permission").click({passTo: snap.key}, passPermission);
        const add = $("<li>", {id: snap.key}).append($("<div>", {class: "UserList"}).append(user, button));
        $("ul[id='user_list']").append(add);
    });

    function test(event) {
        console.log(event.data.passTo);
    }
    dbRefUserList.on('child_removed', snap => {
        const liToRemove = document.getElementById(snap.key);
        liToRemove.remove();
    });

    //同步comment list，与user list类似，但是comment可以改，user不行
    //改成仅当comment 模式的时候显示
    dbRefCommentList.on('child_added', snap => {
        const li = document.createElement('li');
        const comment = snap.val();
        li.innerText = JSON.stringify({
            author: comment.author,
            content: comment.content,
        });
        li.id = snap.key;
        comment_list.appendChild(li);
        if (comment.position) {
            const pos = comment.position;
            const code = comment.code;
            if (code === editor.getRange(pos.from, pos.to)) {
                let comment_marker = editor.getDoc().markText({
                    line: pos.from.line,
                    ch: pos.from.ch
                }, {
                    line: pos.to.line,
                    ch: pos.to.ch
                }, {
                    css: "background-color : #ff7"
                });
                comment_dict[snap.key] = comment_marker;
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

    dbRefCommentList.on('child_changed', snap => {
        const liChanged = document.getElementById(snap.key);
        liChanged.innerText = JSON.stringify(snap.val());
    });


     window.onbeforeunload = function (e) {
         const host = window.location.host;
         const path = window.location.pathname;
         const url = 'http://' + host + path + '/users';
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
    // const url = 'http://127.0.0.1:3000/api/coderooms/' + roomId + '/run';
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
    const host = window.location.host;
    const path = window.location.pathname;
    const pos  = editor.getSelectedRange();
    const url  = 'http://' + host + path + '/comments';
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

function requirePermission() {
    const host = window.location.host;
    const path = window.location.pathname;
    const url = 'http://' + host + path + '/permission';
    // const url = 'http://127.0.0.1:3000/api/coderooms/' + roomId + '/permission';
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

function passPermission(event) {
    const host = window.location.host;
    const path = window.location.pathname;
    const passToId = event.data.passTo;
    const url = 'http://' + host + path + '/permission';
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

function resetPermission() {

 const host = window.location.host;
 const path = window.location.pathname;
 const passToId = '5bb053d0efdfca206dc66b3f';
 const url = 'http://' + host + path + '/permission/' + passToId;
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

//TODO change mode between coding and commenting
function modeChange() {
    comment_mode = !comment_mode;
}
//TODO delete user in the user_list when leave room.(close the window/jump to other pages.)
//还需要将classroom1，user1, comment1之类的改成classroomID, userID, commentID