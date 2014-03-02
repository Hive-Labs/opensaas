getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

replaceURLWithHTMLLinks = function(text) {
    // Test this insane regex at debuggex.com
    var regex_url = /(>)?(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)(\?*[a-zA-Z\.\=]*)?(<div|<p|<\/div|<\/p|<br|<\/br)/;
    return text.replace(regex_url, "$1<a href='$2$3.$4$5$6'>$3.$4</a>$7");
}

/*
    In a youtube link like www.youtube.com/watch?v=uaHGjlERVCg
    it will find the uaHGjlERVChg part and return it. Otherwise null.
*/
findYoutubeLinks = function(text) {
    var regex_youtube = /(>)?(https?:\/\/)?([\da-z\.-]+)\.(youtube)([\/\w \.-]*)(\?v=[\da-zA-Z\.\=]*)(<div|<p|<\/div|<\/p|<br|<\/br)/;
    var youtubeMatches = text.match(regex_youtube);
    if (youtubeMatches != null && youtubeMatches.length > 0) {
        return youtubeMatches[6].substring(3);
    } else
        return null;
}