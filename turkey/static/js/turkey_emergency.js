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