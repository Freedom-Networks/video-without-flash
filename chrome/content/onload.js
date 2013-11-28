function pageLoad(event) {
    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    var activate_onload = prefManager.getBoolPref("extensions.vwof.activate_onload");
    
    if (activate_onload && event.originalTarget instanceof HTMLDocument){
	var cw = event.originalTarget.defaultView;
	vwofChrome.BrowserOverlay.openVideo(cw);
    }
}

window.addEventListener("DOMContentLoaded", function () {
    gBrowser.addEventListener("load", pageLoad, true);
}, false);

// When no longer needed
gBrowser.removeEventListener("load", pageLoad, true);
