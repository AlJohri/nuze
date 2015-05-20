$(document).ready(function(){
    // $('#feed-item').click(function() {
    //     console.log("FUCK");
    //     var agg = $(this);

    //     $('html, body').animate({
    //                     scrollTop: agg.offset().top
    //                 }, 2000);
    // });
    $(window).scroll(function(){
       $('.date').each(function() {
     var text = $(this).text();
        text = (text.length > 23) ? text.slice(0,-23) : text;
        // important to check whether the text is longer than 20 characters
        $(this).text(text);  // update the text
    });
        // while( $('.enlarge-wrapper').height() > (0.80 * $(window).height())) {
        //     $('#big-text').css('font-size', (parseInt($('#big-text').css('font-size')) - 1) + "px" );
        // }
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
                'margin-top' : -$('.enlarge-wrapper').outerHeight()/2
            });
        }
        else {
            $('.enlarge-wrapper').css({
                'position' : 'fixed',
                'right' : '5%',
                'top' : '52%',
                'margin-left' : -$('.enlarge-wrapper').outerWidth()/2,
                'margin-top' : -$('.enlarge-wrapper').outerHeight()/2

            });
        }
    });
});
