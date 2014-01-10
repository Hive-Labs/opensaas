hideNavBar = function() {
    console.log("hide!");
    if ($("nav").outerHeight() > 5) {
        $("nav").animate({
            height: '5px',
            width: '50px'
        }, 600);
    }
};

showNavBar = function() {
    console.log("show!");
    if ($("nav").outerHeight() < 50) {
        $("nav").animate({
            height: '50px',
            width: '100%'
        }, 600);
        //	setTimeout(hideNavBar,15000);
    }
};