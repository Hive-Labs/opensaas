setPageSize = function(width, height){
	$('.notebookTextArea').width($('.notebookTextArea').outerWidth() - $('.notebookTextArea').outerWidth() % (width * 8));
	$('.notebookTextArea').css("width", $('.notebookTextArea').css("width") - $('.notebookTextArea').css("width") % (width * 8));
	var pageHeight = height * $(".notebookTextArea").outerWidth() / width;
	$(".notebookTextArea").height(pageHeight);
	$(".suggestions").height(pageHeight);
	$(".notebook").css("padding-right", ($(".notebook").outerWidth() - $('.notebookTextArea').outerWidth()) + "px");
}

