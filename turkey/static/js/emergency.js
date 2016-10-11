var news_data = [{"title":"这是一条新闻标题","paragraph":"这是新闻段落...","keyword":["土耳其","埃塞俄比亚"],"time":"2016-09-01","channel":"来源：央视新闻"}]
for(var i =0;i<news_data.length;i++){
	var html = '';
	html += '<div class="news_box"><h4><span><a>'+news_data[i]["title"];
	html += '</a></span></h4><div class="text_box"><p>'+news_data[i]["paragraph"]+'</p><h5>';
    for(var j = 0;j<news_data[i]["keyword"].length;j++){
    	html += '<a href="" target="_blank">'+news_data[i]["keyword"][j]+'</a>&nbsp;';
    }
    html += '</h5><h5><i>'+news_data[i]["time"]+'</i>&nbsp;&nbsp;';
    html += news_data[i]["channel"]+'</h5></div></div>';
	
}
  $("#content_panel").append(html);


var sns_data = [{"name":"facebook的用户名","time":"2016-09-10","paragraph":"这是发布内容","channel":"来源：facebook","image":"sns_1.png"}];
for(var i =0;i<sns_data.length;i++){
	var html = '';
	html += '<div class="sns_box"><div class="sns_user"><img src="/static/img/'+sns_data[i]["image"]+'"/>';
	html += '<h4>'+sns_data[i]["name"]+'</h4>';
	html += '<span>'+sns_data[i]["time"]+'</span>';
	html += '</div><div class="text_box"><p>'+sns_data[i]["paragraph"]+'</p>';
	html += '<h5>'+sns_data[i]["channel"]+'</h5></div></div>';
}
  $("#content_panel").append(html);