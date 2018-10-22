$(function() {
    var DragChangeSize = {
        init: function() {
            var clickX, leftOffset, inxdex, nextW2, nextW;
            dragging = false;
            doc = document;
            dragBtn = $(".dragbox").find('label');
            wrapHeight = $(".dragbox").height();

            this.mousedown();
            this.onmousemove();
            this.mouseup();
        },
        mousedown: function() {
            var _this = this;
            dragBtn.mousedown(function(event) {
                dragging = true;
                topOffset = $(".dragbox").offset().top;
                index = $(this).index('label');
                console.log(this,topOffset, index);
            });
        },
        onmousemove: function() {
            $(doc).mousemove(function(e) {
                if (dragging) {
                    clickY = e.pageY;
                    
                    if (index == 0) {
                        if (clickY > topOffset) {
                            dragBtn.css('top', clickY - 7 - topOffset + 'px');
                           
                            dragBtn.prev().height(clickY - topOffset + 'px');
                            nextW2 = clickY - topOffset;
                            dragBtn.next().height(wrapHeight - nextW2);
                        } else {
                            dragBtn.css('top', '0px');
                        }
                    }
                    
                    if (clickY > (topOffset + wrapHeight - 50)) {
                        
                        dragBtn.css('top', parseFloat((wrapHeight - 11) + 'px'));
                        
                        dragBtn.prev().height(topOffset + wrapHeight - 125 + 'px');
                        console.log(clickY, wrapHeight, topOffset, dragBtn.prev().height());
                        dragBtn.next().height(topOffset + wrapHeight - dragBtn.prev().height() - 66 + 'px');
                    }
                }
            });

        },
        mouseup: function() {
            $(doc).mouseup(function(e) {
                dragging = false;
                e.cancelBubble = true; 
            })
        }
    };
    DragChangeSize.init();
})

$( document ).ready(function() {
//     // // comment-hide show
//     // $("#comment-btn").click(function(){
//     //     if ($("#chat-content").css("display")!="none"){
//     //         $("#code-content").css("width","100%");
//     //         $("#chat-content").css("display","none");
//     //         console.log("yes");
//     //     } else {
//     //         $("#chat-content").css("display","block");
//     //         $("#code-content").css("width","75%");
//     //         console.log("no");
//     //     }
//     // });
    //chat submit
    $("#chat-submit").click(function(){
        var text = $("textarea#chat-message").val();
    });
//
//
    $('.side-hide').click(function(){
        const cw = $(window).width() - 264;
        if ($('#side-nav').hasClass('pd0')) {
            $('#side-nav').removeClass("pd0").animate({width:"264px"}, 300);
            $(".side-container").animate({opacity:"1"}, 300);
            $("i.fa-chevron-right").removeClass("fa-chevron-right").addClass("fa-chevron-left");
            $("#content").animate({width:cw}, 300);
        } else {
        $('#side-nav').addClass("pd0").animate({width:"20px"}, 300);
        $(".side-container").animate({opacity:"0"}, 300);
        $("i.fa-chevron-left").removeClass("fa-chevron-left").addClass("fa-chevron-right");
        $("#content").animate({width:"100%"}, 300);
        };
    });
});

$(".btn-like").on('click', function(e){
	var $this = $(this);
    if ($this.hasClass("thumbs-up")){
		$this.removeClass("thumbs-up");
	}else{
        $this.addClass("thumbs-up");
        $(".btn-like").not(this).removeClass("thumbs-up");
	}		
}); 
