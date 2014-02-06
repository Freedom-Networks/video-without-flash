function pageLoad(event) {
    var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    var activate_onload = prefManager.getBoolPref("extensions.vwof.activate_onload");
    
    if (activate_onload
	&& event.originalTarget instanceof HTMLDocument
       ){
	var cw = event.originalTarget.defaultView;
	vwofChrome.BrowserOverlay.detectVideo(cw);
    }
}

window.addEventListener("DOMContentLoaded", function () {
    gBrowser.addEventListener("load", pageLoad, true);
}, false);

// When no longer needed
gBrowser.removeEventListener("load", pageLoad, true);



/**
   Listeners

   initialize the application on startup
*/
window.addEventListener("load", function() { vwofChrome.BrowserOverlay.startup(); }, false);

/**
   Listener that observe the prefs variables

   If the module list changes (new module, module deactivated/activated), the parser list is reloaded
*/
var myPrefObserver = {
    register: function() {
	// First we'll need the preference services to look for preferences.
	var prefService = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService);

	// For this.branch we ask for the preferences
	this.branch = prefService.getBranch("extensions.vwof.");

	// Finally add the observer.
	this.branch.addObserver("", this, false);
    },

    unregister: function() {
	this.branch.removeObserver("", this);
    },

    observe: function(aSubject, aTopic, aData) {
	switch (aData) {
	case "modules":
	    vwofChrome.BrowserOverlay.reload_modules();
	    break;
	}
    }
}
myPrefObserver.register();
