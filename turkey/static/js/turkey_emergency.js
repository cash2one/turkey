var data_people=[['中国驻土耳其大使馆', 'Gölgeli Sokak No.34, Gaziosmanpaşa, 06700 Ankara, Turkey','0090-312-4360628', '0090-312-4464248'],['中国驻伊斯坦布尔总领事馆', 'Ahi Çelebi Cad. Çoban Çeşme Sok. No:4, Tarabya, Sarıyer, İstanbul','0090-312-2992188', '0090-312-2992633']];

function related_people(data){
    $('#related_people').empty();
    // var date = new Date();
    // var from_date_time = Math.floor(date.getTime()/1000) - 60*60*24*7;
    // var from_date = from_date_time.format('yyyy/MM/dd hh:mm');
    // var to_date = date.format('yyyy/MM/dd hh:mm');
    var html = '';
    html += ' <table class="table table-bordered table-striped table-condensed datatable" style="table-layout:fixed">';
    html += ' <thead><tr style="text-align:center;">';
    html += '<th style="text-align:center;">名称</th><th style="text-align:center;">地址</th><th style="text-align:center;">电话</th><th style="text-align:center;">传真</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    for(var i=0;i<data_people.length;i++){
        html += '<tr>'
        html += ' <td style="text-align:center;" width="40">'+data[i][0]+'</td>';
        html += ' <td style="text-align:center;" width="60">'+data[i][1]+'</td>';
        html += ' <td style="text-align:center;" width="50">'+data[i][2]+'</td>';
        html += ' <td style="text-align:center;">'+data[i][3]+'</td>';
        html += '</tr>';
    }

    html += '</tbody></table>';
    console.log(html);
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
	 $(IDdiv).append(html);
}
}

draw_news(west_reac_data,3,'#west_country');

var tur_reac_data = [{"title":"Darbe girişimi - Erdoğan'ın açıklayacağı 'önemli karar' bekleniyor","paragraph":"Cumhurbaşkanı Recep Tayyip Erdoğan, bugün düzenlenecek olan MGK toplantısının ardından önemli bir karar açıklayacağını duyurmuştu. Açıklamanın bugün yapoılması bekleniyor.","keyword":["darbe girişimi","Erdoğan"],"time":"2016-07-20","channel":"来源：bbctürkçe"},{"title":"Erdoğan'dan darbe girişimi ve Putin açıklaması","paragraph":"Rus haber ajansı Tass ve devlet televizyonu Rossiya 24'e ortak röportaj veren Cumhurbaşkanı Erdoğan, Putin in darbe girişimi sırasında en hızlı şekilde destek vermesinden memnunum dedi.","keyword":["putin","Erdoğan"],"time":"2016-08-08","channel":"来源：cnntürk"},{"title":"Başbakan Binali Yıldırım'dan darbe açıklaması","paragraph":"Başbakan Binali Yıldırım, bu akşam gelişen olayların bir darbe girişimi olduğunu açıkladı.","keyword":["Yıdırım","darbe girişimi"],"time":"2016-07-16","channel":"来源：Akşam"}];

draw_news(tur_reac_data,3,'#turkey');


var branch_lisy=[['土耳其外交部', '0090-312-2872555','0090-312-2871683','www.mfa.gov.tr'],['土耳其交通部', '0090-312-2126730','0090-312-2124900','www.ulastirma.gov.tr'],['土耳其外贸部', '0090-312-2128800','0090-312-2121622','www.foreigntrade.gov.tr'],['土耳其共和国中央银行', '0090-312-310 36 46','0090-312-3107434','www.tcmb.gov.tr'],['土耳其海关署', '0090-312-3111252','0090-312-3102214','www.gumruk.gov.tr']];
var econo_organize=[['伊斯坦布尔工业协会', '0090-212-2522900', '0090-212-2495084','www.iso.org.tr'],['伊斯坦布尔商会', '0090-212-4556000', '0090-212-5131565','www.ito.org.tr'],['安卡拉商会','0090-312-2897950','0090-312-2863446','www.atonet.org.tr'],['伊兹密尔商会','0090-232-4417777','0090-232-4416528','www.izto.org.tr']];

function economic_people(data,IDdiv){
    $('#economic_people').empty();
    // var date = new Date();
    // var from_date_time = Math.floor(date.getTime()/1000) - 60*60*24*7;
    // var from_date = from_date_time.format('yyyy/MM/dd hh:mm');
    // var to_date = date.format('yyyy/MM/dd hh:mm');
    var html = '';
    html += ' <table class="table table-bordered table-striped table-condensed datatable" style="table-layout:fixed">';
    html += ' <thead><tr style="text-align:center;">';
    html += '<th style="text-align:center;">名称</th><th style="text-align:center;">电话</th><th style="text-align:center;">传真</th><th style="text-align:center;">网站</th>';
    html += '</tr></thead>';
    html += '<tbody>';
    for(var i=0;i<data.length;i++){
        html += '<tr>'
        html += ' <td style="text-align:center;">'+data[i][0]+'</td>';
        html += ' <td style="text-align:center;">'+data[i][1]+'</td>';
        html += ' <td style="text-align:center;">'+data[i][2]+'</td>';
        html += ' <td style="text-align:center;"><a>'+data[i][3]+'</a></td>';
        html += '</tr>';
    }

    html += '</tbody></table>';
    $(IDdiv).append(html);
}

 economic_people(econo_organize,'#econo_organize');
 economic_people(branch_lisy,'#economic_people');

// var tur_reac_data =[{"title":"13 Ekim alt?n fiyatlar? ?eyrek alt?n gram alt?n ne kadar?","paragraph":"13 Ekim alt?n fiyatlar?nda sabah saatlerinde hem dü?ü? hem yükseli? g?zükmekte. Dolar’?n 3.10’u g?rdü?ü saatlerde alt?n piyasas?n genelinde dü?ü? g?züküyor. Gram alt?nda ciddi oranda bir yükseli? g?zükürken, ?eyrek alt?nda 0.0183’lük bir dü?ü? hakim. 13 Ekim’de ?eyrek alt?n ve gram alt?n ka? lira oldu?","keyword":["alt?n fiyatlar?","d?viz"],"time":"2016-10-13","channel":"来源：cnntürk"}];