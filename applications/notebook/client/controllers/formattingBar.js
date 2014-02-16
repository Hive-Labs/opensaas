/*
    This function will load the formatting bar.
*/
loadFormattingBar = function() {
    //  Fill the dropdown with all the font sizes and styles
    populateFontSizes();
    populateFontStyles();

    //  When user chooses a new fontsize, change it
    $(".fontPanelFontSizeSelect").change(function() {
        var rte = $('.notebookEditableArea');
        rte.focus();
        var randomCssClass = "rangyTemp_" + (+new Date());
        var classApplier = rangy.createCssClassApplier(randomCssClass, true);
        classApplier.applyToSelection();
        $("." + randomCssClass).css({
            "font-size": $(".fontPanelFontSizeSelect").val() + "pt",
            "line-height": $(".fontPanelFontSizeSelect").val() + "pt"
        }).removeClass(randomCssClass);
    });

    //  Bind all the events to the buttons
    $('.btnPaste').click(function() {
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Paste', false, null);
    });

    $('.btnCut').click(function() {
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Cut', false, null);
    });

    $('.btnCopy').click(function() {
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Copy', false, null);
    });

    $('.btnFormat').click(function() {
        var rte = $('.notebookEditableArea');
        //rte.focus();
        document.execCommand('formatBlock', false, null);
    });

    $('.btnBold').click(function() {
        $('.btnBold').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Bold', false, null);
    });

    $('.btnItalic').click(function() {
        $('.btnItalic').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Italic', false, null);
    });

    $('.btnUnderline').click(function() {
        $('.btnUnderline').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Underline', false, null);
    });

    $('.btnStrikethrough').click(function() {
        $('.btnStrikethrough').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Strikethrough', false, null);
    });

    $('.btnSubscript').click(function() {
        $('.btnSubscript').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Subscript', false, null);
    });

    $('.btnSuperscript').click(function() {
        $('.btnSuperscript').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('Superscript', false, null);
    });

    $('.btnBullet').click(function() {
        $('.btnBullet').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('insertUnorderedList', false, null);
    });

    $('.btnNumber').click(function() {
        $('.btnNumber').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('insertorderedList', false, null);
    });

    $('.btnJustifyLeft').click(function() {
        $('.btnJustifyLeft').button('toggle');
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('justifyLeft', false, null);
    });

    $('.btnJustifyCenter').click(function() {
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('justifyCenter', false, null);
        document.onselectionchange();
    });

    $('.btnJustifyRight').click(function() {
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('justifyRight', false, null);
        document.onselectionchange();
    });

    $('.btnJustifyFull').click(function() {
        var rte = $('.notebookEditableArea');
        rte.focus();
        document.execCommand('justifyFull', false, null);
        document.onselectionchange();
    });


    document.onselectionchange = function() {
        var isBold = document.queryCommandState("Bold");
        var isItalic = document.queryCommandState("Italic");
        var isUnderline = document.queryCommandState("Underline");
        var isStrikethrough = document.queryCommandState("Strikethrough");
        var isSubscript = document.queryCommandState("Subscript");
        var isSuperscript = document.queryCommandState("Superscript");
        var isBullet = document.queryCommandState("insertUnorderedList");
        var isNumberedList = document.queryCommandState("insertorderedList");
        var isJustifyLeft = document.queryCommandState("justifyLeft");
        var isJustifyCenter = document.queryCommandState("justifyCenter");
        var isJustifyRight = document.queryCommandState("justifyRight");
        var isJustifyFull = document.queryCommandState("justifyFull");

        if (isBold)
            $('.btnBold').addClass("active");
        else
            $('.btnBold').removeClass("active");

        if (isItalic)
            $('.btnItalic').addClass("active");
        else
            $('.btnItalic').removeClass("active");

        if (isUnderline)
            $('.btnUnderline').addClass("active");
        else
            $('.btnUnderline').removeClass("active");

        if (isStrikethrough)
            $('.btnStrikethrough').addClass("active");
        else
            $('.btnStrikethrough').removeClass("active");

        if (isSubscript)
            $('.btnSubscript').addClass("active");
        else
            $('.btnSubscript').removeClass("active");

        if (isSuperscript)
            $('.btnSuperscript').addClass("active");
        else
            $('.btnSuperscript').removeClass("active");

        if (isBullet)
            $('.btnBullet').addClass("active");
        else
            $('.btnBullet').removeClass("active");

        if (isNumberedList)
            $('.btnNumber').addClass("active");
        else
            $('.btnNumber').removeClass("active");

        if (isJustifyLeft) {
            $('.btnJustifyLeft').addClass("active");
            $('.btnJustifyRight').removeClass("active");
            $('.btnJustifyCenter').removeClass("active");
            $('.btnJustifyFull').removeClass("active");
        } else
            $('.btnJustifyLeft').removeClass("active");



        if (isJustifyCenter) {
            $('.btnJustifyCenter').addClass("active");
            $('.btnJustifyRight').removeClass("active");
            $('.btnJustifyLeft').removeClass("active");
            $('.btnJustifyFull').removeClass("active");
        } else
            $('.btnJustifyCenter').removeClass("active");

        if (isJustifyRight) {
            $('.btnJustifyRight').addClass("active");
            $('.btnJustifyCenter').removeClass("active");
            $('.btnJustifyLeft').removeClass("active");
            $('.btnJustifyFull').removeClass("active");
        } else
            $('.btnJustifyRight').removeClass("active");

        if (isJustifyFull) {
            $('.btnJustifyFull').addClass("active");
            $('.btnJustifyCenter').removeClass("active");
            $('.btnJustifyLeft').removeClass("active");
            $('.btnJustifyRight').removeClass("active");
        } else
            $('.btnJustifyFull').removeClass("active");
    };
};

function populateFontSizes() {
    for (var i = 1; i <= 100; i++) {
        $(".fontPanelFontSizeSelect").append($("<option></option>")
            .attr("value", i)
            .text(i));
    }
    $(".fontPanelFontSizeSelect").val('10');
}

function populateFontStyles() {
    $('#fontSelect').fontSelector({
        'hide_fallbacks': true,
        'initial': 'Courier New,Courier New,Courier,monospace',
        'selected': function(style) {
            /*var rte = $('.notebookEditableArea');
            rte.focus();
            document.execCommand("fontName", false, style);*/
        },
        'fonts': [
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
}