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

function Comment_opinion(task_id, start_ts, end_ts){
	//传进来的参数，可以有
	this.task_id = task_id;
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
        var pie_div = "main";
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
	                radius : '50%',
	                center: ['50%', '60%'],
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
	                center: ['50%', '60%'],
	                data: pie_data
	            }
	        ]
	    };
	    var myChart = echarts.init(document.getElementById(pie_div));
	    myChart.setOption(option);
	    $("#"+pie_div).hideLoading();
	},

	//新闻
	News_function: function(data){
        global_comments_data = data;
        refreshDrawComments(global_comments_data, global_select_sentiment, global_select_sentiment_sort);
	},

    Cluster_function: function(data){
        global_comments_opinion = data;

        if(data.length == 0){
            alert("观点数据为空");
        }

        if(global_select_subevent == undefined){
            for(var k in data){
                global_select_subevent = k;
                break;
            }
        }

        var tabs_list = [];
        for(var k in data){
            tabs_list.push([k, data[k][0]]);
        }

        refreshDrawOpinionTab(tabs_list, global_select_subevent);
        refreshDrawCommentsOpinion(global_comments_opinion, global_select_subevent, global_select_subevent_sort);
    },
}

function refreshDrawOpinionTab(tabs_list, select_tab){
    var _opinion_div = "#OpinionTabDiv";
    $(_opinion_div).empty();

    var html = "";
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
    $(_opinion_div).append(html);
}

function weight_comparator(a, b) {
    return parseFloat(b.weight) - parseFloat(a.weight);
}

function timestamp_comparator(a, b) {
    return parseFloat(b.timestamp) - parseFloat(a.timestamp);
}

function attitudes_count_comparator(a, b) {
    return parseInt(b.attitudes_count) - parseInt(a.attitudes_count);
}

function sort_data(data, sort){
    if(sort == 'weight'){
        data.sort(weight_comparator);
    }
    if(sort == 'timestamp'){
        data.sort(timestamp_comparator);
    }
    if(sort == 'attitudes_count'){
        data.sort(attitudes_count_comparator);
    }
    return data;
}

function refreshDrawCommentsOpinion(data, select_tab, sort){
    var news_div = "#vertical-ticker_opinion";
    $(news_div).empty();

    var counter = 0;
    var html = "";

    if (data && (select_tab in data)){
        var da = data[select_tab][1];
    }
    else{
        var da = [];
    }
    da = sort_data(da, sort);

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
        html += '<div class="weibo_pz" style="margin-right:10px;">';
        html += '<span><a class="undlin" href="javascript:;" target="_blank">赞数(' + d['attitudes_count'] + ')</a></span>&nbsp;&nbsp;|&nbsp;&nbsp;';
        html += '<span><a class="undlin" href="javascript:;" target="_blank">相关度(' + weight.toFixed(3) + ')</a></span>&nbsp;&nbsp;';
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
        $("#subevent_more_information").html("加载完毕");
    }
    $(news_div).append(html);
    $("#content_control_height").css("height", $("#weibo_ul").css("height"));
}

function refreshDrawComments(data, select_sentiment, sort){
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

    da = sort_data(da, sort);

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
        html += '<li class="item" style="width:1068px">';
        html += '<div class="weibo_face"><a target="_blank" href="#">';
        html += '<img src="' + user_img_link + '">';
        html += '</a></div>';
        html += '<div class="weibo_detail" >';
        html += '<p>用户:<a class="undlin" target="_blank" href="' + d["user_comment_url"] + '">' + d['user_name'] + '</a>&nbsp;&nbsp;';
        html += '&nbsp;&nbsp;发布内容：&nbsp;&nbsp;<span id="content_summary_' + d['_id']  + '">' + content_summary + '</span>';
        html += '</p>';
        html += '<div class="weibo_info">';
        html += '<div class="weibo_pz" style="margin-right:10px;">';
        html += '<span><a class="undlin" href="javascript:;" target="_blank">赞数(' + d['attitudes_count'] + ')</a></span>&nbsp;&nbsp;';
        html += '<span><a class="undlin" href="javascript:;" target="_blank">相关度(' + weight.toFixed(3) + ')</a></span>&nbsp;&nbsp;';
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
        $("#senti_more_information").html("加载完毕");
    }
    $(news_div).append(html);
    $("#content_control_height").css("height", $("#weibo_ul").css("height"));
}

function bindOpinionTabClick(that){
    var select_div_id = "OpinionTabDiv";
    $("#"+select_div_id).children("a").unbind();
    $("#"+select_div_id).children("a").click(function() {
        var select_a = $(this);
        var unselect_a = $(this).siblings('a');
        if(!select_a.hasClass('curr')) {
            select_a.addClass('curr');
            unselect_a.removeClass('curr');
            var select_clusterid = select_a.attr('clusterid');
            global_subevent_display = 10;
            $("#subevent_more_information").html("加载更多");
            global_select_subevent = select_clusterid;
            refreshDrawCommentsOpinion(global_comments_opinion, select_clusterid, global_select_subevent_sort);
        }
    });
}

