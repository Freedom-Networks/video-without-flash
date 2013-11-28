var parser = {
    parse: function(cw) {
	var video_info = [];

	if(cw.location.hostname == 'blip.tv'){
	    video_info = this.parse_site(cw);
	}
	else{
	    video_info = this.parse_embed(cw);
	}

	return video_info;

    },

    parse_embed: function(cw) {
	const XPATH_PLAYER = "//iframe[starts-with(@src, 'http://blip.tv/play')]";
	const XPATH_VIDEO_URI_HD = '//div[@id="EpisodeInfo"]/@data-bliphd720';		
	const XPATH_VIDEO_URI_SD = '//div[@id="EpisodeInfo"]/@data-blipsd';
	const XPATH_VIDEO_URI_LD = '//div[@id="EpisodeInfo"]/@data-blipld';
	const XPATH_VIDEO_IMG = '//div[@id="EpisodeInfo"]/@data-episode-thumbnail';
	var video_info = [];
	var videos = [];
	var player;
	
	var xp_res_player = cw.document.evaluate(XPATH_PLAYER, cw.document, null, cw.XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );

	while (player = xp_res_player.iterateNext()) {
	    var player_doc = player.contentDocument;
	    var videos = [];
	    var video_uri_hd = player_doc.evaluate(XPATH_VIDEO_URI_HD, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;	    
	    var video_uri_sd = player_doc.evaluate(XPATH_VIDEO_URI_SD, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;
	    var video_uri_ld = player_doc.evaluate(XPATH_VIDEO_URI_LD, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;

	    if(video_uri_hd){videos.push({'quality':'hd720' , 'url':video_uri_hd});}
	    if(video_uri_sd){videos.push({'quality':'medium', 'url':video_uri_sd});}
	    if(video_uri_ld){videos.push({'quality':'low'   , 'url':video_uri_ld});}
	    
	    var video_img = player_doc.evaluate(XPATH_VIDEO_IMG, player_doc, null, cw.XPathResult.STRING_TYPE, null).stringValue;
	    if(video_img){
		video_img = video_img.replace('THUMB_WIDTH', player.width);
		video_img = video_img.replace('THUMB_HEIGHT', player.height);
	    }

	    video_info.push({
		'player': player,
		'video_img':video_img,
		'videos': videos
	    });
	    
	}

	return video_info;
    },

    parse_site: function(cw) {
	var video_info = [];
	var player = cw.document.getElementById('PlayeriFrame');
	if(!player)return;

	var json_string = vwofChrome.BrowserOverlay.get(cw.document.URL+'?skin=json');
	var json_content = json_string.match(/blip_ws_results\((.*)/)[1] + ']';
	var post = JSON.parse(json_content)[0].Post;
	
	var videos = [ {
	            'quality':post.media.width + '/' + post.media.height,
		    'format':post.media.mimeType,
		    'url':post.media.url
		   } ];

	for(var i=0;i<post.additionalMedia.length;i++){
	    var format = post.additionalMedia[i].primary_mime_type;
	    if(format == 'text/plain')continue;
	    
	    videos.push({'format': format,
			 'quality': post.additionalMedia[i].media_width + '/' + post.additionalMedia[i].media_height,
			 'url':post.additionalMedia[i].url}
		       );
	}

	var video_img = post.thumbnailUrl;
	
	video_info.push({
	    'player': player,
	    'video_img':video_img,
	    'videos': videos
	});

	return video_info;
    }
};
