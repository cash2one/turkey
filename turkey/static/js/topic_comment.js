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


function Comment_opinion(query, start_ts, end_ts){
	//传进来的参数，可以有
	this.query = query;
	this.start_ts = start_ts;
	this.end_ts = end_ts;
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
        var pie_div = "main_pie";
		var pie_data = [];
		var One_pie_data = {};
		for (var key in data){ 
            // console.log(key)
            // var key_after = '';
            // if(key == "合生,老先生,社会"){
            //     key_after = "一件实事不做的酸文人";
            // }
            // if(key == "骗子,冯骥才,乖孩子"){
            //     key_after = "韩寒夸奖冯骥才说乖孩子真体贴。";
            // }
            // if(key == "中国"){
            //     key_after = "这些人控制着中国文坛";
            // }
            // if(key == "文章,这是,才华"){
            //     key_after = "韩寒真乖文章没了作品不出了";
            // }
            // One_pie_data = {'value': data[key], 'name': key_after};
			One_pie_data = {'value': data[key], 'name': key};
			pie_data.push(One_pie_data);
		}

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
		var myChart = echarts.init(document.getElementById(pie_div));

	    var option = {

	        title : {
	            text: '主题占比分析',
                subtext: '  ',
                // borderWidth:2,
	            x:'center',
                y:'bottom' ,
	            textStyle:{
    	            fontWeight:'lighter',
    	            fontSize: 13,
                    padding: [5,200,5,5]
	            },
                subtextStyle:{
                    fontSize: 12,
                    color: '#ccc',
                    align: 'right',
                }       
	        },
            tooltip : {
                trigger: 'item',
                formatter: function (params) {
                    //var weibo = {'方寒之争':'一如冯这类吃人民的，拿人民的酸文<br>人，一件实事不做的货其实也是社会进步的<br>渣滓。','韩寒真乖文章没了作品不出了': ' 晒。“冯骥才肯定韩寒才华:无须回应代笔门事件<br>”http://t.cn/zOcQdrC， 是不是很自信，习<br>惯于不研究而发表看法？“如果我是韩寒，<br>就不会搭理这事，你爱说什么说什么去，<br>我还是继续写文章，不断地发表作<br>品。”','这些人控制着中国文坛':'原来他还是做鞋主席吖~？ 老<br>不羞~！现在全是这些人控制着中国<br>文坛...','冯骥才做法不妥':'终于承认老冯是个老混蛋了<br>啊！我很欣慰。之前有个致冯冀<br>才的帖子，我说了两句，居然说我不<br>尊重老先生。'}
                    var weibo = {'方韩之争':'这么多人开口骗子，闭口骗子，你用什<br>么证明呢？ 就靠方教主一个判定？ 看来都<br>是喝菊花牌牛奶喝多了。','冯骥才做法不妥':'如果属实老子白喜欢冯骥才了。韩寒这种<br>满嘴炮火的赵括阿逗之辈于国于华夏<br>文明复兴绝对是反面教材！','韩寒真乖文章没了作品不出了':'哈哈，韩寒真乖，文章没了，作品不出了。','这些人控制中国文坛':'@橘子味饼干2012 2012-03-09 09:35:31<br> 原来他还是做鞋主席吖~？ 老不羞~！ -------<br>---------------------- 现在<br>全是这些人控制着中国文坛，麻<br>辣隔壁的，文坛都变成了粪坑！'};
                    var res = params[1]+':'+ params[3]+'%<br>'+ weibo[params[1]];
                   // console.log(params);
                    return res;
                    // var res = 'Function formatter : <br/>' + params[0].name;
                    // for (var i = 0, l = params.length; i < l; i++) {
                    //     res += '<br/>' + params[i].seriesName + ' : ' + params[i].value;
                    // }
                    // return 'loading';
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
	                name:'主题占比分析',
	                type:'pie',
	                radius : '45%',
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
	                center: ['55%', '50%'],
                    roseType : 'area',
	                data: pie_data
	            }
	        ]
	    };
        myChart.setOption(option);
	   // $("#"+pie_div).hideLoading();
	   // 
	   });

},
    //情绪饼图
	SentiPie_function: function(data){
        console.log('afsdjkvnkjfb')
        var pie_div = "senti_pie";
		var pie_data = [];
		var One_pie_data = {};
		for (var key in data){ 
			One_pie_data = {'value': data[key], 'name': key + (data[key]*100).toFixed(2)+"%"};
			pie_data.push(One_pie_data);
		}
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
	    var option = {
            color:['#3E13AF','#FF1800','#FFA900','#CD0074','#00C12B','#7109AA','#1142AA',
        '#9FEE00','#9BCA63','#B5C334','#E87C25','#27727B','#D7504B','#C6E579','#F4E001'],
	        title : {
	            text: '情绪占比分析',
	            x:'center', 
                y:'bottom',
	            textStyle:{
	            fontWeight:'lighter',
	            fontSize: 13,
	            },       
	           subtext: '  ',
                x:'center',
                y:'bottom' ,
                textStyle:{
                    fontWeight:'lighter',
                    fontSize: 13,
                    padding: [5,200,5,5]
                },
                subtextStyle:{
                    fontSize: 12,
                    color: '#ccc',
                    align: 'right',
                }       
            },
            tooltip:{
                trigger: 'item',
                formatter: "{b} "
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
                          }//,
                         // color:function (value){ return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6); }
                    //    color: function(params) {
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
	                center: ['50%', '50%'],
                    roseType : 'area',
	                data: pie_data
	            }
	        ]
	    };
	    var myChart = echarts.init(document.getElementById(pie_div));
	    myChart.setOption(option);});
	    $("#"+pie_div).hideLoading();
	},

	//新闻
	News_function0: function(data){
        //console.log(data);
        global_comments_data = data;
        var select_sentiment = 1;
        refreshDrawComments0(data, select_sentiment);
	},

    Cluster_function: function(data){
        for(var key in data){
            if(data[key][0] == "合生,老先生,社会,无下"){
                data[key][0] = "一件实事不做的酸文人";
            }
            if(data[key][0] == "骗子,冯骥才,乖孩子,时代周刊,脑袋"){
                data[key][0] = "韩寒夸奖冯骥才说乖孩子真体贴。";
            }
            if(data[key][0] == "中国"){
                data[key][0] = "这些人控制着中国文坛";
            }
            if(data[key][0] == "文章,这是,才华,作品,事件"){
                data[key][0] = "韩寒真乖文章没了作品不出了";
            }
        }
        global_comments_opinion = data;

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

        refreshDrawOpinionTab(tabs_list, select_tab);
        refreshDrawCommentsOpinion0(select_data);
    },
}

