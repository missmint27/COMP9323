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
// const dbRefCode = dbRefObject.child('code').child(roomId);
const avatar_list = document.getElementsByClassName("avatars");
for(let i = 0; i < avatar_list.length; i++) {
    if (avatar_list[i].id) {
        const dbRefUserList = dbRootUserList.child(avatar_list[i].id);
        dbRefUserList.on('child_added', snap => {
            const user_obj = snap.val();
            const img     = $("<img>", {alt: user_obj.username, class: "avatar", src:user_obj.avatar});
            const link    = $("<a>", {href: "#", src:user_obj.avatar, "data-toggle": "tooltip", title: user_obj.username }).append(img);
            const li = $("<li>", {id: snap.key}).append(link);
            $("ul[id=" + avatar_list[i].id+ "]").append(li);
        });

        dbRefUserList.on('child_removed', snap => {
            const liToRemove = document.getElementById(snap.key);
            liToRemove.remove();
        });
    }
}



// var like_list = $(".card-like");
// var dislike_list = $(".card-dislike");
//
// //add listener
//
//
// for(var i in like_list){
//
//     var array = like_list[i].parentNode.nextElementSibling.children[0].action.split("/");
//     var dest = array[array.length - 1];
//     const dbRefCode = dbRefObject.child('code').child(dest);
//     var up_number = null;
//     var down_number = null;
//     dbRefCode.on("value",snap => {
//         up_number = snap.val().upvote;
//         down_number = snap.val().downvote;
//         console.log("up",up_number);
//
//     });
//
//     like_list[i].addEventListener("click",function(){upvote(dest, up_number,down_number)});
//     dislike_list[i].addEventListener("click", function(){downvote(dest,up_number,down_number)});;
// }


function upvote(dest,up_number,down_number) {
    url = urlGetter() +"coderooms/" +  dest;
    console.log(url);
    up_number = parseInt(up_number);
    up_number += 1;
    up_number = up_number.toString();
    $.ajax({
        url:url,
        method:"put",
        data:{
            upvote:up_number,
            downvote:down_number
        }
    }).done(function () {
        console.log("you have modified content");
    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    });}
function downvote(dest,up_number,down_number) {
    url = urlGetter() + "coderooms/" + dest;
    console.log(url);
    down_number = parseInt(down_number)
    down_number += 1
    down_number = down_number.toString()
    $.ajax({
        url: url,
        method: "put",
        data: {
            upvote: up_number,
            downvote: down_number
        }
    }).done(function () {
        console.log("you have modified content");
    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    });
}

function urlGetter() {
    const host = window.location.host;
    const path = window.location.pathname;
    return 'http://' + host + path;
}
