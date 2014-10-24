var parser = {
    BASE_URI : 'www.twitch.tv',
    
    parse_site: function(cw) {
	var doc = cw.document;
	const REGEX_CHANNELNAME = /\/([^/]\w+)$/;  //to get twitch.tv/(CHANNEL)
	var video_info = [];
	var videos = [];
	var CHANNELNAME = '';
	const URL_ACCESS_TOKEN = 'http://api.twitch.tv/api/channels/CHANNELNAME/access_token';
	const URL_ACCESS_VIDEO = 'http://usher.twitch.tv/select/CHANNELNAME.json?nauthsig=SIG&nauth=TOKEN&allow_source=true';

	//get the current channel name from the url
	if(url_match = doc.URL.match(REGEX_CHANNELNAME)){
	    CHANNELNAME = url_match[1];
	}
	else return;

	var api_video_uri = URL_ACCESS_TOKEN.replace('CHANNELNAME', CHANNELNAME);
	
	var data = vwofChrome.utils.get(api_video_uri).responseText;
	var json_data = JSON.parse(data);

	var video_url = URL_ACCESS_VIDEO.replace('CHANNELNAME', CHANNELNAME);
	video_url = video_url.replace('SIG', json_data.sig);
	video_url = video_url.replace('TOKEN', json_data.token);

	videos.push({'format': 'stream',
	  	     'quality': 'normal',
		     'url':video_url}
		   );

	video_info.push({
	    'videos': videos
	});

	return video_info;
    }
};
