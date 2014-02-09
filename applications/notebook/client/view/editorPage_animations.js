setPageSize = function(width, height) {
    $('.notebookTextArea').width($('.notebookTextArea').outerWidth() - $('.notebookTextArea').outerWidth() % (width * 8));
    $('.notebookTextArea').css("width", $('.notebookTextArea').css("width") - $('.notebookTextArea').css("width") % (width * 8));
    var pageHeight = height * $(".notebookTextArea").outerWidth() / width;
    $(".notebookTextArea").height(pageHeight);
    $(".suggestions").height(pageHeight);
    $(".notebook").css("padding-right", ($(".notebook").outerWidth() - $('.notebookTextArea').outerWidth()) + "px");
};

animateNotebookLeftToRight = function() {
    $('.notebook').animate({
        "left": '+=2000'
    }, {
        duration: 750
    });
};

animateSuggestionsRightToLeft = function() {
    $('.suggestions').animate({
        "right": '+=2000'
    }, {
        duration: 750
    });
};

hideNavBar = function() {
    if ($("nav").outerHeight() > 5) {
        $("nav").animate({
            height: '5px',
            width: '50px'
        }, 600);
    }
};

showNavBar = function() {
    if ($("nav").outerHeight() < 50) {
        $("nav").animate({
            height: '50px',
            width: '100%'
        }, 600);
    }
};