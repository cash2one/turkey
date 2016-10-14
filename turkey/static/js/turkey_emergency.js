var data_people=[['中国驻土耳其大使馆', 'Gölgeli Sokak No.34, Gaziosmanpaşa, 06700 Ankara, Turkey','0090-312-4360628', '0090-312-4464248'],['中国驻土耳其大使馆经济商务参赞处', 'Horasan Sokak No.8, 06700 Gaziosmanpasa - Ankara/Turkey ','0090-312-4377107', '0090-312-4466762'],['中国驻伊斯坦布尔总领事馆', 'Ahi Çelebi Cad. Çoban Çeşme Sok. No:4, Tarabya, Sarıyer, İstanbul','0090-312-2992188', '0090-312-2992633'],['伊斯坦布尔工业协会', 'Meşrutiyet Cad. No:62, 34430 Tepebaşı/İSTANBUL','0090-212-2522900', '0090-212-2495084,2934398'],['伊斯坦布尔商会', 'Meşrutiyet Cad. No:62, 34430 Tepebaşı/İSTANBUL','0090-212-4556000', '0090-212-5131565']];

function related_people(data){
    $('#related_people').empty();
    // var date = new Date();
    // var from_date_time = Math.floor(date.getTime()/1000) - 60*60*24*7;
    // var from_date = from_date_time.format('yyyy/MM/dd hh:mm');
    // var to_date = date.format('yyyy/MM/dd hh:mm');
    var html = '';
    html += ' <table class="table table-bordered table-striped table-condensed datatable" >';
    html += ' <thead><tr style="text-align:center;">';
    html += '<th>名称</th><th>地址</th><th>电话</th><th>传真</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    for(var i=0;i<data_people.length;i++){
        html += '<tr>'
        html += ' <td style="text-align:center;">'+data[i][0]+'</td>';
        html += ' <td style="text-align:center;">'+data[i][1]+'</td>';
        html += ' <td style="text-align:center;">'+data[i][2]+'</td>';
        html += ' <td style="text-align:center;">'+data[i][3]+'</td>';
        html += '</tr>';
    }

    html += '</tbody></table>';
    $('#related_people').append(html);
}


related_people(data_people);


var west_reac_data = [{"title":"Turkey's failed coup reveals army within an army","paragraph":"As of July 21, 124 Turkish generals and admirals have been detained on charges of participating in the failed coup of July 15.","keyword":["Turkish","army"],"time":"July 24,2016","channel":"From：Al-monitor"},{"title":"Turkey coup attempt: How a night of death and mayhem unfolded","paragraph":"Forces loyal to Turkish President Recep Tayyip Erdogan quashed a coup attempt by some members of the military that began Friday evening and devolved into turmoil and violence.","keyword":["Turkish","military"],"time":"July 17, 2016","channel":"From：CNN"},{"title":"Failed coup in Turkey: What you need to know","paragraph":"Late Friday, tanks rolled onto the streets of the capital, Ankara, and Istanbul. Uniformed soldiers blocked the famous Bosphorus Bridge connecting the European and Asian sides of Istanbul.","keyword":["Turkish","Ankara"],"time":"July 18, 2016","channel":"From：CNN"},{"title":"How the Turkish government regained control after a failed military coup","paragraph":"On Saturday, the Turkish government under President Recep Tayyip Erdogan successfully suppressed an attempted coup by Turkish military officials.","keyword":["Turkish","Ankara"],"time":"July 18, 2016","channel":"From：The Washington Post"},{"title":"Turkish President Erdogan appears in Istanbul to denounce army coup attempt","paragraph":"Turkish President Recep Tayyip Erdogan has flown in to Istanbul, after an army group said it took over the country.","keyword":["Turkish","Ankara"],"time":"July 16, 2016","channel":"From：BBC"}]
function draw_news(news_data,length,IDdiv){
for(var i =0;i<length;i++){
	var html = '';
	html += '<div class="news_box"><h4><span><a>'+news_data[i]["title"];
	html += '</a></span></h4><div class="text_box"><p>'+news_data[i]["paragraph"]+'</p><h5>';
    for(var j = 0;j<news_data[i]["keyword"].length;j++){
    	html += '<a href="" target="_blank">'+news_data[i]["keyword"][j]+'</a>&nbsp;';
    }
    html += '</h5><h5><i>'+news_data[i]["time"]+'</i>&nbsp;&nbsp;';
    html += news_data[i]["channel"]+'</h5></div></div>';
	 $("#IDdiv").append(html);
}
}

draw_news(west_reac_data,west_reac_data.length,west_country);


var data_people=[['土耳其外交部', '90-312-287 25 55','90-312-287 16 83','www.mfa.gov.tr'],['土耳其交通部', '90-312-212 67 30','90-312-212 49 00','www.ulastirma.gov.tr'],['土耳其外贸部', '90-312-212 88 00','90-312-212 16 22','www.foreigntrade.gov.tr'],['土耳其外贸部', '90-312-212 88 00','90-312-212 16 22','www.foreigntrade.gov.tr'],['土耳其共和国中央银行', '90-312-310 36 46','90-312-310 74 34','www.tcmb.gov.tr'],['土耳其外贸部', '90-312-212 88 00','90-312-212 16 22','www.foreigntrade.gov.tr'],['土耳其海关署', '90-312-311 12 52','90-312-310 22 14','www.gumruk.gov.tr'],['土耳其外贸部', '90-312-212 88 00','90-312-212 16 22','www.foreigntrade.gov.tr'],];