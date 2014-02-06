/**
   utility function needed by some parser to get the video source
*/

vwofChrome.utils = {
    
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
