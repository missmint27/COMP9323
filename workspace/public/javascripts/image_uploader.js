//need this: <script src="https://unpkg.com/axios/dist/axios.min.js"></script> and jquery
var CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/db1kyoeue/image/upload';
var CLOUDINARY_UPLOAD_PRESET = 'zdcuntzg';
var fileUpload = document.getElementById('1');

fileUpload.addEventListener('change', function(event) {
    let file = event.target.files[0];
    let formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    axios({
        url: CLOUDINARY_URL,
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: formData,
    }).then(function (res) {
        console.log(res.data.url);
        postImageUrl(res.data.url);
    }).catch(function (err) {
        console.error(err);
    });
});

function postImageUrl(imgUrl) {
    const host = window.location.host;
    const path = window.location.pathname;
    const url  = 'http://' + host + path + '/avatar';
    // const url = 'http://127.0.0.1:3000/api/coderooms/' + roomId + '/comments';
    console.log(url);
    $.ajax({
        url: url,
        method: 'put',
        dataType: 'json',
        data: {
            url: imgUrl
        }
    }).done(function (data) {
        console.log(data);
    }).fail(function (xhr, status) {
        console.log('Fail: ' + xhr.status + ', msg: ' + xhr.responseJSON.msg);
    });
}