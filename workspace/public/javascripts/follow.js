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
        .done(function (data) { console.log(data.msg); })
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
        .done(function (data) { console.log(data.msg); })
        .fail(function (xhr, status) { console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg); })
}