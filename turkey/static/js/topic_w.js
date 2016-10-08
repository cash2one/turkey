// 日期的初始化
Date.prototype.format = function(format) {
    var o = {
        "M+" : this.getMonth()+1, //month 
        "d+" : this.getDate(),    //day 
        "h+" : this.getHours(),   //hour 
        "m+" : this.getMinutes(), //minute 
        "s+" : this.getSeconds(), //second 
        "q+" : Math.floor((this.getMonth()+3)/3),  //quarter 
        "S" : this.getMilliseconds() //millisecond 
    }
    if(/(y+)/.test(format)){
        format=format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(format)){
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}


function Comment_opinion(query, start_ts2, end_ts2){
    //传进来的参数，可以有
    this.query = query;
    this.start_ts2 = start_ts2;
    this.end_ts2 = end_ts2;
    this.ajax_method = "GET";
    this.minsize = 5;
    this.maxsize = 20;
    this.news_div = "vertical-ticker";
}

//类中提供画饼图，关键词云图，关键微博，表格等等操作
Comment_opinion.prototype = {
    //控制传入的url和callback方法
    call_sync_ajax_request: function(url, method, callback){
        $.ajax({
            url: url,
            type: method,
            dataType: "json",
            async: false,
            success: callback
        })
    },
    //饼图
    Pie_function: function(data){
        var pie_div = "main_w";
        var pie_data = [];
        var One_pie_data = {};
        for (var key in data){ 
            One_pie_data = {'value': data[key], 'name': key + (data[key]*100).toFixed(2)+"%"};
            pie_data.push(One_pie_data);
        }
        var option = {
            title : {
                text: '',
                x:'center', 
                textStyle:{
                fontWeight:'lighter',
                fontSize: 13,
                }        
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},            
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            series : [
                {
                    name:'访问来源',
                    type:'pie',
                    radius : '45%',
                    center: ['55%', '50%'],
                    roseType : 'area',
                    data: pie_data
                }
            ]
        };
        var myChart = echarts.init(document.getElementById(pie_div));
        myChart.setOption(option);
        $("#"+pie_div).hideLoading();
    },
    //情绪饼图
    SentiPie_function: function(data){
        var pie_div = "senti_pie";
        var pie_data = [];
        var One_pie_data = {};
        for (var key in data){ 
            One_pie_data = {'value': data[key], 'name': key + (data[key]*100).toFixed(2)+"%"};
            pie_data.push(One_pie_data);
        }
        var option = {
            color:['#3E13AF','#FF1800','#FFA900','#CD0074','#00C12B','#7109AA','#1142AA',
        '#9FEE00','#9BCA63','#B5C334','#E87C25','#27727B','#D7504B','#C6E579','#F4E001'],
            title : {
                text: '',
                x:'center', 
                textStyle:{
                fontWeight:'lighter',
                fontSize: 13,
                }        
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},            
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            series : [
                {
                    name:'访问来源',
                    type:'pie',
                    radius : '50%',
                    center: ['50%', '50%'],
                    roseType : 'area',
                    data: pie_data
                }
            ]
        };
        var myChart = echarts.init(document.getElementById(pie_div));
        myChart.setOption(option);
        $("#"+pie_div).hideLoading();
    },
    //新闻
    News_function2: function(data){
        global_comments_data2 = data;
        var select_sentiment = 1;
        refreshDrawComments2(data, select_sentiment);
    },

    Cluster_function2: function(data){
        global_comments_opinion2 = data;
        //console.log(data);
        var select_data;
        var select_tab;
        for(var k in data){
            select_tab = k;
            select_data = data[k];
            break;
        }

        var tabs_list = [];
        for(var k in data){
            tabs_list.push([k, data[k][0]]);
        }

        refreshDrawOpinionTab2(tabs_list, select_tab);
        // console.log(select_data);
        refreshDrawComments2Opinion2(select_data);
    },
}

function refreshDrawOpinionTab2(tabs_list, select_tab){
    // console.log(tabs_list,select_tab);
    $("#try").empty();
    var html = '';
    for(var i=0; i < tabs_list.length; i++){
        var clusterid = tabs_list[i][0];
        var words = tabs_list[i][1];
        if(select_tab == clusterid){
            html += '<a clusterid="' + clusterid + '" class="tabLi gColor1 curr" href="javascript:;"  style="display: block;">';
        }
        else{
            html += '<a clusterid="' + clusterid + '" class="tabLi gColor1" href="javascript:;" style="display: block;">';
        }
        html += '<div class="nmTab">' + words  + '</div>';
        html += '<div class="hvTab">' + words + '</div>';
        html += '</a>';
    }
    $("#try").append(html);
}

    function recluster2(data){
        global_comments_opinion2 = data;
        //console.log(data);
        var select_data;
        var select_tab;
        // for(var k in data){
        //     select_tab = k;
        //     select_data = data[k];
        //     break;
        // }

        var opinion = 10;
        var unselect_a = $('#try').children('a').each(function() {
            if($(this).hasClass('curr')){
                opinion = $(this).attr('clusterid');
            }
        })

        var tabs_list = [];
        for(var k in data){
            tabs_list.push([k, data[k][0]]);
        }
        //refreshDrawOpinionTab2(tabs_list, select_tab);
        // console.log(select_data);
        refreshDrawComments2Opinion2(data[opinion]);
    }
    function renews2(data){
        global_comments_data2 = data;
        var sentiment = 10;
        var unselect_a = $('#SentimentTabDiv_w').children('a').each(function() {
            if($(this).hasClass('curr')){
                sentiment = $(this).attr('sentiment');
            }
        })
        refreshDrawComments2(data, sentiment);
    }

function refreshDrawComments2Opinion2(data){
    var news_div = "#vertical-ticker_opinion_w";
    $(news_div).empty();
    var counter = 0;
    var html = "";
    if (data){
        var da = data[1];
    }
    else{
        var da = {};
    }
    for (var e in da){
        if (counter == global_subevent_display2){
            break;
        }
        counter += 1;
        var d = da[e];
        var content_summary = d['content168'];
        var user_img_link = '/static/img/unknown_profile_image.gif';
        var weight;
        if ('weight' in d){
            weight = d['weight'];
        }
        else{
            weight = 0;
        }
        html += '<li class="item" style="width:1068px">';
        html += '<div class="weibo_face"><a target="_blank" href="#">';
        html += '<img src="' + user_img_link + '">';
        html += '</a></div>';
        html += '<div class="weibo_detail" >';
        html += '<p>用户:<a class="undlin" target="_blank" href="' + d["user_comment_url"] + '">' + d['user_name'] + '</a>&nbsp;&nbsp;';
        html += '&nbsp;&nbsp;发布内容：&nbsp;&nbsp;<span id="content_summary_' + d['_id']  + '">' + content_summary + '</span>';
        html += '</p>';
        html += '<div class="weibo_info">';
        html += '<div class="weibo_pz" style="margin-right:10px;float: right;">';
        // html += '<span><a class="undlin" href="javascript:;" target="_blank">赞数(' + d['attitudes_count'] + ')</a></span>&nbsp;&nbsp;|&nbsp;&nbsp;';
        // html += '<span><a class="undlin" href="javascript:;" target="_blank">相关度(' + weight.toFixed(3) + ')</a></span>&nbsp;&nbsp;';
        //html += '<span><a class="undlin" href="javascript:;" target="_blank">情绪(' + sentiment_dict[d['sentiment']] + ')</a></span>&nbsp;&nbsp;';
        html += "</div>";
        html += '<div class="m">';
        html += '<a class="undlin" target="_blank" >' + new Date(d['timestamp'] * 1000).format("yyyy-MM-dd hh:mm:ss")  + '</a>&nbsp;-&nbsp;';
        html += '<a target="_blank">发表于'+ d["comment_source"] +'</a>&nbsp;&nbsp;';
        html += '</div>';
        html += '</div>' 
        html += '</div>';
        html += '</li>';
    }

    if (counter < global_subevent_display2){
        $("#subevent_more_information_w").html("......");
    }
    $(news_div).append(html);
    $("#content_control_height_w").css("height", $("#weibo_ul_w").css("height"));
}

function refreshDrawComments2(data, select_sentiment){
    var news_div = "#vertical-ticker_w";
    $(news_div).empty();
    //console.log(select_sentiment);
    var sentiment_dict = {
        0: '中性',
        1: '高兴',
        2: '愤怒',
        3: '悲伤'
    }

    var counter = 0;
    var html = "";

    if (data && (select_sentiment in data)){
        var da = data[select_sentiment];
    }
    else{
        var da = [];
    }

    for (var e in da){
        if (counter == global_senti_display2){
            break;
        }
        counter += 1;
        var d = da[e];
        var content_summary = d['content168'];
        var user_img_link = '/static/img/unknown_profile_image.gif';
        var weight;
        if ('weight' in d){
            weight = d['weight'];
        }
        else{
            weight = 0;
        }
        html += '<li class="item" style="width:1068px">';
        html += '<div class="weibo_face"><a target="_blank" href="#">';
        html += '<img src="' + user_img_link + '">';
        html += '</a></div>';
        html += '<div class="weibo_detail" >';
        html += '<p>用户:<a class="undlin" target="_blank" href="' + d["user_comment_url"] + '">' + d['user_name'] + '</a>&nbsp;&nbsp;';
        html += '&nbsp;&nbsp;发布内容：&nbsp;&nbsp;<span id="content_summary_' + d['_id']  + '">' + content_summary + '</span>';
        html += '</p>';
        html += '<div class="weibo_info">';
        html += '<div class="weibo_pz" style="margin-right:10px;float: right;">';
        // html += '<span><a class="undlin" href="javascript:;" target="_blank">赞数(' + d['attitudes_count'] + ')</a></span>&nbsp;&nbsp;';
        // html += '<span><a class="undlin" href="javascript:;" target="_blank">相关度(' + weight.toFixed(3) + ')</a></span>&nbsp;&nbsp;';
        html += "</div>";
        html += '<div class="m">';
        html += '<a class="undlin" target="_blank" >' + new Date(d['timestamp'] * 1000).format("yyyy-MM-dd hh:mm:ss")  + '</a>&nbsp;-&nbsp;';
        html += '<a target="_blank">发表于'+ d["comment_source"] +'</a>&nbsp;&nbsp;';
        html += '</div>';
        html += '</div>' 
        html += '</div>';
        html += '</li>';
    }

    if (counter < global_senti_display2){
        $("#senti_more_information_w").html("......");
    }
    $(news_div).append(html);
    $("#content_control_height_w").css("height", $("#weibo_ul_w").css("height"));
}

function bindOpinionTabClick2(select_div_id){
    // var select_div_id = "OpinionTabDiv";
    var a = global_comments_opinion2;
    $("#"+select_div_id).children("a").unbind();
    $("#"+select_div_id).children("a").click(function() {
        var select_a = $(this);
        //console.log(select_a);
        var unselect_a = $(this).siblings('a');
        if(!select_a.hasClass('curr')) {
            select_a.addClass('curr');
            unselect_a.removeClass('curr');
            var select_clusterid = $(this).attr('clusterid');
            global_subevent_display2 = 10;
            //console.log(select_clusterid);
            $("#subevent_more_information_w").html("加载更多");
            refreshDrawComments2Opinion2(global_comments_opinion2[select_clusterid]);
        }
    });
}

function bindClusterSortClick2(data){
    var  new_data0 = data;
    $("#cluster_sort_by_weight_w").click(function(){
        $("#cluster_sort_by_weight_w").css("color", "#fff");
        $("#cluster_sort_by_timestamp_w").css("color", "#ccc");
        if (global_pie_data){
            var new_data={};
            var s = 1;
            //comment.call_sync_ajax_request(cluster_comments_pre+"weight", comment.ajax_method, recluster);
            for (var k in new_data0){
                var key_value = [];
                for(var i=0;i<new_data0[k][1].length;i++){
                     key_value.push(new_data0[k][1][i]['weight']);
                     //key_name.push(new_data0[k][i]['weight']);
                   }
                var key_value2 = [];
                for(var i=0; i<new_data0[k][1].length; i++){ //最多取前30个最大值
                  a=key_value.indexOf(Math.max.apply(Math, key_value));
                  //console.log(a,key_value[a],key_value);
                  key_value2.push(new_data0[k][1][a]);
                  key_value[a]=-1;
                }      
                new_data['w'+s]=[new_data0[k][0],key_value2];  
                s += 1;
            }
            recluster2(new_data);
        }
    });

    $("#cluster_sort_by_timestamp_w").click(function(){
        $("#cluster_sort_by_weight_w").css("color", "#ccc");
        $("#cluster_sort_by_timestamp_w").css("color", "#fff");
        if (global_pie_data){
            var new_data={};
            var s = 1;
            //comment.call_sync_ajax_request(cluster_comments_pre+"weight", comment.ajax_method, recluster);
            for (var k in new_data0){
                var key_value = [];
                for(var i=0;i<new_data0[k][1].length;i++){
                     key_value.push(new_data0[k][1][i]['timestamp']);
                     //key_name.push(new_data0[k][i]['weight']);
                   }
                var key_value2 = [];
                for(var i=0; i<new_data0[k][1].length; i++){ //最多取前30个最大值
                  a=key_value.indexOf(Math.max.apply(Math, key_value));
                  //console.log(a,key_value[a],key_value);
                  key_value2.push(new_data0[k][1][a]);
                  key_value[a]=-1;
                }      
                new_data['w'+s]=[new_data0[k][0],key_value2];  
                s += 1;
            }
            recluster2(new_data);
        }
    });

}

function bindSentiSortClick2(data){
    var  new_data0 = data;    
    $("#sentiment_sort_by_weight_w").click(function(){
        $("#sentiment_sort_by_weight_w").css("color", "#fff");
        $("#sentiment_sort_by_timestamp_w").css("color", "#ccc");
        if (global_pie_data){
            var new_data={};
            var s = 0;
            //comment.call_sync_ajax_request(cluster_comments_pre+"weight", comment.ajax_method, recluster);
            for (var k in new_data0){
                var key_value = [];
                for(var i=0;i<new_data0[k].length;i++){
                     key_value.push(new_data0[k][i]['weight']);
                     //key_name.push(new_data0[k][i]['weight']);
                   }
                   //console.log(key_value);
                var key_value2 = [];
                for(var i=0; i<new_data0[k].length; i++){ //最多取前30个最大值
                  a=key_value.indexOf(Math.max.apply(Math, key_value));
                  //console.log(a,key_value[a],key_value);
                  key_value2.push(new_data0[k][a]);
                  key_value[a]=-1;
                }      

                new_data[s]=key_value2;  
                s += 1;
            }
            renews2(new_data);
            //console.log(new_data);
        }
    });

    $("#sentiment_sort_by_timestamp_w").click(function(){
        $("#sentiment_sort_by_weight_w").css("color", "#ccc");
        $("#sentiment_sort_by_timestamp_w").css("color", "#fff");
        if (global_pie_data){
            var new_data={};
            var s = 0;
            //comment.call_sync_ajax_request(cluster_comments_pre+"weight", comment.ajax_method, recluster);
            for (var k in new_data0){
                var key_value = [];
                for(var i=0;i<new_data0[k].length;i++){
                     key_value.push(new_data0[k][i]['timestamp']);
                     //key_name.push(new_data0[k][i]['weight']);
                   }
                   //console.log(key_value);
                var key_value2 = [];
                for(var i=0; i<new_data0[k].length; i++){ //最多取前30个最大值
                  a=key_value.indexOf(Math.max.apply(Math, key_value));
                  //console.log(a,key_value[a],key_value);
                  key_value2.push(new_data0[k][a]);
                  key_value[a]=-1;
                }      

                new_data[s]=key_value2;  
                s += 1;
            }
            renews2(new_data);
        }
    });
}

function bindSentimentTabClick2(select_div_id){
    //var select_div_id = "SentimentTabDiv";
    var sentiment_map = {
        'neutral': 0,
        'happy': 1,
        'angry': 2,
        'sad': 3
    }
    $("#"+select_div_id).children("a").unbind();
    var g_a = global_comments_data2;
    $("#"+select_div_id).children("a").click(function() {
        var select_a = $(this);
        var unselect_a = $(this).siblings('a');
        var select_sentiment = 10;

        if(!select_a.hasClass('curr')) {
            select_a.addClass('curr');
            unselect_a.removeClass('curr');
            select_sentiment = $(this).attr('sentiment');
            //var select_sentiment = sentiment_map[select_a.attr('sentiment')];
            global_senti_display2 = 10;
            $("#senti_more_information_w").html("加载更多");
            //console.log(select_sentiment);
            refreshDrawComments2(g_a, select_sentiment);
        }
    });
}

function bindSentiMoreClick2(){
    $("#senti_more_information_w").click(function(){
        global_senti_display2 += addition;
        var select_div_id = "SentimentTabDiv_w";
        var sentiment_map = {
            'neutral': 0,
            'happy': 1,
            'angry': 2,
            'sad': 3
        }
        $("#"+select_div_id).children("a").each(function() {
            if($(this).hasClass('curr')) {
                var select_a = $(this);
                var select_sentiment = sentiment_map[select_a.attr('sentiment')];
                refreshDrawComments2(global_comments_data2, select_sentiment);
                return false;
            }
        });
    });
}

function bindSubeventMoreClick2(){
    $("#subevent_more_information_w").click(function(){
        global_subevent_display2 += addition;
        var select_div_id = "try";
        $("#"+select_div_id).children("a").each(function() {
            if($(this).hasClass('curr')) {
                var select_a = $(this);
                var select_clusterid = select_a.attr('clusterid');
                refreshDrawComments2Opinion2(global_comments_opinion2[select_clusterid]);
                return false;
            }
        });
    });
}

function drawTopicSelect(data){
    $("#topic_form_w").empty();
    var html = '';
    html += '<select style="width:155px;float:right;height:30px" id="topic_select" name="topics">';

    for (var i = 0;i < data.length;i++) {
        var value = data[i]['_id'];
        var name = data[i]['topic'];
        if (name == query){
            html += '<option selected="selected" value="' + value +'">' + name +'</option>';
        }
        else{
            html += '<option value="' + value +'">' + name +'</option>';
        }
    }
    html += '</select>';
    $("#topic_form").append(html);
    bindTopicChange();
}
function bindTopicChange(){
    $("#topic_select").change(function(){
        topic_id = $(this).val();
        query = $(this).find("option:selected").text();
        subevent_id = 'global';   //默认显示全部子事件汇总
        drawSubeventSelect(global_subevents_data2);
    });
}

function drawSubeventSelect(data){
    if (!global_subevents_data2){
        global_subevents_data2 = data;
    }
    $("#subevent_form").empty();
    var html = '';
    html += '<select style="width:143px;height:30px;float:right" id="subevent_select" name="subevents">';

    if (subevent_id == 'global'){
        html += '<option selected="selected" value="global">全部</option>';
    }
    else{
        html += '<option value="global">全部</option>';
    }
    if (topic_id in data){
        var subevents = data[topic_id];
    }
    else{
        var subevents = [];
    }

    for (var i = 0;i < subevents.length;i++){
        var value = subevents[i]['_id'];
        var name = subevents[i]['name'];
        if (value == subevent_id){
            html += '<option selected="selected" value="' + value +'">' + name +'</option>';
        }
        else{
            html += '<option value="' + value +'">' + name +'</option>';
        }
    }
    html += '</select>';
    $("#subevent_form").append(html);
    bindSubeventChange();
}

function check_comments2(pie_data_point, pie_data_sentiment, cluster_data){
    
        // global_pie_data2 = data;
        // console.log(data);
        draw_pie_w(pie_data_point, 'main_w', '事件');

        draw_pie_w_senti(pie_data_sentiment, 'senti_pie_w', '情绪');
        comment.Cluster_function2(cluster_data);
        comment.News_function2(news_data);
        

        // comment.call_sync_ajax_request(cluster_comments_pre+"weight", comment.ajax_method, comment.Cluster_function2);
         //comment.call_sync_ajax_request(sentiment_comments_pre+"weight", comment.ajax_method, comment.News_function2);
    
}
function draw_pie_w_senti(data, div_name, title){
    require.config({
        paths : {
            echarts : "/static/echarts/"
        }
    });
    require(
    [
        'echarts',
        'echarts/chart/pie'
    ],
    function (echarts) {
    var myChart = echarts.init(document.getElementById(div_name));

    var option = {
         color:['#3E13AF','#FFA900','#FF1800','#CD0074','#00C12B','#7109AA','#1142AA',
        '#9FEE00','#9BCA63','#B5C334','#E87C25','#27727B','#D7504B','#C6E579','#F4E001'],
            title : {
                text: '情绪占比分析',
                x:'center', 
                y: 'bottom',
                textStyle:{
                fontWeight:'lighter',
                fontSize: 13,
                }        
            },
        tooltip : {
                trigger: 'item',
                formatter: "{b} : {c}({d}%)"
        
        },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},            
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            series : [
                {
                    name:'访问来源',
                    type:'pie',
                    itemStyle : {
                        normal : {
                          label : {
                            show : true
                          },
                          labelLine : {
                            show : true,
                            length : 10
                          }//,
                          //color:function (value){ return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6); }
                    //     color: function(params) {
                    //     // build a color map as your need.
                    //     var colorList = c_list;
                    //     return colorList[params.dataIndex]
                    // }
                        },
                        emphasis : {
                          label : {
                            show : false,
                            position : 'bottom',
                            textStyle : {
                              fontSize : '14',
                              fontWeight : 'bold'
                            }
                          }
                        }
                      },
                    radius : '50%',
                    center: ['50%', '50%'],
                    roseType : 'area',
                    data: data
                }
            ]
        };
        myChart.setOption(option);});

}

