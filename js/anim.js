$(document).ready(function(){
    // $('#feed-item').click(function() {
    //     console.log("FUCK");
    //     var agg = $(this);

    //     $('html, body').animate({
    //                     scrollTop: agg.offset().top
    //                 }, 2000);
    // });
    // $("[name='autoscroll']").bootstrapSwitch();
    
    $(window).scroll(function(){
        while( $('.enlarge-wrapper').height() > (0.85 * $(window).height())) {
            $('#big-text').css('font-size', (parseInt($('#big-text').css('font-size')) - 3) + "px" );
        }
        while( $('.enlarge-wrapper').height() < (0.4 * $(window).height()) && $('.enlarge-wrapper').height() > (0.05 * $(window).height() )) {
            $('#big-text').css('font-size', (parseInt($('#big-text').css('font-size')) + 3) + "px" );
        }
        var right = $(window).width()/3;
        var block = $('.enlarge-wrapper').width();
        right = right - block/2;
        var ew = '' + right + 'px';
        if ($(window).width() > 992) {
            $('.enlarge-wrapper').css({
                'position' : 'fixed',
                'right' : ew,
                'top' : '52%',
                'margin-left' : -$('.enlarge-wrapper').outerWidth()/2,
                'margin-top' : -$('.enlarge-wrapper').outerHeight()/2 + 15
            });
        }
        else {
            $('.enlarge-wrapper').css({
                'position' : 'fixed',
                'right' : '5%',
                'top' : '52%',
                'margin-left' : -$('.enlarge-wrapper').outerWidth()/2,
                'margin-top' : -$('.enlarge-wrapper').outerHeight()/2 + 15

            });
        }
    });

    var arrowTop = $("body > div > div > i")[0].getBoundingClientRect().top;
    var arrowBottom = $("body > div > div > i")[0].getBoundingClientRect().bottom;

    var arrowMidPoint = arrowTop + ((arrowBottom - arrowTop) / 2);

    setInterval(
     function(){   
        // alert("hi");
        if ($(".scroll-check:checked").length > 0 && $(window).width() > 992) {
            var offset = $(".active").next().offset();

            offset.top -= arrowMidPoint - ($(".active").next().height() / 2);

            $('html, body').animate({
                scrollTop: offset.top,
            });
        }
     },
     10000  /* 10000 ms = 10 sec */
    );
});
