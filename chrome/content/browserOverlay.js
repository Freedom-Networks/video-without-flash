 if("undefined" == typeof(vwofChrome)){
    var vwofChrome = {};
}
vwofChrome.BrowserOverlay = {
    parsers:{},   //hash of the parsers (loaded from jsm modules)

    /**
       function called at startup
    */
    startup:function() {
	this.load_modules();
    },

    /**
       Load modules listed in the extensions.vwof.modules pref variable to this.parsers hash
    */
    load_modules:function(){
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var modules_list = prefManager.getCharPref("extensions.vwof.modules");
	var modules = JSON.parse(modules_list);

	var key_parser;	
	for(key_parser in modules){
	    if(modules[key_parser] == 1){
		let context = {};
		Services.scriptloader.loadSubScript('resource://vwof/'+key_parser+'.jsm', context, "UTF-8");
		this.parsers[key_parser] = Object.create(context);
	    }
	}
    },

    reload_modules:function(){
	this.parsers = {};
	this.load_modules();
    },
    
    /**
       call every parse function from loaded parsers
    */
    getVideoInfo:function (cw) {
	var video_info = [];	// array of video_data
	
	var key_parser;
	for(key_parser in this.parsers){
  	    try{
		var video_data = [];
		video_data = this.parsers[key_parser].parser.parse(cw);

		//if there is at least a video url retreived from the parser
		if(video_data.length >= 1){
		    
		    //set the source (name of the parser)
		    for(var i=0;i < video_data.length;i++){
			video_data[i]['source'] = key_parser;
		    }
		    
		    video_info = video_info.concat(video_data);    //concat the chunks of video(s) from this parser
		}
	    }
	    catch(err){
		console.error("vwof plugin, exception in parser "+key_parser+": "+err);
	    };
	}

	return video_info;
    },

    /**
       get the video source and add a link in the document 
    */
    openVideo:function(cw) {

	//check if the content window is defined
	if (!cw || cw.frameElement || !cw.document){
	    return;
	}

	var video_info = this.getVideoInfo(cw);
	var doc = cw.document;

	for (var i = 0; i < video_info.length; i++) {
	    if(video_info[i]['player']){
    		var replace_location = video_info[i]['player'];
		var player = vwofPlayer.create_player(video_info[i], cw);
		var replace_parent = replace_location.parentNode;
		replace_parent.replaceChild(player, replace_location);
	    }
	    else{
		var j = vwofPlayer.find_prefered_video(video_info[i].videos);
		gBrowser.selectedTab = gBrowser.addTab(video_info[i].videos[j].url);
	    }
	}
    },

    /**
       utility function needed by some parser to get the video source
    */
    get:function(uri){
	const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1",
						      "nsIXMLHttpRequest",
						      "open");
	
	let xmlhttp = XMLHttpRequest("GET", uri, false);
	xmlhttp.send();
	return xmlhttp.responseText;
    },

    /**
       utility function that converts url vars into a js associative array
    */
    url_vars_to_array: function(url){
	var arr_variable = url.split('&');
	var arr_assoc = {};
	var i;
	
	for(i=0;i<arr_variable.length;i++){
	    var arr_tmp = arr_variable[i].split('=');
	    arr_assoc[arr_tmp[0]] = arr_tmp[1];
	}
	return arr_assoc;
    }
};

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