function bindSentimentTabClick(that){
    var select_div_id = "SentimentTabDiv";
    var sentiment_map = {
        'neutral': 0,
        'happy': 1,
        'angry': 2,
        'sad': 3
    }
    $("#"+select_div_id).children("a").unbind();
    $("#"+select_div_id).children("a").click(function() {
        var select_a = $(this);
        var unselect_a = $(this).siblings('a');
        if(!select_a.hasClass('curr')) {
            select_a.addClass('curr');
            unselect_a.removeClass('curr');
            var select_sentiment = sentiment_map[select_a.attr('sentiment')];
            global_senti_display = 10;
            $("#senti_more_information").html("加载更多");
            global_select_sentiment = select_sentiment;
            refreshDrawComments(global_comments_data, global_select_sentiment, global_select_sentiment_sort);
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
        refreshDrawComments(global_comments_data, global_select_sentiment, global_select_sentiment_sort);
    });
}

function bindSubeventMoreClick(){
    var select_div_id = "OpinionTabDiv";
    $("#subevent_more_information").click(function(){
        global_subevent_display += addition;
        refreshDrawCommentsOpinion(global_comments_opinion, global_select_subevent, global_select_subevent_sort);
    });
}

function drawVsmSelect(){
    $("#select_vsm").empty();
    var html = '';
    var vsm_list = ['v1', 'v2'];
    var vsm_name = ['文档空间', '上下文空间'];
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
        $("#main").hideLoading();
        $("#senti_pie").hideLoading();
        alert('此子事件暂无评论。');
    }
    else{
        global_pie_data = data;
        $("#before_filter_count").val(data['before_filter_count']);
        $("#after_filter_count").val(data['after_filter_count']);
        comment.Pie_function(global_pie_data['ratio']);
        comment.SentiPie_function(global_pie_data['sentiratio']);
        comment.call_sync_ajax_request(cluster_comments_pre+"weight", comment.ajax_method, comment.Cluster_function);
        comment.call_sync_ajax_request(sentiment_comments_pre+"weight", comment.ajax_method, comment.News_function);
    }
}

function bindClusterSortClick(){
    $("#cluster_sort_by_weight").click(function(){
        $("#cluster_sort_by_weight").css("color", "#333");
        $("#cluster_sort_by_attitudes_count").css("color", "-webkit-link");
        $("#cluster_sort_by_timestamp").css("color", "-webkit-link");

        global_select_subevent_sort = 'weight';
        if (global_pie_data){
            refreshDrawCommentsOpinion(global_comments_opinion, global_select_subevent, global_select_subevent_sort);
        }
    });

    $("#cluster_sort_by_attitudes_count").click(function(){
        $("#cluster_sort_by_weight").css("color", "-webkit-link");
        $("#cluster_sort_by_attitudes_count").css("color", "#333");
        $("#cluster_sort_by_timestamp").css("color", "-webkit-link");

        global_select_subevent_sort = 'attitudes_count';
        if (global_pie_data){
            refreshDrawCommentsOpinion(global_comments_opinion, global_select_subevent, global_select_subevent_sort);
        }
    });

    $("#cluster_sort_by_timestamp").click(function(){
        $("#cluster_sort_by_weight").css("color", "-webkit-link");
        $("#cluster_sort_by_attitudes_count").css("color", "-webkit-link");
        $("#cluster_sort_by_timestamp").css("color", "#333");

        global_select_subevent_sort = 'timestamp';
        if (global_pie_data){
            refreshDrawCommentsOpinion(global_comments_opinion, global_select_subevent, global_select_subevent_sort);
        }
    });
}

function bindSentiSortClick(){
    $("#sentiment_sort_by_weight").click(function(){
        $("#sentiment_sort_by_weight").css("color", "#333");
        $("#sentiment_sort_by_attitudes_count").css("color", "-webkit-link");
        $("#sentiment_sort_by_timestamp").css("color", "-webkit-link");

        global_select_sentiment_sort = 'weight';
        if (global_pie_data){
            refreshDrawComments(global_comments_data, global_select_sentiment, global_select_sentiment_sort);
        }
    });
    $("#sentiment_sort_by_attitudes_count").click(function(){
        $("#sentiment_sort_by_weight").css("color", "-webkit-link");
        $("#sentiment_sort_by_attitudes_count").css("color", "#333");
        $("#sentiment_sort_by_timestamp").css("color", "-webkit-link");

        global_select_sentiment_sort = 'attitudes_count';
        if (global_pie_data){
            refreshDrawComments(global_comments_data, global_select_sentiment, global_select_sentiment_sort);
        }
    });
    $("#sentiment_sort_by_timestamp").click(function(){
        $("#sentiment_sort_by_weight").css("color", "-webkit-link");
        $("#sentiment_sort_by_attitudes_count").css("color", "-webkit-link");
        $("#sentiment_sort_by_timestamp").css("color", "#333");

        global_select_sentiment_sort = 'timestamp';
        if (global_pie_data){
            refreshDrawComments(global_comments_data, global_select_sentiment, global_select_sentiment_sort);
        }
    });
}

var task_id = TASK_ID;
var cluster_num = CLUSTER_NUM;
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
var global_ajax_url = "/package/comments_list/?taskid=" + task_id + "&cluster_num=" + cluster_num + "&cluster_eva_min_size=" + cluster_eva_min_size + "&vsm=" + vsm + "&calcu=" + calc_label;
var sentiment_comments_pre = "/package/sentiment_comments?taskid=" + task_id + "&sort=";
var cluster_comments_pre = "/package/cluster_comments?taskid=" + task_id +"&sort=";
var global_select_subevent = undefined; // 存储全局选择的子事件
var global_select_subevent_sort = 'weight'; // 存储全局选择的子事件排序标准
var global_select_sentiment = 1; // 存储全局选择的情绪
var global_select_sentiment_sort = 'weight'; // 存储全局选择的情绪排序标准

comment = new Comment_opinion(task_id, start_ts, end_ts);
drawVsmSelect();
$("#main").showLoading();
$("#senti_pie").showLoading();
comment.call_sync_ajax_request(global_ajax_url, comment.ajax_method, check_comments);
bindSentimentTabClick(comment);
bindSentiMoreClick();
bindSentiSortClick();
bindSubeventMoreClick();
bindOpinionTabClick(comment);
bindClusterSortClick();
