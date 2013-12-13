if ("undefined" == typeof(vwofPlayer)) {
    var vwofPlayer = {};
};

/**
   The player is a direct link to a detected video source
   It is composed of a thumbnail if the video_info provide one
   and in case of several video type / format a combobox

   == video_player variable ==

   video player is an array of an hash

   each video is an entry in the array and the hash contains video information
   
   video_info
   [
   {
   'player':,              DOM where the video player will be embed, replacing all child nodes
   if undefined, the video open in a new tab
   
   'video_img':,           string link to the picture displayed as a preview
   if undefined the background is black
   
   'videos': []            array of video informations, see below
   }
   ]


   If the videos array contains more than one element a combo box (select tag)
   will be added in the player displaying the format and quality



   videos
   [
   {
   'quality':,              quality of the video (low, medium, hd720, hd1080)
   
   'format':,               format of the video (webm, mp4, flv, ...)
   
   'url':                   direct link to the video
   this is the only mandatory variable
   }
   ]

*/
vwofPlayer = {
    /**
       add the player stylecheet link to the head of the document
    */
    
    add_style:function(doc, style_id){
	var style = doc.createElement('link');
	style.setAttribute('type', 'text/css');
	style.setAttribute('rel', 'stylesheet');
	style.setAttribute('href', 'chrome://vwof/content/player.css');
	style.setAttribute('id', style_id);
	doc.head.appendChild(style);
    },
    
    /**
       Create the html code to embed in the document
    */
    create_player:function(video_info, cw){
	//set the player size depending on the location where embed it
	var cstyle = cw.getComputedStyle(video_info['player']);
	var doc = cw.document;
	var h = cstyle.getPropertyValue("height");
	var w = cstyle.getPropertyValue("width");
        var player_style = 'min-width:'+w+';min-height:'+h+';';
	var player_id = 'vwof_' + Math.floor((Math.random() * 99));

	//add the player css if necessary
	const style_id = 'vowf_player_style';
	if(!doc.getElementById(style_id)){
	    this.add_style(doc, style_id);
	}
	
	//Create the 'player' (div that call the frame with the video as src when clicked)
	var player_onclick = "e=document.getElementById('vwof_select_video_"+player_id+"');var i = document.createElement('iframe');i.setAttribute('class', 'vwof_frame');i.setAttribute('src', e.options[e.selectedIndex].value);i.setAttribute('style', '"+player_style+"');var p = this.parentNode;p.replaceChild(i, this);";
	var player = doc.createElement('div');
	player.setAttribute('class', 'vwof_player');
	if(!player.id)player.setAttribute('id', player_id);  //indentify the div player if the original tag did not have one 
	player.setAttribute('onclick', player_onclick);

	//thumbnail
	if(img = video_info['video_img']){
	    player_style += 'background-image:url('+img+');';
	}

	//vwof icon
	var node_image = doc.createElement('img');
	node_image.setAttribute('src', 'chrome://vwof/skin/video-icon.png');
	player.appendChild(node_image);

	//select video format and quality
	var prefered_index = this.find_prefered_video(video_info.videos);
	
	var node_select = doc.createElement('select');
	node_select.setAttribute('id', 'vwof_select_video_'+ player_id);
	node_select.setAttribute('class', 'vwof_video_info');
	node_select.setAttribute('onclick', "event.stopPropagation();");
	node_select.setAttribute('onchange', 'document.getElementById(\'vwof_link_new_tab_'+player_id+'\').href=this.options[this.selectedIndex].value');
	var i;
	for(i=0;i<video_info.videos.length;i++){
	    var node_option = doc.createElement('option');
	    node_option.setAttribute('value', video_info.videos[i].url);
	    
	    var format = video_info.videos[i].format ? video_info.videos[i].format : '';
	    var quality = video_info.videos[i].quality ? video_info.videos[i].quality : '';
	    var node_option_content = doc.createTextNode(format + ' ' + quality);

	    if(i == prefered_index){
		node_option.setAttribute('selected', 'true');
	    }
	    
	    node_option.appendChild(node_option_content);
	    node_select.appendChild(node_option);
	}

	//if the number of video found for this player is only one, no not display the select and append a simple text
	if(video_info.videos.length == 1){
	    node_select.setAttribute('style', 'display:none;');
	    
	    var node_span = doc.createElement('span');
	    node_span.setAttribute('class', 'vwof_video_info');
	    var format = video_info.videos[0].format ? video_info.videos[0].format : '';
	    var quality = video_info.videos[0].quality ? video_info.videos[0].quality : '';
	    var node_info = doc.createTextNode(format + ' ' + quality);
	    
	    node_span.appendChild(node_info);
	    player.appendChild(node_span);
	}
	player.appendChild(node_select);
	
	//open in a new tab link
	var node_link_new_tab = doc.createElement('a');
	node_link_new_tab.setAttribute('id', 'vwof_link_new_tab_'+player_id);
	node_link_new_tab.setAttribute('onclick', 'event.stopPropagation();');
	node_link_new_tab.setAttribute('href', video_info.videos[0].url);
	node_link_new_tab.setAttribute('target', '_blank');
	var a_content_new_tab = doc.createTextNode('Open in a new tab');
	node_link_new_tab.appendChild(a_content_new_tab);
	player.appendChild(node_link_new_tab);

	//display media source
	if(video_info['source']){
	    var node_span = doc.createElement('span');
	    var node_source = doc.createTextNode('Powered by ' + video_info['source']);
	    node_span.setAttribute('style', 'bottom:1px;left:1px;');
	    node_span.appendChild(node_source);
	    player.appendChild(node_span);
	}

	//apply style to the player
	player.setAttribute('style', player_style);
	
	return player;
    },

    /**
       returns the index of the video which the format and quality matches most the preference settings
    */
    find_prefered_video: function(videos){
	var candidate = [];
	var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var prefered_format = prefManager.getCharPref("extensions.vwof.prefered_format");
	var prefered_quality = prefManager.getCharPref("extensions.vwof.prefered_quality");
	var i;

	//match quality
	for(i=0;i<videos.length;i++){
	    if(videos[i].quality && videos[i].quality == prefered_quality){
		candidate.push(i);
	    }
	}

	//match format over quality selected cantidates
	for(i=0;i<candidate.length;i++){
	    if(videos[candidate[i]].format && videos[candidate[i]].format.match(prefered_format)){
		return candidate[i];
	    }
	}

	//return the first candidat, or if no candidate the video in the middle of the list
	var index = candidate.length > 0 ? candidate[0] : Math.floor(videos.length / 2);
	return index;
    }
};
