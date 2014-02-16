setPageSize = function(width, height) {
    //  We need to add 10 px to accomodate for scrollbar
    $('.notebookTextArea').width($('.notebookTextArea').outerWidth() - $('.notebookTextArea').outerWidth() % (width * 8) + 10);
    $('.notebookTextArea').css("width", $('.notebookTextArea').css("width") - $('.notebookTextArea').css("width") % (width * 8));
    $('.ruler').css("width", $('.notebookTextArea').outerWidth() - $('.notebookTextArea').outerWidth() % (width * 8) + "px");
    var pageHeight = height * $(".notebookTextArea").outerWidth() / width;
    $(".notebookEditableArea").height(pageHeight);
    $(".notebook").css("padding-right", ($(".notebook").outerWidth() - $('.notebookTextArea').outerWidth()) + "px");
    $(".saveStatus").css("margin-right", ($(".notebook").outerWidth() - $('.notebookTextArea').outerWidth()) + "px");
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
        $(".innerFragmentClass").animate({
            marginTop: '-25px', //5 + 20 for the footer
            paddingTop: '25px'
        }, 600);
        $(".rightTabs").animate({
            paddingTop: '5px',
            marginTop: '5px'
        }, 600);

    }
};

showNavBar = function() {
    if ($("nav").outerHeight() < 50) {
        $("nav").animate({
            height: '50px',
            width: '100%'
        }, 600);
        $(".innerFragmentClass").animate({
            marginTop: '-70px', //50 + 20 for the footer
            paddingTop: '70px'
        }, 600);
        $(".rightTabs").animate({
            paddingTop: '20px',
            marginTop: '50px',
        }, 600);
    }
};