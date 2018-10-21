function follow(user) {
    let follow_btn = $('#follow-btn');
    follow_btn.removeClass('follow-ing');
    follow_btn.attr("onclick","unfollow('" + user + "')");

    const host = window.location.host;
    const url = 'http://' + host + '/users/' + user + '/follow';
    $.ajax({
        url:url,
        method:"put",
    })
        .done(function (data) {
            $("#follower-list")
                .append($("<a>", {href: "/profiles/" + data.me.id, id: "follower"+data.me.id})
                    .append($("<img>", {src: data.me.avatar, class:"profile-ava-li", alt:data.me.username, style:"width:50px;height:50px;"})))
        })
        .fail(function (xhr, status) { console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg); })
}

function unfollow(user) {
    let follow_btn = $('#follow-btn');
    follow_btn.addClass('follow-ing');
    follow_btn.attr("onclick","follow('" + user + "')");

    const host = window.location.host;
    const url = 'http://' + host + '/users/' + user + '/follow';
    $.ajax({
        url:url,
        method:"delete",
    })
        .done(function (data) { $("#follower"+data.me.id).remove(); })
        .fail(function (xhr, status) { console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg); })
}