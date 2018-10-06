/*setting get avatar*/
$(document).ready(function () {


    var readURL = function (input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('.avatar').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }


    $(".file-upload").on('change', function () {
        readURL(this);
    });
});
/*This part is for search bar*/
function searchBar() {
    var x = document.getElementById("hidDiv");
    var y = document.getElementById("hidAdv");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        y.style.display = "none";
        x.style.display = "none";
    }
}

function advSearch() {
    var x = document.getElementById("hidAdv");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
<!--点击换成SHOW COMMENTS-->
function hideComments() {
    var button = document.getElementById("comments-btn");
    var review = document.getElementById("comments");
    if (review.style.display === "") {
        review.style.display = "none";
        button.innerHTML = "SHOW COMMENTS";
    } else {
        review.style.display = "";
        button.innerHTML = "HIDE COMMENTS";
    }
}

//click add comment button to show a block to add comment
function addComments() {
    var comment_block = document.getElementById("comment_block");
    if (comment_block.style.display === "") {
        comment_block.style.display = "none";
    } else {
        comment_block.style.display = "";
    }
}
function showParticipants() {
    var comment_block = document.getElementById("participants_block");
    if (comment_block.style.display === "") {
        comment_block.style.display = "none";
    } else {
        comment_block.style.display = "";
    }
}

/*drag and get word*/
/*select(document, tanchu);
function select(o, fn){
    o.onmouseup = function(e){
        var event = window.event || e;
        var target = event.srcElement ? event.srcElement : event.target;
        if (/input|textarea/i.test(target.tagName) && /firefox/i.test(navigator.userAgent)) {
            //Firefox choose in textarea
            var staIndex=target.selectionStart;
            var endIndex=target.selectionEnd;
            if(staIndex!=endIndex){
                var sText=target.value.substring(staIndex,endIndex);
                fn(sText,target);
            }
        }
        else{
            //get choosen
            var sText = document.selection == undefined ? document.getSelection().toString():document.selection.createRange().text;
            if (sText != "") {
                //return parameters into fn
                fn(sText, target);
            }
        }
    }
}
function tanchu(txt,tar){
    alert("This is belong to"+tar.tagName+"elements，choose："+txt);
}*/



