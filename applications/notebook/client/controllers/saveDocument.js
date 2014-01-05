saveLocalStorage = function(){
  //Make sure local storage is enabled
	if(typeof(Storage)!=="undefined")
  	{
      //if there is a document already there
      if(localStorage.lastDocument && IsJsonString(localStorage.lastDocument)){
        var markup = $(".notebookEditableArea").html();
        var newDocument = {};
        newDocument.timestamp = new Date();
        newDocument.markup = markup;
        newDocument.title = $('.notebookTitle').val();
        //check to see if we really need to save
        var docNeedsSave = needsSave(JSON.parse(localStorage.lastDocument), newDocument);
        if(docNeedsSave == true){
          setSaveStatus(SAVE_STATUS.SAVING);
          localStorage.lastDocument = JSON.stringify(newDocument);  
          setSaveStatus(SAVE_STATUS.SUCCESS);
        }
      }
      else{
        var markup = $(".notebookEditableArea").html();
        if(markup != ""){
          setSaveStatus(SAVE_STATUS.SAVING);
          var newDocument = {};
          newDocument.timestamp = new Date();
          newDocument.markup = markup;
          newDocument.title = $('.notebookTitle').val();
          localStorage.lastDocument = JSON.stringify(newDocument);
          setSaveStatus(SAVE_STATUS.SUCCESS);
        }
      }
  		
  	}
}

saveRemoteStorage = function(){
  
}

loadLocalStorage = function(){
	if(typeof(Storage)!=="undefined")
  	{
      console.log("loading.");
  		var lastDocument = localStorage.lastDocument;
  		if(lastDocument && IsJsonString(lastDocument)){
        var jsonDoc = JSON.parse(lastDocument);
  			$(".notebookEditableArea").html(jsonDoc.markup);	
        $('.notebookTitle').val(jsonDoc.title);
  		}
  	}
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function needsSave(oldDocument, newDocument){
  if(oldDocument.markup != newDocument.markup || oldDocument.title != newDocument.title){
    return true;
  }
  else{
    return false;
  }
}