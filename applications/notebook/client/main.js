$(document).ready(function() {
	$('.notebook').css({
		"left": '-2000px'
	});
	$('.suggestions').css({
		"right": '-2000px'
	});

	setTimeout(function() {
		$('.notebook').animate({
			"left": '+=2000'
		}, {duration: 750});

		$('.suggestions').animate({
			"right": '+=2000'
		}, {duration: 750});

	}, 500);

	$('#fontSelect').fontSelector({
        'hide_fallbacks' : true,
        'initial' : 'Courier New,Courier New,Courier,monospace',
        'selected' : function(style) { 
        	
        },
        'fonts' : [
            'Arial,Arial,Helvetica,sans-serif',
            'Arial Black,Arial Black,Gadget,sans-serif',
            'Comic Sans MS,Comic Sans MS,cursive',
            'Courier New,Courier New,Courier,monospace',
            'Georgia,Georgia,serif',
            'Impact,Charcoal,sans-serif',
            'Lucida Console,Monaco,monospace',
            'Lucida Sans Unicode,Lucida Grande,sans-serif',
            'Palatino Linotype,Book Antiqua,Palatino,serif',
            'Tahoma,Geneva,sans-serif',
            'Times New Roman,Times,serif',
            'Trebuchet MS,Helvetica,sans-serif',
            'Verdana,Geneva,sans-serif',
            'Gill Sans,Geneva,sans-serif'
            ]
    });

    setPageSize(8.5,11);
    generateRuler(0,8.5,1/8, 1);
    setMargin(1, 1, true);
    setSaveStatus(SAVE_STATUS.UNSAVED);
    loadLocalStorage();

    setInterval(function(){
        saveLocalStorage();
    }, 500);

    setTimeout(function(){
        hideNavBar();
    }, 1500);

    $("nav").mouseleave(function(){
        hideNavBar();
    });

    $("nav").mouseover(function(){
        showNavBar();
    });
});