function refreshDrawOpinionTab(tabs_list, select_tab){
    $("#OpinionTabDiv").empty();
    var html = '';
    for(var i=0; i < tabs_list.length; i++){
        var clusterid = tabs_list[i][0];
        var words = tabs_list[i][1];
        if(select_tab == clusterid){
            html += '<a clusterid="' + clusterid + '" class="tabLi gColor1 curr" href="javascript:;" style="display: block;">';
        }
        else{
            html += '<a clusterid="' + clusterid + '" class="tabLi gColor1" href="javascript:;" style="display: block;">';
        }
        html += '<div class="nmTab">' + words  + '</div>';
        html += '<div class="hvTab">' + words + '</div>';
        html += '</a>';
    }
    $("#OpinionTabDiv").append(html);
}

function  renews(data){
        //console.log(data);
        global_comments_data = data;
        var select_sentiment = 1;
        //refreshDrawComments0(data, select_sentiment);

        var sentiment0 = 1000;
        var unselect_a = $('#SentimentTabDiv').children('a').each(function() {
            if($(this).hasClass('curr')){
                sentiment0 = $(this).attr('sentiment');
            }
        })
        refreshDrawComments0(data, sentiment0);
    }

function recluster(data){
    for(var key in data){
        if(data[key][0] == "合生,老先生,社会,无下"){
            data[key][0] = "一件实事不做的酸文人";
        }
        if(data[key][0] == "骗子,冯骥才,乖孩子,时代周刊,脑袋"){
            data[key][0] = "韩寒夸奖冯骥才说乖孩子真体贴。";
        }
        if(data[key][0] == "中国"){
            data[key][0] = "这些人控制着中国文坛";
        }
        if(data[key][0] == "文章,这是,才华,作品,事件"){
            data[key][0] = "韩寒真乖文章没了作品不出了";
        }
    }
    global_comments_opinion = data;

    // var select_data;
    // var select_tab;
    // for(var k in data){
    //     select_tab = k;
    //     select_data = data[k];
    //     break;
    // }
        var opinion0 = 10;
        var unselect_a = $('#OpinionTabDiv').children('a').each(function() {
            if($(this).hasClass('curr')){
                opinion0 = $(this).attr('clusterid');
            }
        });
        //console.log(opinion0);
    var tabs_list = [];
    for(var k in data){
        tabs_list.push([k, data[k][0]]);
    }

    //refreshDrawOpinionTab(tabs_list, select_tab);
    refreshDrawCommentsOpinion0(data[opinion0]);
}

