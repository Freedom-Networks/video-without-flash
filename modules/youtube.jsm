var parser = {
    BASE_URI : 'youtube.com',
    API_GET_VIDEO:'http://youtube.com/get_video_info?video_id=VIDEO_ID',
    parse: function(cw) {
	 
	var video_info = [];
	if(cw.location.hostname == 'www.'+this.BASE_URI){
	    video_info = this.parse_site(cw);
	}
	else{
	    video_info = this.parse_embed(cw);
	}

	return video_info;

    },

    /**
       parse a video on the web site
    */
    parse_site:function(cw) {
	const REGEX_VIDEO_ID_SITE = /watch\?v=([\w\-]{11})/;
	var doc = cw.document;	
	var video_info = [];
	var id;
	
	//get the video id from the current url
	if(url_match = doc.URL.match(REGEX_VIDEO_ID_SITE)){
	    id = url_match[1];
	}
	else{
	    throw('cannot retreive ID of a '+this.BASE_URI+' video on '+doc.URL);
	}

	var api_video_uri = this.API_GET_VIDEO.replace('VIDEO_ID', id);
	var data = vwofChrome.BrowserOverlay.get(api_video_uri);

	var video_data = this.parse_data(data);

	//get the player, the id depends on the installation or not of the flash plugin and when this script is applied
	var player;
	player = doc.getElementById('player-api');
	if(!player)player = doc.getElementById('player');                    //works but break the comments loading
	if(!player) player = doc.getElementById('player-unavailable');       //if the parser is called after everything is loaded and the flash plugin is not installed
	if(!player) player = doc.getElementById('movie_player');
	if(!player){return;}
	video_data['player'] = player;
	
	//this div overlap with the player when the screen resolution is low
	var guide =  doc.getElementById('guide');
	if(guide)guide.style.display = 'none';


	//prevent the side bar (video sugestions) to overlap with the video 
	var sidebar = doc.getElementById('watch7-sidebar');
	if(sidebar)sidebar.style.display = 'none';
	
	video_info.push(video_data);
	
	return video_info;
    },

    /**
       parse iframe embed in sites, potentialy several videos
    */
    parse_embed: function(cw) {
	var video_info = [];
	var player;
	const REGEX_VIDEO_ID_IFRAME = /embed\/([\w\-]{11})/;
	const XPATH_PLAYER_IFRAME = "//iframe[contains(@src, 'www."+this.BASE_URI+"/embed')]";
	
	var xp_res_player = cw.document.evaluate(XPATH_PLAYER_IFRAME, cw.document, null, cw.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );

	while (player = xp_res_player.iterateNext()) {

	    var id = player.src.match(REGEX_VIDEO_ID_IFRAME)[1];
	    var api_video_uri = this.API_GET_VIDEO.replace('VIDEO_ID', id);
	    var data = vwofChrome.BrowserOverlay.get(api_video_uri);

	    var parsed_array = this.parse_data(data);
	    parsed_array['player'] = player;
	    video_info.push(parsed_array);
	}
	
	return video_info;
    },


    /**
       this is where the video data are retreived from the enormous json
       returned by the youtube's get_video_info page
    */
    parse_data: function(data){
	var videos = [];
	var assoc_data = vwofChrome.BrowserOverlay.url_vars_to_array(data);

	var url_encoded_fmt_stream_map = assoc_data['url_encoded_fmt_stream_map'];
	var url_decoded_fmt_stream_map = decodeURIComponent(url_encoded_fmt_stream_map);
	var arr_url_decoded_fmt_stream_map = url_decoded_fmt_stream_map.split(',');
	var i;
	
	for(i=0;i<arr_url_decoded_fmt_stream_map.length;i++){
	    var assoc_url_decoded_fmt_stream = vwofChrome.BrowserOverlay.url_vars_to_array(arr_url_decoded_fmt_stream_map[i]);
	    var encoded_uri = assoc_url_decoded_fmt_stream['url'];
	    var decoded_uri = decodeURIComponent(encoded_uri);
	    decoded_uri += '&signature='+assoc_url_decoded_fmt_stream['sig'];    //add the signature to the decoded url
	    var type = decodeURIComponent(assoc_url_decoded_fmt_stream['type']);
	    var quality = decodeURIComponent(assoc_url_decoded_fmt_stream['quality']);
	    if(quality == 'small')quality = 'low'; 
	    
	    videos.push( {'quality': quality, 'format':type, 'url':decoded_uri} );
	}
	
	var video_info = {
	    'video_img': decodeURIComponent(assoc_data['iurl']),
	    'videos': videos
	};

	return video_info;
    }
};