function draw_pie_w(data, div_name, title){
	require.config({
        paths : {
            echarts : "/static/echarts/"
        }
    });
    require(
    [
        'echarts',
        'echarts/chart/pie'
    ],
	function (echarts) {
    var myChart = echarts.init(document.getElementById(div_name));
    var option = {
            title : {
                text: '主题占比分析',
                x:'center', 
                y: 'bottom',
                textStyle:{
                fontWeight:'lighter',
                fontSize: 13,
                }        
            },
        tooltip : {
                trigger: 'item',
                formatter: function (params) {
                    var weibo_data = {"一言激起千层浪":'冯先生确实弄错了。解放后行政<br>区划的改变，不会把徽文化改变掉。从这个<br>行政区划个案的调整看，我们今后在改变行政区划<br>时，要注意从传统文化的角度审视<br>一下。', "闭眼说瞎话":'冯骥才（1942～）,当代作家。原籍浙江慈溪. <br>以为自己是谁？ 本来对他还有好感的。<br>现在。。。',"一家之言而已":'文化人士并不代表就是真理,只是冯某人的一家<br>之言.务源文化是客观存在,代表不代表徽文化,或者<br>代表不代表赣文化,对他而言,权作参考吧,不必<br>太过上心.'}
                    //console.log(params)
                    var res = params[1]+':'+params[2]+'('+ params[3]+'%)<br>'+ weibo_data[params[1]];
                    return res;
                }
        
        },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    restore : {show: true},            
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            series : [
                {
                    name:'访问来源',
                    type:'pie',
                    radius : '50%',
                    itemStyle : {
                        normal : {
                          label : {
                            show : true
                          },
                          labelLine : {
                            show : true,
                            length : 10
                          },
                          //color:function (value){ return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6); }
                    //     color: function(params) {
                    //     	//console.log(params);
                    //     //params =params+1;
                    //     // build a color map as your need.
                    //     var colorList = ['#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0',
                    //       '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
                    //       '#C1232B','#B5C334','#FCCE10','#E87C25','#27727B' ];
                    //     return colorList[params.dataIndex]

                    // }
                        },
                        emphasis : {
                          label : {
                            show : false,
                            position : 'bottom',
                            textStyle : {
                              fontSize : '14',
                              fontWeight : 'bold'
                            }
                          }
                        }
                      },
                    center: ['50%', '50%'],
                    roseType : 'area',
                    data: data
                }
            ]
        };

        myChart.setOption(option);
	});
}

