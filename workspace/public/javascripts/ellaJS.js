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


//click add comment button to show a block to add comment
function addComments() {
    var comment_block = document.getElementById("comment_block");
    if (comment_block.style.display === "") {
        comment_block.style.display = "none";
    } else {
        comment_block.style.display = "";
    }
}






