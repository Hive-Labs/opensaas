SAVE_STATUS = {
    SUCCESS: 0,
    FAILED: 1,
    SAVING: 3,
    UNSAVED: 4
};

var currentSaveStatus;
getSaveStatus = function() {
    return currentSaveStatus;
}

setSaveStatus = function(saveStatus) {
    currentSaveStatus = saveStatus;
    if (saveStatus == SAVE_STATUS.SUCCESS) {
        $(".saveStatus").removeClass("btn-default").addClass("btn-success");
        $('.saveStatus span').removeClass("glyphicon-thumbs-down glyphicon-time").addClass("glyphicon-thumbs-up");
        $('#saveStatusText').prop('title', "Last Saved " + (new Date().toLocaleString()));
        $("#saveStatusText").text("Saved!");
    } else if (saveStatus == SAVE_STATUS.FAILED) {
        $(".saveStatus").removeClass("btn-default").addClass("btn-success");
        $('.saveStatus span').removeClass("glyphicon-thumbs-up glyphicon-time").addClass("glyphicon-thumbs-down");
        $("#saveStatusText").text("failed to save!");
    } else if (saveStatus == SAVE_STATUS.SAVING) {
        $(".saveStatus").removeClass("btn-default").addClass("btn-success");
        $('.saveStatus span').removeClass("glyphicon-thumbs-up glyphicon-thumbs-down").addClass("glyphicon-time");
        //  $("#saveStatusText").text("saving");
    } else if (saveStatus == SAVE_STATUS.UNSAVED) {
        $(".saveStatus").removeClass("btn-success").addClass("btn-default");
        $('.saveStatus span').removeClass("glyphicon-thumbs-up glyphicon-thumbs-down").addClass("glyphicon-time");
        $("#saveStatusText").text("unsaved");
    }
};