function bindSubeventChange(){
    $("#subevent_select").change(function(){
        subevent_id = $(this).val();
    });
}

function drawVsmSelect(){
    $("#select_vsm").empty();
    var html = '';
    var vsm_list = ['v1', 'v2'];
    var vsm_name = ['普通', '基于上下文'];
    for (var i=0;i < vsm_list.length;i++){
        var name = vsm_name[i];
        var value = vsm_list[i];
        if (value == vsm){
            html += '<option selected="selected" value="' + value +'">' + name +'</option>';
        }
        else{
            html += '<option value="' + value +'">' + name +'</option>';
        }
    }
    $("#select_vsm").append(html);
}




var query = QUERY;
var topic_id = TOPIC_ID;
var subevent_id = SUBEVENT_ID;
var min_cluster_num = MIN_CLUSTER_NUM;
var max_cluster_num = MAX_CLUSTER_NUM;
var cluster_eva_min_size = CLUSTER_EVA_MIN_SIZE;
var vsm = VSM;
var start_ts2 = undefined;
var end_ts2 = undefined;
var global_pie_data2 = undefined;
var global_subevents_data2 = undefined;
var global_comments_data2 = undefined;
var global_comments_opinion2 = undefined;
var global_subevent_display2 = 10;
var global_senti_display2 = 10;
var addition = 10;
var topic_url = "/cluster/topics/";
var subevent_url = "/cluster/subevents/";
var global_ajax_url = "/cluster/comments_list/?topicid=" + topic_id + "&subeventid=" + subevent_id + "&min_cluster_num=" + min_cluster_num + "&max_cluster_num=" + max_cluster_num + "&cluster_eva_min_size=" + cluster_eva_min_size + "&vsm=" + vsm;


var pie_data_point = [{'name':'一言激起千层浪','value':7},{'name':'闭眼说瞎话','value':3},{'name':'一家之言而已','value':3}];