function refreshDrawCommentsOpinion0(data){
    var news_div = "#vertical-ticker_opinion";
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
        if (counter == global_subevent_display){
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

    if (counter < global_subevent_display){
        $("#subevent_more_information").html("……");
    }
    $(news_div).append(html);
    $("#content_control_height").css("height", $("#weibo_ul").css("height"));
}

function refreshDrawComments0(data, select_sentiment){
    // console.log(data,select_sentiment);
    var news_div = "#vertical-ticker";
    $(news_div).empty();
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
        if (counter == global_senti_display){
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
        // console.log(d);
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

    if (counter < global_senti_display){
        $("#senti_more_information").html("……");
    }
    $(news_div).append(html);
    $("#content_control_height").css("height", $("#weibo_ul").css("height"));
}

function bindOpinionTabClick(that, select_div_id){
    // var select_div_id = "OpinionTabDiv";
    var a = global_comments_opinion;
    $("#"+select_div_id).children("a").unbind();
    $("#"+select_div_id).children("a").click(function() {
        var select_a = $(this);
        var unselect_a = $(this).siblings('a');
        if(!select_a.hasClass('curr')) {
            select_a.addClass('curr');
            unselect_a.removeClass('curr');
            var select_clusterid = select_a.attr('clusterid');
            global_subevent_display = 10;
            $("#subevent_more_information").html("……");
            refreshDrawCommentsOpinion0(a[select_clusterid]);
        }
    });
}

function bindSentimentTabClick(that, select_div_id){
    //var select_div_id = "SentimentTabDiv";
    var sentiment_map = {
        'neutral': 0,
        'happy': 1,
        'angry': 2,
        'sad': 3
    }
    $("#"+select_div_id).children("a").unbind();
   var g_a = global_comments_data;
    $("#"+select_div_id).children("a").click(function() {
        // var g_a = global_comments_data;
        var select_a = $(this);
        var unselect_a = $(this).siblings('a');
        if(!select_a.hasClass('curr')) {
            select_a.addClass('curr');
            unselect_a.removeClass('curr');
            var select_sentiment = $(this).attr('sentiment');
            global_senti_display = 1000;
            $("#senti_more_information").html("……");
            refreshDrawComments0(g_a, select_sentiment);
        }
    });
}

function bindSentiMoreClick(){
    $("#senti_more_information").click(function(){
        global_senti_display += addition;
        var select_div_id = "SentimentTabDiv";
        var sentiment_map = {
            'neutral': 0,
            'happy': 1,
            'angry': 2,
            'sad': 3
        }
        $("#"+select_div_id).children("a").each(function() {
            if($(this).hasClass('curr')) {
                var select_a = $(this);
                //console.log(select_a.attr('sentiment'));
                var select_sentiment = select_a.attr('sentiment');
                if ($("#senti_more_information").text()!='……'){
                refreshDrawComments0(global_comments_data, select_sentiment);
                return false;
            }
            }
        });
    });
}

function bindSubeventMoreClick(){
    $("#subevent_more_information").click(function(){
        global_subevent_display += addition;
        var select_div_id = "OpinionTabDiv";
        $("#"+select_div_id).children("a").each(function() {
            if($(this).hasClass('curr')) {
                var select_a = $(this);
                var select_clusterid = select_a.attr('clusterid');
                if( $("#subevent_more_information").text() != '……'){
                refreshDrawCommentsOpinion0(global_comments_opinion[select_clusterid]);
                return false;
            }
            }
        });
    });
}

function drawTopicSelect(data){
    $("#topic_form").empty();
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
        drawSubeventSelect(global_subevents_data);
    });
}

