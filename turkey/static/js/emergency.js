// var news_data = [{"title":"这是一条新闻标题","paragraph":"这是新闻段落...","keyword":["土耳其","埃塞俄比亚"],"time":"2016-09-01","channel":"来源：央视新闻"}]
var news_data = [{"title":"普京访问土耳其会晤埃尔多安 签署天然气管道项目协议","paragraph":"据中国之声《全球华语广播网》报道，当地时间10号，世界能源大会在土耳其伊斯坦布尔开幕。与会议相比，大家更关注的是：俄罗斯总统普京与土耳其总统埃尔多安的会晤。这是去年11月土耳其在土叙边境击落一架俄罗斯战机，双方关系降到冰点以后，俄罗斯总统首次访问土耳其。","keyword":["土耳其","俄罗斯"],"time":"2016-10-11","channel":"来源：央广网"},{"title":"后怕！土耳其安卡拉又挫败一起炸弹袭击图谋","paragraph":"土耳其警方８日又挫败一起自杀式汽车炸弹袭击。两名嫌疑人在与警方对峙过程中引爆炸弹自杀身亡。按照土耳其司法部长贝基尔?博兹达的说法，安卡拉因此躲过了一起“巨大灾难”。","keyword":["安卡拉","炸弹袭击"],"time":"2016-10-10","channel":"来源：新华社"},{"title":"报道称土耳其屏蔽网盘和GitHub以防止邮件泄露","paragraph":"据Turkey Blocks报道，土耳其已于上周六屏蔽了包括Google Drive、Dropbox、微软OneDrive等在内多家云存储服务（以及代码托管平台GitHub）。","keyword":["土耳其","网络"],"time":"2016-10-10","channel":"来源：cnbeta网站(台州)"},{"title":"土耳其宪兵检查站遭袭 死亡人数升至17人","paragraph":"土耳其东南部哈卡里省谢姆丁利区9日晨发生针对宪兵检查站的汽车炸弹袭击事件，已导致9名士兵和8名平民死亡，另有27人受伤。","keyword":["土耳其","汽车炸弹袭击"],"time":"2016-10-09","channel":"来源：永州日报"}];

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