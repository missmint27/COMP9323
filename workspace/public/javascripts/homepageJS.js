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
const dbRefObject = firebase.database().ref();
const dbRootUserList = firebase.database().ref().child('user_list');

const avatar_list = document.getElementsByClassName("avatars");
for(let i = 0; i < avatar_list.length; i++) {
    if (avatar_list[i].id) {
        const dbRefUserList = dbRootUserList.child(avatar_list[i].id);
        dbRefUserList.on('child_added', snap => {
            const user_obj = snap.val();
            const img     = $("<img>", {alt: user_obj.username, class: "avatar", src:user_obj.avatar});
            const link    = $("<a>", {href: "/profiles/" + user_obj.id, src:user_obj.avatar, "data-toggle": "tooltip", title: user_obj.username }).append(img);
            const li = $("<li>", {id: snap.key}).append(link);
            $("ul[id=" + avatar_list[i].id+ "]").append(li);
        });

        dbRefUserList.on('child_removed', snap => {
            const liToRemove = document.getElementById(snap.key);
            liToRemove.remove();
        });
    }
}

function revoke_permission(roomId) {
    const host = window.location.host;
    const url = 'http://' + host + '/coderooms/'+roomId + '/permission';
    console.log(url);
    $.ajax({
        url: url,
        method:'delete',
    })
        .done(function (data) { console.log(data); })
        .fail(function (xhr, status){ console.log(xhr.status); })
}