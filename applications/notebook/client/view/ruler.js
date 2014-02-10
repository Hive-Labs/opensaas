/*
 * This will generate a ruler into the document with the given
 * start value up to the given end value and every "tickInterval"
 * it will draw a tick and every "displayInterval" it will write
 * the value.
 */
generateRuler = function(start, end, tickInterval, displayInterval) {
    var ruler = $('.ruler');
    var rulerWidth = ruler.outerWidth();
    console.log("OuterWidth:" + rulerWidth);
    var numberOfIntervals = (end - start) / tickInterval;
    var i;
    console.log("Start:" + start + "End:" + end + "Interval:" + tickInterval);
    //Render the lines
    for (i = 0; i < numberOfIntervals; i++) {
        //Check whether to display a number or not in this iteration
        if (i != 0 && i != 1 && (((i + 1) % (displayInterval / tickInterval)) == 0 || ((i) % (displayInterval / tickInterval)) == 0)) {
            if (((i) % (displayInterval / tickInterval)) == 0) {
                jQuery('<div/>', {
                    id: 'rulerSegment' + i + '-' + numberOfIntervals,
                    class: 'tickSegment',
                    css: {
                        width: (rulerWidth * 2 / numberOfIntervals) + 'px',
                        height: '5px',
                        "text-align": "center",
                        float: 'left',
                        "margin-top": "5px",
                        "line-height": "5px",
                        "color": "rgb(116, 112, 112)",
                        "font-size": "10pt",
                        "border-left-width": "1px",
                        "border-left-color": "white",
                        "border-left-style": "solid",
                    }
                }).text((i / numberOfIntervals) * end).appendTo(ruler);
            }
        } else {
            var borderStyle = ((i == 0) ? 'none' : 'solid');

            jQuery('<div/>', {
                id: 'rulerSegment' + i + '-' + numberOfIntervals,
                class: 'tickSegment',
                css: {
                    width: (rulerWidth / numberOfIntervals) + 'px',
                    height: '5px',
                    "margin-top": "5px",
                    float: 'left',
                    "border-left-width": "1px",
                    "border-left-color": "white",
                    "border-left-style": borderStyle,
                }
            }).appendTo(ruler);
        }
    }
}

/*
 * Given a certain number of inches, it will render the margin arrow to that location
 */
setMargin = function(leftInches, rightInches, setEvents, setDraggable) {
    var tickWidth = $('.tickSegment').outerWidth();
    var pageWidth = $('.notebookEditableArea').outerWidth();
    var tickSize = 5;
    var leftTick = $('#rulerMarginLeft');
    var rightTick = $('#rulerMarginRight');

    leftTick.css('left', (leftInches * tickWidth * 8) - 5 + 'px');
    rightTick.css('left', pageWidth - (rightInches * tickWidth * 8) - 5 + 'px');

    $('.notebookEditableArea').css('padding-left', (leftInches * tickWidth * 8));
    $('.notebookEditableArea').css('padding-right', (rightInches * tickWidth * 8));

    $('#rulerMarginDarkAreaLeft').css("width", (leftInches * tickWidth * 8) + "px");
    $('#rulerMarginDarkAreaRight').css("width", (rightInches * tickWidth * 8) + "px");

    if (!setEvents && setDraggable == true) {
        $("#rulerMarginLeft").draggable({
            axis: "x",
            drag: function() {
                $('.notebookEditableArea').css('padding-left', leftTick.position().left + 5 + "px");
                $('#rulerMarginDarkAreaLeft').css("width", leftTick.position().left + 4 + "px");
            },
            stop: function() {
                if (leftTick.position().left > pageWidth / 2) {
                    setMargin(leftInches, rightInches, false, true);
                } else {
                    $('.notebookEditableArea').css('padding-left', leftTick.position().left + 5 + "px");
                    $('#rulerMarginDarkAreaLeft').css("width", leftTick.position().left + 4 + "px");
                }
            },
            containment: ".ruler"
        });

        $("#rulerMarginRight").draggable({
            axis: "x",
            drag: function() {
                $('.notebookEditableArea').css('padding-right', pageWidth - rightTick.position().left + 5 + "px");
                $('#rulerMarginDarkAreaRight').css("width", pageWidth - rightTick.position().left - 3 + "px");
            },
            stop: function() {
                if (rightTick.position().left < pageWidth / 2) {
                    setMargin(leftInches, rightInches, false, true);
                } else {
                    $('.notebookEditableArea').css('padding-right', pageWidth - rightTick.position().left + 5 + "px");
                    $('#rulerMarginDarkAreaRight').css("width", pageWidth - rightTick.position().left - 3 + "px");
                }
            },
            containment: ".ruler"
        });


        $("#rulerMarginRight").draggable({
            axis: "x"
        });
    }

}