function drawSubeventSelect(data){
    if (!global_subevents_data){
        global_subevents_data = data;
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
function draw_pie_w(data, div_name, title){
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
                          color:function (value){ return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6); }
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
        var myChart = echarts.init(document.getElementById(div_name));
        myChart.setOption(option);

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
function check_comments(data){
    if ("status" in data){
        $("#main_pie").hideLoading();
        $("#senti_pie").hideLoading();
        alert('此子事件暂无评论。');
    }
    else{
        global_pie_data = data;
        comment.Pie_function(global_pie_data['ratio']);
        comment.SentiPie_function(global_pie_data['sentiratio']);
        comment.call_sync_ajax_request(cluster_comments_pre+"weight", comment.ajax_method, comment.Cluster_function);
        comment.call_sync_ajax_request(sentiment_comments_pre+"weight", comment.ajax_method, comment.News_function0);
    }
}

function bindClusterSortClick(){
    $("#cluster_sort_by_weight").click(function(){
        $("#cluster_sort_by_weight").css("color", "#fff");
        $("#cluster_sort_by_attitudes_count").css("color", "#ccc");
        $("#cluster_sort_by_timestamp").css("color", "#ccc");
        if (global_pie_data){
            comment.call_sync_ajax_request(cluster_comments_pre+"weight", comment.ajax_method, recluster);
        }
    });

    $("#cluster_sort_by_attitudes_count").click(function(){
        $("#cluster_sort_by_weight").css("color", "#ccc");
        $("#cluster_sort_by_attitudes_count").css("color", "#fff");
        $("#cluster_sort_by_timestamp").css("color", "#ccc");
        if (global_pie_data){
            comment.call_sync_ajax_request(cluster_comments_pre+"attitudes_count", comment.ajax_method, recluster);
        }
    });

    $("#cluster_sort_by_timestamp").click(function(){
        $("#cluster_sort_by_weight").css("color", "#ccc");
        $("#cluster_sort_by_attitudes_count").css("color", "#ccc");
        $("#cluster_sort_by_timestamp").css("color", "#fff");
        if (global_pie_data){
            comment.call_sync_ajax_request(cluster_comments_pre+"timestamp", comment.ajax_method, recluster);
        }
    });
}

function bindSentiSortClick(){
    $("#sentiment_sort_by_weight").click(function(){
        $("#sentiment_sort_by_weight").css("color", "#fff");
        $("#sentiment_sort_by_attitudes_count").css("color", "#ccc");
        $("#sentiment_sort_by_timestamp").css("color", "#ccc");
        if (global_pie_data){
            comment.call_sync_ajax_request(sentiment_comments_pre+"weight", comment.ajax_method, renews);
        }
    });
    $("#sentiment_sort_by_attitudes_count").click(function(){
        $("#sentiment_sort_by_weight").css("color", "#ccc");
        $("#sentiment_sort_by_attitudes_count").css("color", "#fff");
        $("#sentiment_sort_by_timestamp").css("color", "#ccc");
        if (global_pie_data){
            comment.call_sync_ajax_request(sentiment_comments_pre+"attitudes_count", comment.ajax_method, comment.News_function0);
        }
    });
    $("#sentiment_sort_by_timestamp").click(function(){
        $("#sentiment_sort_by_weight").css("color", "#ccc");
        $("#sentiment_sort_by_attitudes_count").css("color", "#ccc");
        $("#sentiment_sort_by_timestamp").css("color", "#fff");
        if (global_pie_data){
            comment.call_sync_ajax_request(sentiment_comments_pre+"timestamp", comment.ajax_method, renews);
        }
    });
}

var query = QUERY;
var topic_id = TOPIC_ID;
var subevent_id = SUBEVENT_ID;
var min_cluster_num = MIN_CLUSTER_NUM;
var max_cluster_num = MAX_CLUSTER_NUM;
var cluster_eva_min_size = CLUSTER_EVA_MIN_SIZE;
var vsm = VSM;
var start_ts = undefined;
var end_ts = undefined;
var global_pie_data = undefined;
var global_subevents_data = undefined;
var global_comments_data = undefined;
var global_comments_opinion = undefined;
var global_subevent_display = 10;
var global_senti_display = 10;
var addition = 10;
var topic_url = "/news/topics/";
var subevent_url = "/news/subevents/";
var global_ajax_url = "/news/comments_list/?topicid=" + topic_id + "&subeventid=" + subevent_id + "&min_cluster_num=" + min_cluster_num + "&max_cluster_num=" + max_cluster_num + "&cluster_eva_min_size=" + cluster_eva_min_size + "&vsm=" + vsm;
var sentiment_comments_pre = "/news/sentiment_comments?sort=";
var cluster_comments_pre = "/news/cluster_comments?sort=";

comment = new Comment_opinion(query, start_ts, end_ts);
comment.call_sync_ajax_request(topic_url, comment.ajax_method, drawTopicSelect);
comment.call_sync_ajax_request(subevent_url, comment.ajax_method, drawSubeventSelect);
drawVsmSelect();
// $("#main").showLoading();
// $("#senti_pie").showLoading();
comment.call_sync_ajax_request(global_ajax_url, comment.ajax_method, check_comments);
bindSentimentTabClick(comment, 'SentimentTabDiv');
bindSentiMoreClick();
bindSentiSortClick();
bindSubeventMoreClick();
bindOpinionTabClick(comment,'OpinionTabDiv');
bindClusterSortClick();

// var pie_data_point = [{'name':'徽文化，婺源','value':7},{'name':'瞎话，好感','value':3},{'name':'真理，一家之言','value':3}];
// draw_pie_w(pie_data_point, 'main_w', '事件')

// var pie_data_sentiment = [{'name':'中性','value':7},{'name':'悲伤','value':2},{'name':'愤怒','value':3},{'name':'高兴','value':1}]
// draw_pie_w(pie_data_sentiment, 'senti_pie_w', '情绪');
