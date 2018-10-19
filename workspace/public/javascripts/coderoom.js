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
                    
                    //判断拖动的第几个按钮
                    if (index == 0) {
                        //第一个拖动按钮左边不出界
                        if (clickY > topOffset) {
                            dragBtn.css('top', clickY - 7 - topOffset + 'px');
                            //按钮移动
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
                e.cancelBubble = true; //禁止事件冒泡
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
});

$("#like-dislike").on('click', function(e){
	var $this = $(this);
    if ($this.hasClass("like")){
		$this.removeClass("like");
		$this.addClass("dislike");
	}else{
		$this.addClass("like");
		$this.removeClass("dislike");
	}		
}); 
