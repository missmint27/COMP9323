(function() {
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
    console.log("Test.");

    var roomId = '5bab7be8ade838281621911a';


    const code = document.getElementById('code');
    const comment_list = document.getElementById('comment_list');
    const user_list = document.getElementById('user_list');

    //dbRefObject 是firebase根目录
    const dbRefObject = firebase.database().ref();
    const dbRefCommentList = dbRefObject.child('comment_list').child(roomId);
    const dbRefUserList = dbRefObject.child('user_list').child(roomId);
    const dbRefCode = dbRefObject.child('code').child(roomId);
    const code_input = document.getElementById('code_input');

    //同步输入框
    dbRefCode.on('value', snap => {
        const content = snap.val();
        code_input.value = content['content'];
    });

    //同步code显示框
    dbRefCode.on('value', snap => {
        const content = snap.val();
        code.innerText = content['content'];
    });

    //同步user list, 因为user list是由子elem构成的所以按照子elem来增删（用户进入/离开房间）
    //之后需在list中添加更多元素比如：请求permission（bool）（当permission转换时，所有请求permission的状态应该转成false，新一轮）， 
    //拥有permission（bool）。。。。
    dbRefUserList.on('child_added', snap => {
        const li = document.createElement('li');
        li.innerText = snap.val().username;
        li.id = snap.key;
        user_list.appendChild(li);
    });
    dbRefUserList.on('child_removed', snap => {
        const liToRemove = document.getElementById(snap.key);
        liToRemove.remove();
    });

    //同步comment list，与user list类似，但是comment可以改，user不行
    //comment list 需要有：（作者, 内容, 子comment，。。。）
    dbRefCommentList.on('child_added', snap => {
        const li = document.createElement('li');
        li.innerText = JSON.stringify(snap.val(), null, 3);
        li.id = snap.key;
        comment_list.appendChild(li);
    });

    dbRefCommentList.on('child_removed', snap => {
        const liToRemove = document.getElementById(snap.key);
        liToRemove.remove();
    });
    dbRefCommentList.on('child_changed', snap => {
        const liChanged = document.getElementById(snap.key);
        liChanged.innerText = JSON.stringify(snap.val());
    });

    //CodeMirro Editor initialize
    //Need further changes for optimization.
    var editor = CodeMirror.fromTextArea(document.getElementById("code_input"), {
        mode: "python",
        theme: "darcula",
        lineNumbers: true,
        autoMatchBrackets: true,
        readOnly: false                 //set to true if user have the permission.
    });
    //function to update code to firebase
    function updateCode() {
        editor.save();
        const roomId = '5bab7be8ade838281621911a';
        const code_input = document.getElementById('code_input');
        firebase.database().ref().child('code/').child(roomId).update(
            {'content': code_input.value}
        );
    }
    //when editor's content changed, call updateCode()
    editor.on('change', updateCode);
})();

function addComment() {
    const roomId = '5bab7be8ade838281621911a';
    const comment_input = document.getElementById('comment_input');
    const newPostRef = firebase.database().ref().child('comment_list/' + roomId).push(
        {
            author: 'null',              //TODO
            content: comment_input.value,
            sub_comment: 'null',         //TODO
            position: 'null'             //TODO
        });
    console.log(newPostRef.key);
}

function addUser() {
    //user will be input later
    const user = {
        id: '5bb053d0efdfca206dc66b3f',
        username: 'tester6'
    };
    const roomId = '5bab7be8ade838281621911a';
    const url = '/users/' + user.id;
    const user_input = document.getElementById('user_input');
    const newPostRef = firebase.database().ref().child('user_list/' + roomId).child(user.id)
        .update({
            'username': user.username, 
            'permission': false, 
            'ask-for-permission': false,
            'url': url
        });
}

//user_id是之前addUser时打印的newPostRef.key. remove comment基本是一样的操作
function removeUser(user) {
    const roomId = '5bab7be8ade838281621911a';
    const user_id = document.getElementById('user_id');
    firebase.database().ref().child('user_list/' + roomId).child(user_id.value).remove();
}

function run() {
    const result = document.getElementById('result');
    const roomId = '5bab7be8ade838281621911a'
    const url = 'http://127.0.0.1:3000/api/coderooms/' + roomId + '/run';
    var jqxhr = $.ajax({
        url: url, 
        method: 'get',
        dataType: 'json'
    }).done(function (data) {
        result.innerText = JSON.stringify(data);
    }).fail(function (xhr, status) {
        result.innerText = 'Fail: ' + xhr.status + ', Reason: ' + status;
    }).always(function () {
        console.log("This is an ajex request");
    });
}











//还需要将classroom1，user1, comment1之类的改成classroomID, userID, commentID