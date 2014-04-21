var parser = {
    parse_embed: function(cw) {
	var video_info = [];	
	const XPATH_PLAYER_FRAME = "//iframe[starts-with(@src, 'http://player.screenwavemedia.com/play/player.php')]";
	var xp_res_player_frame = cw.document.evaluate(XPATH_PLAYER_FRAME, cw.document, null, cw.XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
	
	while (player = xp_res_player_frame.iterateNext()) {
	    var script_content = player.contentDocument.body.innerHTML;
	    var parse_data = this.parse_data(script_content);
	    
	    var video_img = parse_data[0];
	    var videos = parse_data[1];

	    video_info.push({
		'player':player,
		'video_img':video_img,
		'videos': videos
	    });
	}

	return video_info;
    },

    /**
       the video data are written in a script markup
    */
    parse_data: function(data){
	const REGEX_IMG = /image: '(.*\.jpg)'/;
	const REGEX_VIDEO = /{file: '(.*)', label: '(.*)', type: '(.*)'}/;

	var file = data.match(REGEX_VIDEO)[1];
	var label = data.match(REGEX_VIDEO)[2];
	var type = data.match(REGEX_VIDEO)[3];
	var video_img = data.match(REGEX_IMG)[1];

	var videos = [ {'quality': label, 'format':type, 'url':file} ];

	return [video_img, videos];
    }
};
