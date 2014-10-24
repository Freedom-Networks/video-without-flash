var parser = {
    parse_embed: function(cw) {
	var video_info = [];	
	var doc = cw.document;

	const XPATH_PLAYER_FRAME = "//iframe[starts-with(@src, 'http://player.screenwavemedia.com/play/player.php')]";
	var xp_res_player_frame = doc.evaluate(XPATH_PLAYER_FRAME, doc, null, cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	
	while (frame = xp_res_player_frame.iterateNext()) {
	    var script_content = frame.contentDocument.body.innerHTML;

	    const REGEX_IMG = /image: '(.*\.jpg)'/;
	    var video_img = script_content.match(REGEX_IMG)[1];
	    
	    const REGEX_SMIL = /{file: '(.*\.smil)'}/;
	    var URL_smil = script_content.match(REGEX_SMIL)[1];
	    var smil = vwofChrome.utils.get(URL_smil).responseXML;
	    var videos = this.parse_smil(smil, cw);

	    video_info.push({
		'player':frame,
		'video_img':video_img,
		'videos': videos
	    });
	}

	//search in a script tag for the embed player
	const XPATH_SCRIPT = "//script[starts-with(@src, 'http://player.screenwavemedia.com/play/play.php')]";
	const REGEX_VIDEOSERVER = /'videoserver': '(.*)'/;
	const REGEX_VIDEOID = /'vidid': "(.*)"/;
	const REGEX_PLAYER = /'playerdiv': '(.*)'/;

	var xp_res_player_script = doc.evaluate(XPATH_SCRIPT, doc,
				   null, cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	
	while (script = xp_res_player_script.iterateNext()) {
	    var script_content = vwofChrome.utils.get(script.src).responseText;

	    var playerdiv_id = script_content.match(REGEX_PLAYER)[1];
	    var script_player = doc.getElementById(playerdiv_id);

	    var video_server = script_content.match(REGEX_VIDEOSERVER)[1];
	    var video_id = script_content.match(REGEX_VIDEOID)[1];

	    var URL_smil = 'http://'+video_server+'/vod/smil:'+video_id+'.smil/jwplayer.smil';
	    var smil = vwofChrome.utils.get(URL_smil).responseXML;

	    var videos = this.parse_smil(smil, cw);

	    var video_img = 'http://image.screenwavemedia.com/'+video_id+'_thumb_640x360.jpg';

	    video_info.push({
		'player': script_player,
		'video_img': video_img,
		'videos': videos
	    });

	}

	return video_info;
    },

    /**
       the video data are located in a smil file
    */
    parse_smil: function(smil, cw){
	var videos = [];

	const URL_BASE = 'http://video2.screenwavemedia.com/vod/';
	const XPATH_VIDEO = '/smil/body/switch/video';
	const REGEX_VIDEO_TYPE = /(.+):(.*)/;
	const REGEX_QUALITY = /_(\w+)\./;

	var xp_res_video = smil.evaluate(XPATH_VIDEO, smil, null, 
                           cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	
	while (video = xp_res_video.iterateNext()) {
	    var video_src = video.getAttribute('src');

	    var format_file = video_src.match(REGEX_VIDEO_TYPE);
	    var format = format_file[1];

	    var quality = video_src.match(REGEX_QUALITY)[1];
	    var video_width = video.getAttribute('width');
	    var video_height = video.getAttribute('height');
    	    if(video_width != null && video_height != null){
		quality += ' ('+video_width+'/'+video_height+')';
	    }

	    var url = URL_BASE+format_file[2];

	    videos.push( {'quality': quality, 'format':format, 'url':url} );

	}

	return videos;
    }
};
