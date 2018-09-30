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

    const code = document.getElementById('code');
    const comment_list = document.getElementById('comment_list');
    const user_list = document.getElementById('user_list');

    //dbRefObject 是firebase根目录
    const dbRefObject = firebase.database().ref();
    const dbRefCommentList = dbRefObject.child('comment_list').child('classroom1');
    const dbRefUserList = dbRefObject.child('user_list').child('classroom1');
    const dbRefCode = dbRefObject.child('code');
    const code_input = document.getElementById('code_input');

    //同步输入框
    dbRefCode.on('value', snap => {
        const content = snap.val();
        code_input.value = content["classroom1"];
    });

    //同步code显示框
    dbRefCode.on('value', snap => {
        const content = snap.val();
        code.innerText = JSON.stringify(content["classroom1"]);
    });

    //同步user list, 因为user list是由子elem构成的所以按照子elem来增删（用户进入/离开房间）
    //之后需在list中添加更多元素比如：请求permission（bool）（当permission转换时，所有请求permission的状态应该转成false，新一轮）， 
    //拥有permission（bool）。。。。
    dbRefUserList.on('child_added', snap => {
        const li = document.createElement('li');
        li.innerText = snap.val();
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
        li.innerText = snap.val();
        li.id = snap.key;
        comment_list.appendChild(li);
    });

    dbRefCommentList.on('child_removed', snap => {
        const liToRemove = document.getElementById(snap.key);
        liToRemove.remove();
    });
    dbRefCommentList.on('child_changed', snap => {
        const liChanged = document.getElementById(snap.key);
        liChanged.innerText = snap.val();
    });

})();

//通过侦测keyup来触发此function， 将code update到firebase，之后需结合permission使用
function updateCode() {
    const code_input = document.getElementById('code_input');
    firebase.database().ref().child('code/').update({
        "classroom1": code_input.value
    });
}

function addComment() {
    const comment_input = document.getElementById('comment_input');
    const newPostRef = firebase.database().ref().child('comment_list/' + 'classroom1').push(comment_input.value);
    console.log(newPostRef.key);
}
function addUser() {
    const user_input = document.getElementById('user_input');
    const newPostRef = firebase.database().ref().child('user_list/' + 'classroom1').push(user_input.value);
    console.log(newPostRef.key);
}
//user_id是之前addUser时打印的newPostRef.key. remove comment基本是一样的操作
function removeUser() {
    const user_id = document.getElementById('user_id');
    firebase.database().ref().child('user_list/' + 'classroom1').child(user_id.value).remove();
}

//还需要将classroom1，user1, comment1之类的改成classroomID, userID, commentID