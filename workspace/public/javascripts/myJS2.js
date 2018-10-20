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

dbRefUserList.on('child_added', snap => {
    const user_obj = snap.val();
    const avatar   = $("<img>", {alt: user_obj.username, class: "avatar mr-2",id: "user_avatar" + user_obj.id, src:user_obj.avatar});
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

dbRefCommentList.on('child_added', snap => {
    const comment_obj = snap.val();
    let up_number = 0, down_number = 0;
    if (comment_obj.upvote) { up_number = Object.keys(comment_obj.upvote).length; }
    if (comment_obj.downvote) { down_number = Object.keys(comment_obj.downvote).length; }
    let score = up_number - down_number;
    //main comment
    let likeordislike = $("<div class='chat-item-likeordis'>" +
        "<div class='chat-item-like'><i class='up'></i></div>" +
        "<div class='chat-likenum'>" + score + "</div> "+
        "<div class='chat-item-dislike'><i class='down'></i></div></div>");

    let img    = $("<a>", {href: "/profiles/" + comment_obj.author.id})
        .append($("<img>", {alt: comment_obj.author.username, class: "avatar", id: "comment_avatar" + comment_obj.author.id, src:comment_obj.author.avatar}));
    let title = $("<a>", {href: "/profiles/" + comment_obj.author.id})
        .append($("<div>", {class: "chat-item-title"}).append($("<span>", {class:"chat-item-author", 'data-filter-by':"text"}).text(comment_obj.author.username)));
    //TODO link the reply modal with the comment user id.
    let body  = $("<div class='chat-item-body' data-filter='text' onclick=\"replyModal('" + snap.key + "')\"></div>").text(comment_obj.content);
    let item = $("<div>", {class: "media-body"}).append(title, body);
    let main_comment = $("<div>", {class: "chat-item-up"}).append(img, item, likeordislike);
    let add = $("<div>", {id: snap.key, class: "chat-item"}).append(main_comment);
    $("div[id='chat-box']").append(add);

    let up = document.getElementById(snap.key);
    let up_button = up.getElementsByClassName("up");
    up_button[0].addEventListener("click",function (e) { upvote(snap.key)});
    let down = document.getElementById(snap.key);
    let down_button = down.getElementsByClassName("down");
    down_button[0].addEventListener("click",function (e) { downvote(snap.key)});

    //subcomments
    let sub_comments = comment_obj.subComments;
    for (let commentId in sub_comments) {
        let sub_author = sub_comments[commentId].author;
        let sub_comment = sub_comments[commentId].content;
        let sub_upvote = 0, sub_downvote = 0;
        if (sub_comments[commentId].upvote) { upvote = Object.keys(sub_comments[commentId].upvote).length; }
        if (sub_comments[commentId].downvote) { upvote = Object.keys(sub_comments[commentId].downvote).length; }
        let sub_score = sub_upvote - sub_downvote;
        let sub_likeordislike = $("<div class='chat-item-likeordis'>" +
            "<div class='chat-item-like'><i class='up'></i></div>" +
            "<div class='chat-likenum'><p>" + sub_score + "</p></div> "+
            "<div class='chat-item-dislike'><i class='down'></i></div></div>");

        let sub_img    = $("<a>", {href: "/profiles/" + sub_author.id})
            .append($("<img>", {alt: sub_author.username, class: "avatar", id: "comment_avatar" + sub_author.id, src:sub_author.avatar}));
        let sub_title = $("<a>", {href: "/profiles/" + sub_author.id})
            .append($("<div>", {class: "chat-item-title"}).append($("<span>", {class:"chat-item-author", 'data-filter-by':"text"}).text(sub_author.username)));

        let sub_body  = $("<div class='chat-item-body' data-filter='text' onclick=\"replyModal('" + commentId + "')\"></div>").text(sub_comment);
        let sub_item = $("<div>", {class: "media-body"}).append(sub_title, sub_body);
        let sub = $("<div>", {class: "chat-item-up"}).append(sub_img, sub_item, sub_likeordislike);
        let sub_add = $("<div>", {id: commentId, class: "chat-item-subcomment"}).append(sub);
        $("div[id='chat-box']").append(sub_add);

        let sub_up = document.getElementById(commentId);
        let sub_up_button = sub_up.getElementsByClassName("up");
        sub_up_button[0].addEventListener("click",function (e) { sub_upvote(snap.key, commentId)});
        let sub_down = document.getElementById(commentId);
        let sub_down_button = sub_down.getElementsByClassName("down");
        sub_down_button[0].addEventListener("click",function (e) { sub_downvote(snap.key, commentId)});
    }

    //editor marker
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

function sub_upvote(parent, comment) {
    const path = parent + '/subcomments/' + comment;
    upvote(path);
}
function upvote(path) {
    const url = urlGetter() + "/comments/upvote/" + path;
    console.log(url);
    //TODO for adding voting number
    // let id = path.split('/').pop();
    // let number = $('#'+id + ' .chat-likenum').value;
    // console.log(number);
    // console.log("va",number);

    // $.ajax({
    //     url: url,
    //     method:'put',
    // })
    //     .done(function (data) { console.log(data); })
    //     .fail(function (xhr, status){ console.log(xhr.status); })
}

function sub_downvote(parent, comment) {
    const path = parent + '/subcomments/' + comment;
    downvote(path);
}

function downvote(path) {
    const url = urlGetter() + "/comments/downvote/" + path;
    console.log(url);


    $.ajax({
        url: url,
        method:'put',
    })
    .done(function (data) {
        console.log(data);
    })
    .fail(function (xhr, status){ console.log(xhr.status); })
}

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

//leave room
window.onbeforeunload = function (e) {
    const url = urlGetter() + '/users';
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
            content: document.getElementById('chat-message').value
        }
    }).done(function (data) {
        document.getElementById('chat-message').value = null;
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


function modeChange() {
    comment_mode = !comment_mode;
    let marker_list=document.getElementsByClassName("cm-marker");
    let length = marker_list.length;
    let css = null;
    if (comment_mode) {
        css = "background-color : #ff7";
    }
    while(length--) {
        marker_list[length].style.cssText=css;
    }
    hideComments();
}

function hideComments() {
    var cw = $(window).width()-264;
    let comment_btn_text = document.getElementById('comment-btn-text');
    if (!comment_mode) {
        comment_btn_text.innerHTML = 'Show Comments';
        $('#code-content').animate({width:"97%"}, 300);
        $('#chat-content').hide(300);
        if ($('#side-nav').hasClass('pd0')) {
            $("#content").animate({width:cw}, 300);
            $('#side-nav').removeClass("pd0").animate({width:"264px"}, 300);
            $(".side-container").animate({opacity:"1"}, 300);
            $("i.fa-chevron-right").removeClass("fa-chevron-right").addClass("fa-chevron-left");
        }
    } else {
        comment_btn_text.innerHTML = 'Hide Comments';
        $('#code-content').animate({width:"75%"}, 300);
        $('#chat-content').show(300);
        if (!$('#side-nav').hasClass('pd0')) {
            $("#content").animate({width:"100%"}, 300);
            $('#side-nav').addClass("pd0").animate({width:"20px"}, 300);
            $(".side-container").animate({opacity:"0"}, 300);
            $("i.fa-chevron-left").removeClass("fa-chevron-left").addClass("fa-chevron-right");
        }
    }
}

function urlGetter() {
    const host = window.location.host;
    const path = window.location.pathname;
    return 'http://' + host + path;
}

function room_downvote() {
    const url = urlGetter() + "/downvote";
    console.log(url);
    $.ajax({
        url: url,
        method:'put',
    })
        .done(function (data) { console.log(data); })
        .fail(function (xhr, status){ console.log(xhr.status); })
}

function room_upvote() {
    const url = urlGetter() + "/upvote";
    console.log(url);
    $.ajax({
        url: url,
        method:'put',
    })
        .done(function (data) { console.log(data); })
        .fail(function (xhr, status){ console.log(xhr.status); })
}

function replyModal(commentId) {
    $("#reply-modal").on('show.bs.modal', function () {
        $("#reply-btn").on('click', function () {
            let comment = $("#reply-modal .modal-dialog .modal-content .modal-body .modal-replyblock .modal-replyarea").val();
            comment_submit(comment, commentId);
        });
    }).modal('show');
}

function comment_submit(content, path) {
    const url = urlGetter() + "/comments/" + "inside/" + path;
    $.ajax({
        url:url,
        method:"post",
        data:{
            comment: content,
        }
    })
        .done(function () { console.log("Comment reply done."); })
        .fail(function (xhr, status) { console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    })
}