var pie_data_sentiment = [{'name':'愤怒','value':4},{'name':'积极','value':0},{'name':'中性','value':5},{'name':'悲伤','value':4}];
var cluster_data = 
{"w1":['一言激起千层浪',[
    {
    '_id':"http://www.tianya.cn/1841017",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"【转贴】冯骥才一语激起千层浪 婺源文化的主体不再是徽文化？ █ 吴国辉 【2005年11月09日】 本报讯 11月7日上午，在江西省婺源县举办的中国乡村文化旅游论坛上，著名作家冯骥才先生回答听众提问时，称婺源文化受外来文化影响很深，不是单一的徽文化。这一言论迅即引起徽州与婺源两地数百位网民的非议，一位历史教师还赠书冯先生，称要启蒙他对徽文化的了解。昨日，徽文化研究学者再次表态：婺源文化的主体就是徽文化 。 冯骥才：婺源文化是多元的 在婺源县新华书店上班的潘女士告诉记者，这次论坛有600余听众和学者参加，冯骥才先生是最后一个演讲者。演讲结束后，论坛主持人让听众自由提问，前四个问题问得波澜不惊，冯先生的回答也游刃有余。 潘女士回忆称，婺源县某中学历史专业的齐老师和她商量后，提出最后一个问题，主要意思是婺源文化是根植于徽州文化的，是徽文化不可分割的重要组成部分，可是现在提婺源文化的时候很少提到徽文化，请问他对此是怎么看的。 冯骥才的回答很干脆，他称婺源的民居是徽派的，但婺源处在三省交界，受外来文化的影响很深，婺源文化不是单一的，是多元文化，如婺源的傩与江西其他地方的傩有很多相似之处，和徽傩不一样。他还称婺源文化要有自己的特色...",
    'content168':"【转贴】冯骥才一语激起千层浪 婺源文化的主体不再是徽文化？ █ 吴国辉 【2005年11月09日】 本报讯 11月7日上午，在江西省婺源县举办的中国乡村文化旅游论坛上，著名作家冯骥才先生回答听众提问时，称婺源文化受外来文化影响很深，不是单一的徽文化。这一言论迅即引起徽州与婺源两地数百位网民的非议，一位历史教师还赠书冯先生，称要启蒙他对徽文化的了解。昨日，徽文化研究学者再次表态：婺源文化的主体就是徽文化 。 冯骥才：婺源文化是多元的 在婺源县新华书店上班的潘女士告诉记者，这次论坛有600余听众和学者参加，冯骥才先生是最后一个演讲者。演讲结束后，论坛主持人让听众自由提问，前四个问题问得波澜不惊，冯先生的回答也游刃有余。 潘女士回忆称，婺源县某中学历史专业的齐老师和她商量后，提出最后一个问题，主要意思是婺源文化是根植于徽州文化的，是徽文化不可分割的重要组成部分，可是现在提婺源文化的时候很少提到徽文化，请问他对此是怎么看的。 冯骥才的回答很干脆，他称婺源的民居是徽派的，但婺源处在三省交界，受外来文化的影响很深，婺源文化不是单一的，是多元文化，如婺源的傩与江西其他地方的傩有很多相似之处，和徽傩不一样。他还称婺源文化要有自己的特色...",
    'date':"2005-11-9",
    'datetime':"2005/11/9  9:19:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29487,
    'id':"http://www.tianya.cn/1841017",
    'last_modify':1459694057.29487,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1841017",
    'same_from_sentiment':"http://www.tianya.cn/1841017",
    'sentiment':0,
    'text':"【转贴】冯骥才一语激起千层浪 婺源文化的主体不再是徽文化？ █ 吴国辉 【2005年11月09日】 本报讯 11月7日上午，在江西省婺源县举办的中国乡村文化旅游论坛上，著名作家冯骥才先生回答听众提问时，称婺源文化受外来文化影响很深，不是单一的徽文化。这一言论迅即引起徽州与婺源两地数百位网民的非议，一位历史教师还赠书冯先生，称要启蒙他对徽文化的了解。昨日，徽文化研究学者再次表态：婺源文化的主体就是徽文化 。 冯骥才：婺源文化是多元的 在婺源县新华书店上班的潘女士告诉记者，这次论坛有600余听众和学者参加，冯骥才先生是最后一个演讲者。演讲结束后，论坛主持人让听众自由提问，前四个问题问得波澜不惊，冯先生的回答也游刃有余。 潘女士回忆称，婺源县某中学历史专业的齐老师和她商量后，提出最后一个问题，主要意思是婺源文化是根植于徽州文化的，是徽文化不可分割的重要组成部分，可是现在提婺源文化的时候很少提到徽文化，请问他对此是怎么看的。 冯骥才的回答很干脆，他称婺源的民居是徽派的，但婺源处在三省交界，受外来文化的影响很深，婺源文化不是单一的，是多元文化，如婺源的傩与江西其他地方的傩有很多相似...",
    'text_filter_ad':"【转贴】冯骥才一语激起千层浪 婺源文化的主体不再是徽文化？ █ 吴国辉 【2005年11月09日】 本报讯 11月7日上午，在江西省婺源县举办的中国乡村文化旅游论坛上，著名作家冯骥才先生回答听众提问时，称婺源文化受外来文化影响很深，不是单一的徽文化。这一言论迅即引起徽州与婺源两地数百位网民的非议，一位历史教师还赠书冯先生，称要启蒙他对徽文化的了解。昨日，徽文化研究学者再次表态：婺源文化的主体就是徽文化 。 冯骥才：婺源文化是多元的 在婺源县新华书店上班的潘女士告诉记者，这次论坛有600余听众和学者参加，冯骥才先生是最后一个演讲者。演讲结束后，论坛主持人让听众自由提问，前四个问题问得波澜不惊，冯先生的回答也游刃有余。 潘女士回忆称，婺源县某中学历史专业的齐老师和她商量后，提出最后一个问题，主要意思是婺源文化是根植于徽州文化的，是徽文化不可分割的重要组成部分，可是现在提婺源文化的时候很少提到徽文化，请问他对此是怎么看的。 冯骥才的回答很干脆，他称婺源的民居是徽派的，但婺源处在三省交界，受外来文化的影响很深，婺源文化不是单一的，是多元文化，如婺源的傩与江西其他地方的傩有很多相似...",
    'timestamp':1131499140,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1841017",
    'user_name':"新安老童生",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/411863",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"冯先生确实弄错了。解放后行政区划的改变，不会把徽文化改变掉。从这个行政区划个案的调整看，我们今后在改变行政区划时，要注意从传统文化的角度审视一下。",
    'content168':"冯先生确实弄错了。解放后行政区划的改变，不会把徽文化改变掉。从这个行政区划个案的调整看，我们今后在改变行政区划时，要注意从传统文化的角度审视一下。",
    'date':"2005-11-12",
    'datetime':"2005/11/12 12:20",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.28865,
    'id':"http://www.tianya.cn/411863",
    'last_modify':1459694057.28865,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-books-69229-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/411863",
    'same_from_sentiment':"http://www.tianya.cn/411863",
    'sentiment':0,
    'text':"冯先生确实弄错了。解放后行政区划的改变，不会把徽文化改变掉。从这个行政区划个案的调整看，我们今后在改变行政区划时，要注意从传统文化的角度审视一下。",
    'text_filter_ad':"冯先生确实弄错了。解放后行政区划的改变，不会把徽文化改变掉。从这个行政区划个案的调整看，我们今后在改变行政区划时，要注意从传统文化的角度审视一下。",
    'timestamp':1131769200,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/411863",
    'user_name':"xydh0820",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/196339",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"婺源当然属于徽文化圈，绩溪更是徽文化的发祥地之一。 冯先生确实弄错了，婺源虽然划给江西省半个世纪，可一直怀有“徽州心”。晓起街上的摊贩说：“我们是徽州人。” 说起来，江西东北部浮梁一带的文化遗存，倒是不纯粹的赣文化。从建筑、饮食、祠堂等方面看，那里更接近徽文化。",
    'content168':"婺源当然属于徽文化圈，绩溪更是徽文化的发祥地之一。 冯先生确实弄错了，婺源虽然划给江西省半个世纪，可一直怀有“徽州心”。晓起街上的摊贩说：“我们是徽州人。” 说起来，江西东北部浮梁一带的文化遗存，倒是不纯粹的赣文化。从建筑、饮食、祠堂等方面看，那里更接近徽文化。",
    'date':"2005-11-12",
    'datetime':"2005/11/12 11:55",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.28932,
    'id':"http://www.tianya.cn/196339",
    'last_modify':1459694057.28932,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-books-69229-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/196339",
    'same_from_sentiment':"http://www.tianya.cn/196339",
    'sentiment':0,
    'text':"婺源当然属于徽文化圈，绩溪更是徽文化的发祥地之一。 冯先生确实弄错了，婺源虽然划给江西省半个世纪，可一直怀有“徽州心”。晓起街上的摊贩说：“我们是徽州人。” 说起来，江西东北部浮梁一带的文化遗存，倒是不纯粹的赣文化。从建筑、饮食、祠堂等方面看，那里更接近徽文化。",
    'text_filter_ad':"婺源当然属于徽文化圈，绩溪更是徽文化的发祥地之一。 冯先生确实弄错了，婺源虽然划给江西省半个世纪，可一直怀有“徽州心”。晓起街上的摊贩说：“我们是徽州人。” 说起来，江西东北部浮梁一带的文化遗存，倒是不纯粹的赣文化。从建筑、饮食、祠堂等方面看，那里更接近徽文化。",
    'timestamp':1131767700,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/196339",
    'user_name':"注注",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/3618067",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"近来书话上有关徽州的议题挺多的.这是从天涯徽文化版转来的. 冯先生难道不知傩文化是很古老的文化遗存,南方之傩大体相同,而徽文化的形成,当初一府六县的格局是在一千年前左右形成的. 冯先生此话讲得太随意了,为冯先生羞也.",
    'content168':"近来书话上有关徽州的议题挺多的.这是从天涯徽文化版转来的. 冯先生难道不知傩文化是很古老的文化遗存,南方之傩大体相同,而徽文化的形成,当初一府六县的格局是在一千年前左右形成的. 冯先生此话讲得太随意了,为冯先生羞也.",
    'date':"2005-11-11",
    'datetime':"2005/11/11 12:14",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29001,
    'id':"http://www.tianya.cn/3618067",
    'last_modify':1459694057.29001,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-books-69229-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/3618067",
    'same_from_sentiment':"http://www.tianya.cn/3618067",
    'sentiment':3,
    'text':"近来书话上有关徽州的议题挺多的.这是从天涯徽文化版转来的. 冯先生难道不知傩文化是很古老的文化遗存,南方之傩大体相同,而徽文化的形成,当初一府六县的格局是在一千年前左右形成的. 冯先生此话讲得太随意了,为冯先生羞也.",
    'text_filter_ad':"近来书话上有关徽州的议题挺多的.这是从天涯徽文化版转来的. 冯先生难道不知傩文化是很古老的文化遗存,南方之傩大体相同,而徽文化的形成,当初一府六县的格局是在一千年前左右形成的. 冯先生此话讲得太随意了,为冯先生羞也.",
    'timestamp':1131682440,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/3618067",
    'user_name':"度假旅游",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/934015",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"几天没碰报纸，刚刚知道。这大冯先生是怎么回事儿了。 傩 徽文化， 一种混乱的比较，他要到务源乡下去呀，会吃许多唾沫星子的。",
    'content168':"几天没碰报纸，刚刚知道。这大冯先生是怎么回事儿了。 傩 徽文化， 一种混乱的比较，他要到务源乡下去呀，会吃许多唾沫星子的。",
    'date':"2005-11-11",
    'datetime':"2005/11/11 15:43",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29071,
    'id':"http://www.tianya.cn/934015",
    'last_modify':1459694057.29071,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-books-69229-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/934015",
    'same_from_sentiment':"http://www.tianya.cn/934015",
    'sentiment':3,
    'text':"几天没碰报纸，刚刚知道。这大冯先生是怎么回事儿了。 傩 徽文化， 一种混乱的比较，他要到务源乡下去呀，会吃许多唾沫星子的。",
    'text_filter_ad':"几天没碰报纸，刚刚知道。这大冯先生是怎么回事儿了。 傩 徽文化， 一种混乱的比较，他要到务源乡下去呀，会吃许多唾沫星子的。",
    'timestamp':1131694980,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/934015",
    'user_name':"黄山李平易",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/3143099",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"相信冯老应该是我们的朋友，不会是徽州的敌人，一个视文化为灵魂、对文化如此重视的人怎么会是徽文化的敌人，可能他对徽文化不了解吧，徽州同胞们我们应该化悲痛为力量，全体徽州人团结起来，今后要加强对外宣传，不要让我们的祖宗遗产再让别人一点点蚕食，我们徽文化当前应该是四面楚歌，南有赣蛮、北有皖军、东有吴越、西有桐城派都说徽文化属于他们范畴，大家都盯着“徽文化、徽商”，希望借此机会为徽商、徽文化正名。",
    'content168':"相信冯老应该是我们的朋友，不会是徽州的敌人，一个视文化为灵魂、对文化如此重视的人怎么会是徽文化的敌人，可能他对徽文化不了解吧，徽州同胞们我们应该化悲痛为力量，全体徽州人团结起来，今后要加强对外宣传，不要让我们的祖宗遗产再让别人一点点蚕食，我们徽文化当前应该是四面楚歌，南有赣蛮、北有皖军、东有吴越、西有桐城派都说徽文化属于他们范畴，大家都盯着“徽文化、徽商”，希望借此机会为徽商、徽文化正名。",
    'date':"2005-11-9",
    'datetime':"2005/11/9  13:16:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29413,
    'id':"http://www.tianya.cn/3143099",
    'last_modify':1459694057.29413,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/3143099",
    'same_from_sentiment':"http://www.tianya.cn/3143099",
    'sentiment':0,
    'text':"相信冯老应该是我们的朋友，不会是徽州的敌人，一个视文化为灵魂、对文化如此重视的人怎么会是徽文化的敌人，可能他对徽文化不了解吧，徽州同胞们我们应该化悲痛为力量，全体徽州人团结起来，今后要加强对外宣传，不要让我们的祖宗遗产再让别人一点点蚕食，我们徽文化当前应该是四面楚歌，南有赣蛮、北有皖军、东有吴越、西有桐城派都说徽文化属于他们范畴，大家都盯着“徽文化、徽商”，希望借此机会为徽商、徽文化正名。",
    'text_filter_ad':"相信冯老应该是我们的朋友，不会是徽州的敌人，一个视文化为灵魂、对文化如此重视的人怎么会是徽文化的敌人，可能他对徽文化不了解吧，徽州同胞们我们应该化悲痛为力量，全体徽州人团结起来，今后要加强对外宣传，不要让我们的祖宗遗产再让别人一点点蚕食，我们徽文化当前应该是四面楚歌，南有赣蛮、北有皖军、东有吴越、西有桐城派都说徽文化属于他们范畴，大家都盯着“徽文化、徽商”，希望借此机会为徽商、徽文化正名。",
    'timestamp':1131513360,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/3143099",
    'user_name':"振兴徽商",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/1649347",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"新安老童生 于2005-11-07 09:41 PM 发表评论： 看看一个年轻的婺源中学历史老师的作为： 办好了！ 刚才找到他们一伙人下榻的江湾大酒店，被告知他的房号不详。我琢磨着总不能硬闯吧，就先行回到办公室。拿了本子桐的《徽州少年歌》，又风弛往江湾。问总台要了纸笔，以下是我对他说的话：冯老师 你好！作为民俗学领域里的知名专家，我想，对于古物、民俗原汁原味的重要性，您想必是慧眼独具的。作为一个拓展，中华丰富的地域文化又何尝不是如此得呢？婺源，是徽州不可分割的一部分，此是亘古不变的真理。我真诚的希望，对于昨天的讲话，只是您泱泱如大海般学识中尚未探测到的一个盲点而已。毕竟，人非圣贤，孰能无过。您说呢？ 有缘再叙 祝您一路顺风！ 落款：徽州婺源人 即日 我将写好的纸条夹在书里。最后我拜托值班小姐第二天早上一定要转交到他上，那个高高大大 诙谐幽默的天津汉子手里...",
    'content168':"新安老童生 于2005-11-07 09:41 PM 发表评论： 看看一个年轻的婺源中学历史老师的作为： 办好了！ 刚才找到他们一伙人下榻的江湾大酒店，被告知他的房号不详。我琢磨着总不能硬闯吧，就先行回到办公室。拿了本子桐的《徽州少年歌》，又风弛往江湾。问总台要了纸笔，以下是我对他说的话：冯老师 你好！作为民俗学领域里的知名专家，我想，对于古物、民俗原汁原味的重要性，您想必是慧眼独具的。作为一个拓展，中华丰富的地域文化又何尝不是如此得呢？婺源，是徽州不可分割的一部分，此是亘古不变的真理。我真诚的希望，对于昨天的讲话，只是您泱泱如大海般学识中尚未探测到的一个盲点而已。毕竟，人非圣贤，孰能无过。您说呢？ 有缘再叙 祝您一路顺风！ 落款：徽州婺源人 即日 我将写好的纸条夹在书里。最后我拜托值班小姐第二天早上一定要转交到他上，那个高高大大 诙谐幽默的天津汉子手里...",
    'date':"2005-11-9",
    'datetime':"2005/11/9  9:19:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29632,
    'id':"http://www.tianya.cn/1649347",
    'last_modify':1459694057.29632,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1649347",
    'same_from_sentiment':"http://www.tianya.cn/1649347",
    'sentiment':1,
    'text':"新安老童生 于2005-11-07 09:41 PM 发表评论： 看看一个年轻的婺源中学历史老师的作为： 办好了！ 刚才找到他们一伙人下榻的江湾大酒店，被告知他的房号不详。我琢磨着总不能硬闯吧，就先行回到办公室。拿了本子桐的《徽州少年歌》，又风弛往江湾。问总台要了纸笔，以下是我对他说的话：冯老师 你好！作为民俗学领域里的知名专家，我想，对于古物、民俗原汁原味的重要性，您想必是慧眼独具的。作为一个拓展，中华丰富的地域文化又何尝不是如此得呢？婺源，是徽州不可分割的一部分，此是亘古不变的真理。我真诚的希望，对于昨天的讲话，只是您泱泱如大海般学识中尚未探测到的一个盲点而已。毕竟，人非圣贤，孰能无过。您说呢？ 有缘再叙 祝您一路顺风！ 落款：徽州婺源人 即日 我将写好的纸条夹在书里。最后我拜托值班小姐第二天早上一定要转交到他上，那个高高大大 诙谐幽默的天津汉子手里...",
    'text_filter_ad':"新安老童生 于2005-11-07 09:41 PM 发表评论： 看看一个年轻的婺源中学历史老师的作为： 办好了！ 刚才找到他们一伙人下榻的江湾大酒店，被告知他的房号不详。我琢磨着总不能硬闯吧，就先行回到办公室。拿了本子桐的《徽州少年歌》，又风弛往江湾。问总台要了纸笔，以下是我对他说的话：冯老师 你好！作为民俗学领域里的知名专家，我想，对于古物、民俗原汁原味的重要性，您想必是慧眼独具的。作为一个拓展，中华丰富的地域文化又何尝不是如此得呢？婺源，是徽州不可分割的一部分，此是亘古不变的真理。我真诚的希望，对于昨天的讲话，只是您泱泱如大海般学识中尚未探测到的一个盲点而已。毕竟，人非圣贤，孰能无过。您说呢？ 有缘再叙 祝您一路顺风！ 落款：徽州婺源人 即日 我将写好的纸条夹在书里。最后我拜托值班小姐第二天早上一定要转交到他上，那个高高大大 诙谐幽默的天津汉子手里...",
    'timestamp':1131424440,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1649347",
    'user_name':"冰清玉洁水结冰",
    'weight':0}]],
"w2":['闭眼说瞎话',[
        {
    '_id':"http://www.tianya.cn/5247895",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w2", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"图片不是已经告诉我们了吗，此君在闭在眼睛说瞎话",
    'content168':"图片不是已经告诉我们了吗，此君在闭在眼睛说瞎话",
    'date':"2005-11-12",
    'datetime':"2005/11/12  14:44:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29273,
    'id':"http://www.tianya.cn/5247895",
    'last_modify':1459694057.29273,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/5247895",
    'same_from_sentiment':"http://www.tianya.cn/5247895",
    'sentiment':2,
    'text':"图片不是已经告诉我们了吗，此君在闭在眼睛说瞎话",
    'text_filter_ad':"图片不是已经告诉我们了吗，此君在闭在眼睛说瞎话",
    'timestamp':1131777840,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/5247895",
    'user_name':"kur01",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/3042092",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w2", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"冯骥才（1942～）,当代作家。原籍浙江慈溪. 以为自己是谁？ 本来对他还有好感的。现在。。。。。。。。。",
    'content168':"冯骥才（1942～）,当代作家。原籍浙江慈溪. 以为自己是谁？ 本来对他还有好感的。现在。。。。。。。。。",
    'date':"2005-11-27",
    'datetime':"2005/11/27 20:13",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29136,
    'id':"http://www.tianya.cn/3042092",
    'last_modify':1459694057.29136,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/3042092",
    'same_from_sentiment':"http://www.tianya.cn/3042092",
    'sentiment':2,
    'text':"冯骥才（1942～）,当代作家。原籍浙江慈溪. 以为自己是谁？ 本来对他还有好感的。现在。。。。。。。。。",
    'text_filter_ad':"冯骥才（1942～）,当代作家。原籍浙江慈溪. 以为自己是谁？ 本来对他还有好感的。现在。。。。。。。。。",
    'timestamp':1133093580,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/3042092",
    'user_name':"徽州余",
    'weight':0},    
    {
    '_id':"http://www.tianya.cn/1936087",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w2", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"有啥牛的！",
    'content168':"有啥牛的！",
    'date':"2005-11-08",
    'datetime':"2005/11/8  13:14:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.2957,
    'id':"http://www.tianya.cn/1936087",
    'last_modify':1459694057.2957,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1936087",
    'same_from_sentiment':"http://www.tianya.cn/1936087",
    'sentiment':2,
    'text':"有啥牛的！",
    'text_filter_ad':"有啥牛的！",
    'timestamp':1131426840,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1936087",
    'user_name':"皖人在秦",
    'weight':0} ]],
"w3":['一家之言而已',[
    {
    '_id':"http://www.tianya.cn/5341840",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w3", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"文化人士并不代表就是真理,只是冯某人的一家之言.务源文化是客观存在,代表不代表徽文化,或者代表不代表赣文化,对他而言,权作参考吧,不必太过上心.",
    'content168':"文化人士并不代表就是真理,只是冯某人的一家之言.务源文化是客观存在,代表不代表徽文化,或者代表不代表赣文化,对他而言,权作参考吧,不必太过上心.",
    'date':"2005-11-07",
    'datetime':"2005/11/7  21:41:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29697,
    'id':"http://www.tianya.cn/5341840",
    'last_modify':1459694057.29697,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/5341840",
    'same_from_sentiment':"http://www.tianya.cn/5341840",
    'sentiment':0,
    'text':"文化人士并不代表就是真理,只是冯某人的一家之言.务源文化是客观存在,代表不代表徽文化,或者代表不代表赣文化,对他而言,权作参考吧,不必太过上心.",
    'text_filter_ad':"文化人士并不代表就是真理,只是冯某人的一家之言.务源文化是客观存在,代表不代表徽文化,或者代表不代表赣文化,对他而言,权作参考吧,不必太过上心.",
    'timestamp':1131370860,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/5341840",
    'user_name':"渐水东流",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/1271746",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w3", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"大家说话并不就是大家之言",
    'content168':"大家说话并不就是大家之言",
    'date':"2005-11-13",
    'datetime':"2005/11/13  17:43:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29342,
    'id':"http://www.tianya.cn/1271746",
    'last_modify':1459694057.29342,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1271746",
    'same_from_sentiment':"http://www.tianya.cn/1271746",
    'sentiment':0,
    'text':"大家说话并不就是大家之言",
    'text_filter_ad':"大家说话并不就是大家之言",
    'timestamp':1131874980,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1271746",
    'user_name':"简语",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/1160142",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w3", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"真理是靠检验出来的，不是哪位名人嘴里说出来的，他爱说就随他说去吧。至少我们不会限制人家的言论自由，当然，说了这些，免不了会招来点口水的，也好，就当给他洗洗脸，清醒一下。",
    'content168':"真理是靠检验出来的，不是哪位名人嘴里说出来的，他爱说就随他说去吧。至少我们不会限制人家的言论自由，当然，说了这些，免不了会招来点口水的，也好，就当给他洗洗脸，清醒一下。",
    'date':"2005-11-27",
    'datetime':"2005/11/27  23:56:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29199,
    'id':"http://www.tianya.cn/1160142",
    'last_modify':1459694057.29199,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1160142",
    'same_from_sentiment':"http://www.tianya.cn/1160142",
    'sentiment':0,
    'text':"真理是靠检验出来的，不是哪位名人嘴里说出来的，他爱说就随他说去吧。至少我们不会限制人家的言论自由，当然，说了这些，免不了会招来点口水的，也好，就当给他洗洗脸，清醒一下。",
    'text_filter_ad':"真理是靠检验出来的，不是哪位名人嘴里说出来的，他爱说就随他说去吧。至少我们不会限制人家的言论自由，当然，说了这些，免不了会招来点口水的，也好，就当给他洗洗脸，清醒一下。",
    'timestamp':1133106960,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1160142",
    'user_name':"黟山游侠",
    'weight':0}   
]]};

var news_data = 
{1:[],
2:[    {
    '_id':"http://www.tianya.cn/3042092",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w2", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"冯骥才（1942～）,当代作家。原籍浙江慈溪. 以为自己是谁？ 本来对他还有好感的。现在。。。。。。。。。",
    'content168':"冯骥才（1942～）,当代作家。原籍浙江慈溪. 以为自己是谁？ 本来对他还有好感的。现在。。。。。。。。。",
    'date':"2005-11-27",
    'datetime':"2005/11/27 20:13",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29136,
    'id':"http://www.tianya.cn/3042092",
    'last_modify':1459694057.29136,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/3042092",
    'same_from_sentiment':"http://www.tianya.cn/3042092",
    'sentiment':2,
    'text':"冯骥才（1942～）,当代作家。原籍浙江慈溪. 以为自己是谁？ 本来对他还有好感的。现在。。。。。。。。。",
    'text_filter_ad':"冯骥才（1942～）,当代作家。原籍浙江慈溪. 以为自己是谁？ 本来对他还有好感的。现在。。。。。。。。。",
    'timestamp':1133093580,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/3042092",
    'user_name':"徽州余",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/5247895",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w2", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"图片不是已经告诉我们了吗，此君在闭在眼睛说瞎话",
    'content168':"图片不是已经告诉我们了吗，此君在闭在眼睛说瞎话",
    'date':"2005-11-12",
    'datetime':"2005/11/12  14:44:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29273,
    'id':"http://www.tianya.cn/5247895",
    'last_modify':1459694057.29273,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/5247895",
    'same_from_sentiment':"http://www.tianya.cn/5247895",
    'sentiment':2,
    'text':"图片不是已经告诉我们了吗，此君在闭在眼睛说瞎话",
    'text_filter_ad':"图片不是已经告诉我们了吗，此君在闭在眼睛说瞎话",
    'timestamp':1131777840,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/5247895",
    'user_name':"kur01",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/1936087",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w2", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"有啥牛的！",
    'content168':"有啥牛的！",
    'date':"2005-11-08",
    'datetime':"2005/11/8  13:14:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.2957,
    'id':"http://www.tianya.cn/1936087",
    'last_modify':1459694057.2957,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1936087",
    'same_from_sentiment':"http://www.tianya.cn/1936087",
    'sentiment':2,
    'text':"有啥牛的！",
    'text_filter_ad':"有啥牛的！",
    'timestamp':1131426840,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1936087",
    'user_name':"皖人在秦",
    'weight':0},
    ,
    {
    '_id':"http://www.tianya.cn/5341840",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w3", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"文化人士并不代表就是真理,只是冯某人的一家之言.务源文化是客观存在,代表不代表徽文化,或者代表不代表赣文化,对他而言,权作参考吧,不必太过上心.",
    'content168':"文化人士并不代表就是真理,只是冯某人的一家之言.务源文化是客观存在,代表不代表徽文化,或者代表不代表赣文化,对他而言,权作参考吧,不必太过上心.",
    'date':"2005-11-07",
    'datetime':"2005/11/7  21:41:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29697,
    'id':"http://www.tianya.cn/5341840",
    'last_modify':1459694057.29697,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/5341840",
    'same_from_sentiment':"http://www.tianya.cn/5341840",
    'sentiment':0,
    'text':"文化人士并不代表就是真理,只是冯某人的一家之言.务源文化是客观存在,代表不代表徽文化,或者代表不代表赣文化,对他而言,权作参考吧,不必太过上心.",
    'text_filter_ad':"文化人士并不代表就是真理,只是冯某人的一家之言.务源文化是客观存在,代表不代表徽文化,或者代表不代表赣文化,对他而言,权作参考吧,不必太过上心.",
    'timestamp':1131370860,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/5341840",
    'user_name':"渐水东流",
    'weight':0}],
3:[    {
    '_id':"http://www.tianya.cn/3618067",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"近来书话上有关徽州的议题挺多的.这是从天涯徽文化版转来的. 冯先生难道不知傩文化是很古老的文化遗存,南方之傩大体相同,而徽文化的形成,当初一府六县的格局是在一千年前左右形成的. 冯先生此话讲得太随意了,为冯先生羞也.",
    'content168':"近来书话上有关徽州的议题挺多的.这是从天涯徽文化版转来的. 冯先生难道不知傩文化是很古老的文化遗存,南方之傩大体相同,而徽文化的形成,当初一府六县的格局是在一千年前左右形成的. 冯先生此话讲得太随意了,为冯先生羞也.",
    'date':"2005-11-11",
    'datetime':"2005/11/11 12:14",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29001,
    'id':"http://www.tianya.cn/3618067",
    'last_modify':1459694057.29001,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-books-69229-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/3618067",
    'same_from_sentiment':"http://www.tianya.cn/3618067",
    'sentiment':3,
    'text':"近来书话上有关徽州的议题挺多的.这是从天涯徽文化版转来的. 冯先生难道不知傩文化是很古老的文化遗存,南方之傩大体相同,而徽文化的形成,当初一府六县的格局是在一千年前左右形成的. 冯先生此话讲得太随意了,为冯先生羞也.",
    'text_filter_ad':"近来书话上有关徽州的议题挺多的.这是从天涯徽文化版转来的. 冯先生难道不知傩文化是很古老的文化遗存,南方之傩大体相同,而徽文化的形成,当初一府六县的格局是在一千年前左右形成的. 冯先生此话讲得太随意了,为冯先生羞也.",
    'timestamp':1131682440,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/3618067",
    'user_name':"度假旅游",
    'weight':0},    {
    '_id':"http://www.tianya.cn/934015",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"几天没碰报纸，刚刚知道。这大冯先生是怎么回事儿了。 傩 徽文化， 一种混乱的比较，他要到务源乡下去呀，会吃许多唾沫星子的。",
    'content168':"几天没碰报纸，刚刚知道。这大冯先生是怎么回事儿了。 傩 徽文化， 一种混乱的比较，他要到务源乡下去呀，会吃许多唾沫星子的。",
    'date':"2005-11-11",
    'datetime':"2005/11/11 15:43",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29071,
    'id':"http://www.tianya.cn/934015",
    'last_modify':1459694057.29071,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-books-69229-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/934015",
    'same_from_sentiment':"http://www.tianya.cn/934015",
    'sentiment':3,
    'text':"几天没碰报纸，刚刚知道。这大冯先生是怎么回事儿了。 傩 徽文化， 一种混乱的比较，他要到务源乡下去呀，会吃许多唾沫星子的。",
    'text_filter_ad':"几天没碰报纸，刚刚知道。这大冯先生是怎么回事儿了。 傩 徽文化， 一种混乱的比较，他要到务源乡下去呀，会吃许多唾沫星子的。",
    'timestamp':1131694980,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/934015",
    'user_name':"黄山李平易",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/1649347",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"新安老童生 于2005-11-07 09:41 PM 发表评论： 看看一个年轻的婺源中学历史老师的作为： 办好了！ 刚才找到他们一伙人下榻的江湾大酒店，被告知他的房号不详。我琢磨着总不能硬闯吧，就先行回到办公室。拿了本子桐的《徽州少年歌》，又风弛往江湾。问总台要了纸笔，以下是我对他说的话：冯老师 你好！作为民俗学领域里的知名专家，我想，对于古物、民俗原汁原味的重要性，您想必是慧眼独具的。作为一个拓展，中华丰富的地域文化又何尝不是如此得呢？婺源，是徽州不可分割的一部分，此是亘古不变的真理。我真诚的希望，对于昨天的讲话，只是您泱泱如大海般学识中尚未探测到的一个盲点而已。毕竟，人非圣贤，孰能无过。您说呢？ 有缘再叙 祝您一路顺风！ 落款：徽州婺源人 即日 我将写好的纸条夹在书里。最后我拜托值班小姐第二天早上一定要转交到他上，那个高高大大 诙谐幽默的天津汉子手里...",
    'content168':"新安老童生 于2005-11-07 09:41 PM 发表评论： 看看一个年轻的婺源中学历史老师的作为： 办好了！ 刚才找到他们一伙人下榻的江湾大酒店，被告知他的房号不详。我琢磨着总不能硬闯吧，就先行回到办公室。拿了本子桐的《徽州少年歌》，又风弛往江湾。问总台要了纸笔，以下是我对他说的话：冯老师 你好！作为民俗学领域里的知名专家，我想，对于古物、民俗原汁原味的重要性，您想必是慧眼独具的。作为一个拓展，中华丰富的地域文化又何尝不是如此得呢？婺源，是徽州不可分割的一部分，此是亘古不变的真理。我真诚的希望，对于昨天的讲话，只是您泱泱如大海般学识中尚未探测到的一个盲点而已。毕竟，人非圣贤，孰能无过。您说呢？ 有缘再叙 祝您一路顺风！ 落款：徽州婺源人 即日 我将写好的纸条夹在书里。最后我拜托值班小姐第二天早上一定要转交到他上，那个高高大大 诙谐幽默的天津汉子手里...",
    'date':"2005-11-9",
    'datetime':"2005/11/9  9:19:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29632,
    'id':"http://www.tianya.cn/1649347",
    'last_modify':1459694057.29632,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1649347",
    'same_from_sentiment':"http://www.tianya.cn/1649347",
    'sentiment':1,
    'text':"新安老童生 于2005-11-07 09:41 PM 发表评论： 看看一个年轻的婺源中学历史老师的作为： 办好了！ 刚才找到他们一伙人下榻的江湾大酒店，被告知他的房号不详。我琢磨着总不能硬闯吧，就先行回到办公室。拿了本子桐的《徽州少年歌》，又风弛往江湾。问总台要了纸笔，以下是我对他说的话：冯老师 你好！作为民俗学领域里的知名专家，我想，对于古物、民俗原汁原味的重要性，您想必是慧眼独具的。作为一个拓展，中华丰富的地域文化又何尝不是如此得呢？婺源，是徽州不可分割的一部分，此是亘古不变的真理。我真诚的希望，对于昨天的讲话，只是您泱泱如大海般学识中尚未探测到的一个盲点而已。毕竟，人非圣贤，孰能无过。您说呢？ 有缘再叙 祝您一路顺风！ 落款：徽州婺源人 即日 我将写好的纸条夹在书里。最后我拜托值班小姐第二天早上一定要转交到他上，那个高高大大 诙谐幽默的天津汉子手里...",
    'text_filter_ad':"新安老童生 于2005-11-07 09:41 PM 发表评论： 看看一个年轻的婺源中学历史老师的作为： 办好了！ 刚才找到他们一伙人下榻的江湾大酒店，被告知他的房号不详。我琢磨着总不能硬闯吧，就先行回到办公室。拿了本子桐的《徽州少年歌》，又风弛往江湾。问总台要了纸笔，以下是我对他说的话：冯老师 你好！作为民俗学领域里的知名专家，我想，对于古物、民俗原汁原味的重要性，您想必是慧眼独具的。作为一个拓展，中华丰富的地域文化又何尝不是如此得呢？婺源，是徽州不可分割的一部分，此是亘古不变的真理。我真诚的希望，对于昨天的讲话，只是您泱泱如大海般学识中尚未探测到的一个盲点而已。毕竟，人非圣贤，孰能无过。您说呢？ 有缘再叙 祝您一路顺风！ 落款：徽州婺源人 即日 我将写好的纸条夹在书里。最后我拜托值班小姐第二天早上一定要转交到他上，那个高高大大 诙谐幽默的天津汉子手里...",
    'timestamp':1131424440,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1649347",
    'user_name':"冰清玉洁水结冰",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/1160142",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w3", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"真理是靠检验出来的，不是哪位名人嘴里说出来的，他爱说就随他说去吧。至少我们不会限制人家的言论自由，当然，说了这些，免不了会招来点口水的，也好，就当给他洗洗脸，清醒一下。",
    'content168':"真理是靠检验出来的，不是哪位名人嘴里说出来的，他爱说就随他说去吧。至少我们不会限制人家的言论自由，当然，说了这些，免不了会招来点口水的，也好，就当给他洗洗脸，清醒一下。",
    'date':"2005-11-27",
    'datetime':"2005/11/27  23:56:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29199,
    'id':"http://www.tianya.cn/1160142",
    'last_modify':1459694057.29199,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1160142",
    'same_from_sentiment':"http://www.tianya.cn/1160142",
    'sentiment':0,
    'text':"真理是靠检验出来的，不是哪位名人嘴里说出来的，他爱说就随他说去吧。至少我们不会限制人家的言论自由，当然，说了这些，免不了会招来点口水的，也好，就当给他洗洗脸，清醒一下。",
    'text_filter_ad':"真理是靠检验出来的，不是哪位名人嘴里说出来的，他爱说就随他说去吧。至少我们不会限制人家的言论自由，当然，说了这些，免不了会招来点口水的，也好，就当给他洗洗脸，清醒一下。",
    'timestamp':1133106960,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1160142",
    'user_name':"黟山游侠",
    'weight':0}],
0:[{
    '_id':"http://www.tianya.cn/411863",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"冯先生确实弄错了。解放后行政区划的改变，不会把徽文化改变掉。从这个行政区划个案的调整看，我们今后在改变行政区划时，要注意从传统文化的角度审视一下。",
    'content168':"冯先生确实弄错了。解放后行政区划的改变，不会把徽文化改变掉。从这个行政区划个案的调整看，我们今后在改变行政区划时，要注意从传统文化的角度审视一下。",
    'date':"2005-11-12",
    'datetime':"2005/11/12 12:20",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.28865,
    'id':"http://www.tianya.cn/411863",
    'last_modify':1459694057.28865,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-books-69229-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/411863",
    'same_from_sentiment':"http://www.tianya.cn/411863",
    'sentiment':0,
    'text':"冯先生确实弄错了。解放后行政区划的改变，不会把徽文化改变掉。从这个行政区划个案的调整看，我们今后在改变行政区划时，要注意从传统文化的角度审视一下。",
    'text_filter_ad':"冯先生确实弄错了。解放后行政区划的改变，不会把徽文化改变掉。从这个行政区划个案的调整看，我们今后在改变行政区划时，要注意从传统文化的角度审视一下。",
    'timestamp':1131769200,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/411863",
    'user_name':"xydh0820",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/196339",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"婺源当然属于徽文化圈，绩溪更是徽文化的发祥地之一。 冯先生确实弄错了，婺源虽然划给江西省半个世纪，可一直怀有“徽州心”。晓起街上的摊贩说：“我们是徽州人。” 说起来，江西东北部浮梁一带的文化遗存，倒是不纯粹的赣文化。从建筑、饮食、祠堂等方面看，那里更接近徽文化。",
    'content168':"婺源当然属于徽文化圈，绩溪更是徽文化的发祥地之一。 冯先生确实弄错了，婺源虽然划给江西省半个世纪，可一直怀有“徽州心”。晓起街上的摊贩说：“我们是徽州人。” 说起来，江西东北部浮梁一带的文化遗存，倒是不纯粹的赣文化。从建筑、饮食、祠堂等方面看，那里更接近徽文化。",
    'date':"2005-11-12",
    'datetime':"2005/11/12 11:55",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.28932,
    'id':"http://www.tianya.cn/196339",
    'last_modify':1459694057.28932,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-books-69229-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/196339",
    'same_from_sentiment':"http://www.tianya.cn/196339",
    'sentiment':0,
    'text':"婺源当然属于徽文化圈，绩溪更是徽文化的发祥地之一。 冯先生确实弄错了，婺源虽然划给江西省半个世纪，可一直怀有“徽州心”。晓起街上的摊贩说：“我们是徽州人。” 说起来，江西东北部浮梁一带的文化遗存，倒是不纯粹的赣文化。从建筑、饮食、祠堂等方面看，那里更接近徽文化。",
    'text_filter_ad':"婺源当然属于徽文化圈，绩溪更是徽文化的发祥地之一。 冯先生确实弄错了，婺源虽然划给江西省半个世纪，可一直怀有“徽州心”。晓起街上的摊贩说：“我们是徽州人。” 说起来，江西东北部浮梁一带的文化遗存，倒是不纯粹的赣文化。从建筑、饮食、祠堂等方面看，那里更接近徽文化。",
    'timestamp':1131767700,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/196339",
    'user_name':"注注",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/3143099",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"相信冯老应该是我们的朋友，不会是徽州的敌人，一个视文化为灵魂、对文化如此重视的人怎么会是徽文化的敌人，可能他对徽文化不了解吧，徽州同胞们我们应该化悲痛为力量，全体徽州人团结起来，今后要加强对外宣传，不要让我们的祖宗遗产再让别人一点点蚕食，我们徽文化当前应该是四面楚歌，南有赣蛮、北有皖军、东有吴越、西有桐城派都说徽文化属于他们范畴，大家都盯着“徽文化、徽商”，希望借此机会为徽商、徽文化正名。",
    'content168':"相信冯老应该是我们的朋友，不会是徽州的敌人，一个视文化为灵魂、对文化如此重视的人怎么会是徽文化的敌人，可能他对徽文化不了解吧，徽州同胞们我们应该化悲痛为力量，全体徽州人团结起来，今后要加强对外宣传，不要让我们的祖宗遗产再让别人一点点蚕食，我们徽文化当前应该是四面楚歌，南有赣蛮、北有皖军、东有吴越、西有桐城派都说徽文化属于他们范畴，大家都盯着“徽文化、徽商”，希望借此机会为徽商、徽文化正名。",
    'date':"2005-11-9",
    'datetime':"2005/11/9  13:16:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29413,
    'id':"http://www.tianya.cn/3143099",
    'last_modify':1459694057.29413,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/3143099",
    'same_from_sentiment':"http://www.tianya.cn/3143099",
    'sentiment':0,
    'text':"相信冯老应该是我们的朋友，不会是徽州的敌人，一个视文化为灵魂、对文化如此重视的人怎么会是徽文化的敌人，可能他对徽文化不了解吧，徽州同胞们我们应该化悲痛为力量，全体徽州人团结起来，今后要加强对外宣传，不要让我们的祖宗遗产再让别人一点点蚕食，我们徽文化当前应该是四面楚歌，南有赣蛮、北有皖军、东有吴越、西有桐城派都说徽文化属于他们范畴，大家都盯着“徽文化、徽商”，希望借此机会为徽商、徽文化正名。",
    'text_filter_ad':"相信冯老应该是我们的朋友，不会是徽州的敌人，一个视文化为灵魂、对文化如此重视的人怎么会是徽文化的敌人，可能他对徽文化不了解吧，徽州同胞们我们应该化悲痛为力量，全体徽州人团结起来，今后要加强对外宣传，不要让我们的祖宗遗产再让别人一点点蚕食，我们徽文化当前应该是四面楚歌，南有赣蛮、北有皖军、东有吴越、西有桐城派都说徽文化属于他们范畴，大家都盯着“徽文化、徽商”，希望借此机会为徽商、徽文化正名。",
    'timestamp':1131513360,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/3143099",
    'user_name':"振兴徽商",
    'weight':0},
    {
    '_id':"http://www.tianya.cn/1841017",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w1", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"【转贴】冯骥才一语激起千层浪 婺源文化的主体不再是徽文化？ █ 吴国辉 【2005年11月09日】 本报讯 11月7日上午，在江西省婺源县举办的中国乡村文化旅游论坛上，著名作家冯骥才先生回答听众提问时，称婺源文化受外来文化影响很深，不是单一的徽文化。这一言论迅即引起徽州与婺源两地数百位网民的非议，一位历史教师还赠书冯先生，称要启蒙他对徽文化的了解。昨日，徽文化研究学者再次表态：婺源文化的主体就是徽文化 。 冯骥才：婺源文化是多元的 在婺源县新华书店上班的潘女士告诉记者，这次论坛有600余听众和学者参加，冯骥才先生是最后一个演讲者。演讲结束后，论坛主持人让听众自由提问，前四个问题问得波澜不惊，冯先生的回答也游刃有余。 潘女士回忆称，婺源县某中学历史专业的齐老师和她商量后，提出最后一个问题，主要意思是婺源文化是根植于徽州文化的，是徽文化不可分割的重要组成部分，可是现在提婺源文化的时候很少提到徽文化，请问他对此是怎么看的。 冯骥才的回答很干脆，他称婺源的民居是徽派的，但婺源处在三省交界，受外来文化的影响很深，婺源文化不是单一的，是多元文化，如婺源的傩与江西其他地方的傩有很多相似之处，和徽傩不一样。他还称婺源文化要有自己的特色，不要一成不变。 冯先生的回答当场引起台下听众的争议，由于时间仓促，论坛主办方随即宣布论坛结束。 网友：冯先生的言论有些偏颇 据悉，论坛结束后，潘女士等10多位听众觉得冯先生的言论有偏颇之处，齐老师认为冯先生虽然知识渊博，但是对徽文化不一定全盘了解。 据悉，11月7日下午开始，婺源县及黄山市多家网站上，出现了网民对冯先生言论的批驳之词。数百位网民参与对冯先生言论的评点，绝大多数网民认为婺源县作为古徽州的六县之一，接受江西省行政区划管理仅数十年，文化上会受到江西省地方文化的一些影响，主体仍然是属于徽文化的。 有学者称，网民针对冯骥才先生言论的非议，属于正常的辩论，说明徽州人对徽文化是热爱与尊重的。 徽学专家：婺源文化主体就是徽文化 11月8日下午，记者就民间对冯骥才先生言论非议的焦点，采访了我省著名的徽学研究专家方利山先生。方先生认为，婺源文化是徽文化的重要组成部分，它受到了其他文化的影响，但根源仍然是徽文化。 方先生告诉记者，2000多年以来，婺源县一直就是古徽州的一部分，直到1937年才暂时脱离徽州，1947年回到安徽省。1949年，该县再次被划归江西省，行政区划上才正式脱离徽州。但是，由于数千年以来所受到的影响，婺源县的建筑风格、民风民俗、地方语言、教育医学等各方面，都与徽州密不可分，形成地域整体文化。 方先生也认为，徽文化是一个整体，浙江的淳安县、江西省的浮梁县、婺源县及我省的绩溪县、泾县等区域都受到了它的影响。有些区县脱离徽州行政管理较久，或者处于数省交界处，其建筑的风格等会受到一些外来文化的影响，但是其主体文化绝对不会改变的。 婺源的主体文化就是徽文化，不能因为行政区划的调整，或者因为其受到其他文化的一些影响，就将主体文化错判断成外来文化。徽州文化作为一个整体而存在，它所影响到的区域和文化价值等，还需要有关部门进一步宣扬，对徽文化的保护与发展也是永恒的。 (本报记者 吴永泉)",
    'content168':"【转贴】冯骥才一语激起千层浪 婺源文化的主体不再是徽文化？ █ 吴国辉 【2005年11月09日】 本报讯 11月7日上午，在江西省婺源县举办的中国乡村文化旅游论坛上，著名作家冯骥才先生回答听众提问时，称婺源文化受外来文化影响很深，不是单一的徽文化。这一言论迅即引起徽州与婺源两地数百位网民的非议，一位历史教师还赠书冯先生，称要启蒙他对徽文化的了解。昨日，徽文化研究学者再次表态：婺源文化的主体就是徽文化 。 冯骥才：婺源文化是多元的 在婺源县新华书店上班的潘女士告诉记者，这次论坛有600余听众和学者参加，冯骥才先生是最后一个演讲者。演讲结束后，论坛主持人让听众自由提问，前四个问题问得波澜不惊，冯先生的回答也游刃有余。 潘女士回忆称，婺源县某中学历史专业的齐老师和她商量后，提出最后一个问题，主要意思是婺源文化是根植于徽州文化的，是徽文化不可分割的重要组成部分，可是现在提婺源文化的时候很少提到徽文化，请问他对此是怎么看的。 冯骥才的回答很干脆，他称婺源的民居是徽派的，但婺源处在三省交界，受外来文化的影响很深，婺源文化不是单一的，是多元文化，如婺源的傩与江西其他地方的傩有很多相似之处，和徽傩不一样。他还称婺源文化要有自己的特色，不要一成不变。 冯先生的回答当场引起台下听众的争议，由于时间仓促，论坛主办方随即宣布论坛结束。 网友：冯先生的言论有些偏颇 据悉，论坛结束后，潘女士等10多位听众觉得冯先生的言论有偏颇之处，齐老师认为冯先生虽然知识渊博，但是对徽文化不一定全盘了解。 据悉，11月7日下午开始，婺源县及黄山市多家网站上，出现了网民对冯先生言论的批驳之词。数百位网民参与对冯先生言论的评点，绝大多数网民认为婺源县作为古徽州的六县之一，接受江西省行政区划管理仅数十年，文化上会受到江西省地方文化的一些影响，主体仍然是属于徽文化的。 有学者称，网民针对冯骥才先生言论的非议，属于正常的辩论，说明徽州人对徽文化是热爱与尊重的。 徽学专家：婺源文化主体就是徽文化 11月8日下午，记者就民间对冯骥才先生言论非议的焦点，采访了我省著名的徽学研究专家方利山先生。方先生认为，婺源文化是徽文化的重要组成部分，它受到了其他文化的影响，但根源仍然是徽文化。 方先生告诉记者，2000多年以来，婺源县一直就是古徽州的一部分，直到1937年才暂时脱离徽州，1947年回到安徽省。1949年，该县再次被划归江西省，行政区划上才正式脱离徽州。但是，由于数千年以来所受到的影响，婺源县的建筑风格、民风民俗、地方语言、教育医学等各方面，都与徽州密不可分，形成地域整体文化。 方先生也认为，徽文化是一个整体，浙江的淳安县、江西省的浮梁县、婺源县及我省的绩溪县、泾县等区域都受到了它的影响。有些区县脱离徽州行政管理较久，或者处于数省交界处，其建筑的风格等会受到一些外来文化的影响，但是其主体文化绝对不会改变的。 婺源的主体文化就是徽文化，不能因为行政区划的调整，或者因为其受到其他文化的一些影响，就将主体文化错判断成外来文化。徽州文化作为一个整体而存在，它所影响到的区域和文化价值等，还需要有关部门进一步宣扬，对徽文化的保护与发展也是永恒的。 (本报记者 吴永泉)",
    'date':"2005-11-9",
    'datetime':"2005/11/9  9:19:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29487,
    'id':"http://www.tianya.cn/1841017",
    'last_modify':1459694057.29487,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1841017",
    'same_from_sentiment':"http://www.tianya.cn/1841017",
    'sentiment':0,
    'text':"【转贴】冯骥才一语激起千层浪 婺源文化的主体不再是徽文化？ █ 吴国辉 【2005年11月09日】 本报讯 11月7日上午，在江西省婺源县举办的中国乡村文化旅游论坛上，著名作家冯骥才先生回答听众提问时，称婺源文化受外来文化影响很深，不是单一的徽文化。这一言论迅即引起徽州与婺源两地数百位网民的非议，一位历史教师还赠书冯先生，称要启蒙他对徽文化的了解。昨日，徽文化研究学者再次表态：婺源文化的主体就是徽文化 。 冯骥才：婺源文化是多元的 在婺源县新华书店上班的潘女士告诉记者，这次论坛有600余听众和学者参加，冯骥才先生是最后一个演讲者。演讲结束后，论坛主持人让听众自由提问，前四个问题问得波澜不惊，冯先生的回答也游刃有余。 潘女士回忆称，婺源县某中学历史专业的齐老师和她商量后，提出最后一个问题，主要意思是婺源文化是根植于徽州文化的，是徽文化不可分割的重要组成部分，可是现在提婺源文化的时候很少提到徽文化，请问他对此是怎么看的。 冯骥才的回答很干脆，他称婺源的民居是徽派的，但婺源处在三省交界，受外来文化的影响很深，婺源文化不是单一的，是多元文化，如婺源的傩与江西其他地方的傩有很多相似之处，和徽傩不一样。他还称婺源文化要有自己的特色，不要一成不变。 冯先生的回答当场引起台下听众的争议，由于时间仓促，论坛主办方随即宣布论坛结束。 网友：冯先生的言论有些偏颇 据悉，论坛结束后，潘女士等10多位听众觉得冯先生的言论有偏颇之处，齐老师认为冯先生虽然知识渊博，但是对徽文化不一定全盘了解。 据悉，11月7日下午开始，婺源县及黄山市多家网站上，出现了网民对冯先生言论的批驳之词。数百位网民参与对冯先生言论的评点，绝大多数网民认为婺源县作为古徽州的六县之一，接受江西省行政区划管理仅数十年，文化上会受到江西省地方文化的一些影响，主体仍然是属于徽文化的。 有学者称，网民针对冯骥才先生言论的非议，属于正常的辩论，说明徽州人对徽文化是热爱与尊重的。 徽学专家：婺源文化主体就是徽文化 11月8日下午，记者就民间对冯骥才先生言论非议的焦点，采访了我省著名的徽学研究专家方利山先生。方先生认为，婺源文化是徽文化的重要组成部分，它受到了其他文化的影响，但根源仍然是徽文化。 方先生告诉记者，2000多年以来，婺源县一直就是古徽州的一部分，直到1937年才暂时脱离徽州，1947年回到安徽省。1949年，该县再次被划归江西省，行政区划上才正式脱离徽州。但是，由于数千年以来所受到的影响，婺源县的建筑风格、民风民俗、地方语言、教育医学等各方面，都与徽州密不可分，形成地域整体文化。 方先生也认为，徽文化是一个整体，浙江的淳安县、江西省的浮梁县、婺源县及我省的绩溪县、泾县等区域都受到了它的影响。有些区县脱离徽州行政管理较久，或者处于数省交界处，其建筑的风格等会受到一些外来文化的影响，但是其主体文化绝对不会改变的。 婺源的主体文化就是徽文化，不能因为行政区划的调整，或者因为其受到其他文化的一些影响，就将主体文化错判断成外来文化。徽州文化作为一个整体而存在，它所影响到的区域和文化价值等，还需要有关部门进一步宣扬，对徽文化的保护与发展也是永恒的。 (本报记者 吴永泉)",
    'text_filter_ad':"【转贴】冯骥才一语激起千层浪 婺源文化的主体不再是徽文化？ █ 吴国辉 【2005年11月09日】 本报讯 11月7日上午，在江西省婺源县举办的中国乡村文化旅游论坛上，著名作家冯骥才先生回答听众提问时，称婺源文化受外来文化影响很深，不是单一的徽文化。这一言论迅即引起徽州与婺源两地数百位网民的非议，一位历史教师还赠书冯先生，称要启蒙他对徽文化的了解。昨日，徽文化研究学者再次表态：婺源文化的主体就是徽文化 。 冯骥才：婺源文化是多元的 在婺源县新华书店上班的潘女士告诉记者，这次论坛有600余听众和学者参加，冯骥才先生是最后一个演讲者。演讲结束后，论坛主持人让听众自由提问，前四个问题问得波澜不惊，冯先生的回答也游刃有余。 潘女士回忆称，婺源县某中学历史专业的齐老师和她商量后，提出最后一个问题，主要意思是婺源文化是根植于徽州文化的，是徽文化不可分割的重要组成部分，可是现在提婺源文化的时候很少提到徽文化，请问他对此是怎么看的。 冯骥才的回答很干脆，他称婺源的民居是徽派的，但婺源处在三省交界，受外来文化的影响很深，婺源文化不是单一的，是多元文化，如婺源的傩与江西其他地方的傩有很多相似之处，和徽傩不一样。他还称婺源文化要有自己的特色，不要一成不变。 冯先生的回答当场引起台下听众的争议，由于时间仓促，论坛主办方随即宣布论坛结束。 网友：冯先生的言论有些偏颇 据悉，论坛结束后，潘女士等10多位听众觉得冯先生的言论有偏颇之处，齐老师认为冯先生虽然知识渊博，但是对徽文化不一定全盘了解。 据悉，11月7日下午开始，婺源县及黄山市多家网站上，出现了网民对冯先生言论的批驳之词。数百位网民参与对冯先生言论的评点，绝大多数网民认为婺源县作为古徽州的六县之一，接受江西省行政区划管理仅数十年，文化上会受到江西省地方文化的一些影响，主体仍然是属于徽文化的。 有学者称，网民针对冯骥才先生言论的非议，属于正常的辩论，说明徽州人对徽文化是热爱与尊重的。 徽学专家：婺源文化主体就是徽文化 11月8日下午，记者就民间对冯骥才先生言论非议的焦点，采访了我省著名的徽学研究专家方利山先生。方先生认为，婺源文化是徽文化的重要组成部分，它受到了其他文化的影响，但根源仍然是徽文化。 方先生告诉记者，2000多年以来，婺源县一直就是古徽州的一部分，直到1937年才暂时脱离徽州，1947年回到安徽省。1949年，该县再次被划归江西省，行政区划上才正式脱离徽州。但是，由于数千年以来所受到的影响，婺源县的建筑风格、民风民俗、地方语言、教育医学等各方面，都与徽州密不可分，形成地域整体文化。 方先生也认为，徽文化是一个整体，浙江的淳安县、江西省的浮梁县、婺源县及我省的绩溪县、泾县等区域都受到了它的影响。有些区县脱离徽州行政管理较久，或者处于数省交界处，其建筑的风格等会受到一些外来文化的影响，但是其主体文化绝对不会改变的。 婺源的主体文化就是徽文化，不能因为行政区划的调整，或者因为其受到其他文化的一些影响，就将主体文化错判断成外来文化。徽州文化作为一个整体而存在，它所影响到的区域和文化价值等，还需要有关部门进一步宣扬，对徽文化的保护与发展也是永恒的。 (本报记者 吴永泉)",
    'timestamp':1131499140,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1841017",
    'user_name':"新安老童生",
    'weight':0}, 
    {
    '_id':"http://www.tianya.cn/1271746",
    'ad_label':0,
    'attitudes_count':0,
    'clusterid':"w3", 
    'comment_source':"天涯", 
    'comments_count':0,
    'content':"大家说话并不就是大家之言",
    'content168':"大家说话并不就是大家之言",
    'date':"2005-11-13",
    'datetime':"2005/11/13  17:43:00",
    'duplicate':true,
    'duplicate_sentiment':true,
    'first_in':1459694057.29342,
    'id':"http://www.tianya.cn/1271746",
    'last_modify':1459694057.29342,
    'location':"",
    'news_content':"",
    'news_id':"http://bbs.tianya.cn/post-310-1067-1.shtml",
    'rub_label':0,
    'same_from':"http://www.tianya.cn/1271746",
    'same_from_sentiment':"http://www.tianya.cn/1271746",
    'sentiment':0,
    'text':"大家说话并不就是大家之言",
    'text_filter_ad':"大家说话并不就是大家之言",
    'timestamp':1131874980,
    'title':"",
    'user_comment_url':"http://www.tianya.cn/1271746",
    'user_name':"简语",
    'weight':0}    
]};


comment = new Comment_opinion(query, start_ts2, end_ts2);
check_comments2(pie_data_point,pie_data_sentiment, cluster_data);


// console.log("QUERY"+QUERY);

//bindSentiMoreClick2();
bindClusterSortClick2(cluster_data);
bindOpinionTabClick2('try');

bindSubeventMoreClick2();
bindSentiSortClick2(news_data);
bindSentimentTabClick2('SentimentTabDiv_w');