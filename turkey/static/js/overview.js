function call_sync_ajax_request(url, callback){
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      async: true,
      success:callback
    });
}

function pie_cluster (data, div_name, title) {

	var pie_data = [];
	var One_pie_data = {};
	for (var key in data){ 
		One_pie_data = {'value': data[key].toFixed(2), 'name': key };
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
		var data = [];
		var myChart = echarts.init(document.getElementById(div_name));

		var option = {
		    title : {
		        text: title,
		        x:'center'
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    // legend: {
		    //     orient : 'vertical',
		    //     x : 'left',
		    //     data:data_x
		    // },
		    toolbox: {
		        show : false,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                        x: '25%',
		                        y: '120px',
		                        width: '50%',
		                        funnelAlign: 'left',
		                        max: 1548
		                    }
		                }
		            },
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : true,
		    series : [
		        {
		            name:title,
		            type:'pie',
		            radius : '48%',
		            center: ['52%', '50%'],
		            roseType : 'radius',
		            itemStyle : {
			            normal : {
			              label : {
			                show : true
			              },
			              labelLine : {
			                show : true,
			                length : 10
			              }
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
		            data:pie_data
		        }
		    ]
		}
		    myChart.setOption(option);

	});

}

function related_people_pie (data, div_name, title) {

	var pie_data = data
	// var pie_data = [];
	// var One_pie_data = {};
	// for (var key in data){ 
	// 	One_pie_data = {'value': data[key].toFixed(2), 'name': key };
	// 	pie_data.push(One_pie_data);
	// }

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
		var data = [];
		var myChart = echarts.init(document.getElementById(div_name));

		var option = {
		    title : {
		        text: title,
		        x:'center'
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c}({d}%)"
		    },
		    // legend: {
		    //     orient : 'vertical',
		    //     x : 'left',
		    //     data:data_x
		    // },
		    toolbox: {
		        show : false,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                        x: '25%',
		                        y: '120px',
		                        width: '50%',
		                        funnelAlign: 'left',
		                        max: 1548
		                    }
		                }
		            },
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : true,
		    series : [
		        {
		            name:title,
		            type:'pie',
		            radius : '60%',
		            center: ['50%', '60%'],
		            roseType : 'area',
		            itemStyle : {
			            normal : {
			              label : {
			                show : true
			              },
			              labelLine : {
			                show : true,
			                length : 15
			              }
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
		            data:pie_data
		        }
		    ]
		}
		    myChart.setOption(option);
		    var ecConfig = require('echarts/config');
        	myChart.on(ecConfig.EVENT.CLICK, function(param){
            // var data = param.data;
            // var links = option.series[0].links;
            // var nodes = option.series[0].nodes;
            console.log(param);
            var seriesIndex = param.seriesIndex;
            var dataIndex = param.dataIndex;
            if(param.seriesName == '相关人物比例'){
            	show_related_people(param.seriesName, param.name);
            }

        });

	});

}

function show_related_people(seriesName, name){
	console.log(query_name)
	if(query_name == '冯骥才'){
	    var dict = {'相关人物比例':{'合作者':["姚明","林丹"],'家庭成员':["冯宽","顾同昭","冯吉甫","戈长复"],'商界人士':["柳静安","贝陆慈"],'境外人员':[],'文艺工作者':["柯基生","何平","英达","宋雨桂","韩美林","崔波","余秋雨","莫言","严歌苓","刘诗昆","陈履生","刘华","李雪健","冯小刚","陈道明","章金莱","徐沛东","姜昆","李谷一","贾平凹","冯其庸","麦家","张贤亮","郑云峰","施光南","成龙","吴秀波","葛优","范伟","张嘉译"],'媒体工作者':["李楠","白岩松"],'党政干部':["耿彦波","常嗣新","郑一民","陈建文","罗杨","郭运德","蒋效愚","卢昌华","蔡国英","徐广国","何学清","马力","郑欣淼","王峻","谢雅贞","王勇超","韦苏文","严隽琪","丁晓芳"],'其他人员':["樊锦诗","沙玛拉毅","吴元新","曹保明","洪如丁"]}};
	}
	if(query_name == '赵实'){
	    var dict = {'相关人物比例':{'党政干部':['王东明','张岱梨','田进','王莉莉','沈跃跃','李源潮','王太华','王嘉猷','刘道平',
	    '雷元亮','张海涛','赵化勇','安思国','李群','张丕民','傅克诚','孙家正','李五四','罗志军','钱小芊','李岚清','刘延东',
	    '卢展工','王家瑞','夏红民','李前光','刘永富','王元军','张海','张雪','路甬祥','刘淇','刘奇葆','李肇星','焦利'],
	    '合作者':['姜树森','李玲修'],'家庭成员':[],'商界人士':[],'境外人员':[],'其他人员':['王彬颖','章素贞'],
	    '文艺工作者':['韩三平','唐国强','刘劲','王伍福','刘沙','王健','欧阳中石','徐克','姜文','冯小刚','范冰冰','章子怡',
	    '韩再芬','谢莉斯','王洁实','詹姆斯-卡梅隆'],'媒体工作者':['邓文迪']}}
	}
    console.log(dict[seriesName][name]);    
    var data = dict[seriesName][name];
    // data = data.split(',');
    $('#related_people_detail').empty();
    var html = '';
    for(var i=0;i<data.length;i++){
        html += '<div style="min-width:65px;padding:10px;float:left;">' +data[i]+'</div>';
    }
    $('#related_people_detail').append(html);
    $('#modal_title').empty();
    if(seriesName == '活动数量'){
        $('#modal_title').append(name + ' ('+data.length +')');
    }else{
        $('#modal_title').append(name + ' ('+data.length +')');
    }
    $('#related_people_modal').css('display','block');
    $("#float-wrap").css('display','block');

}

function pie_cluster_senti (data, div_name, title) {

	var pie_data = [];
	var One_pie_data = {};
	for (var key in data){ 
		One_pie_data = {'value': data[key].toFixed(2), 'name': key };
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
		var data = [];
		var myChart = echarts.init(document.getElementById(div_name));

		var option = {
		    title : {
		        text: title,
		        x:'center'
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    // legend: {
		    //     orient : 'vertical',
		    //     x : 'left',
		    //     data:data_x
		    // },
		    toolbox: {
		        show : false,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                        x: '25%',
		                        y: '120px',
		                        width: '50%',
		                        funnelAlign: 'left',
		                        max: 1548
		                    }
		                }
		            },
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : true,
		    series : [
		        {
		            name:title,
		            type:'pie',
		            radius : '50%',
		            center: ['60%', '50%'],
		            roseType : 'area',
		            itemStyle : {
			            normal : {
			              label : {
			                show : true
			              },
			              labelLine : {
			                show : true,
			                length : 10
			              }
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
		            data:pie_data
		        }
		    ]
		}
		    myChart.setOption(option);

	});

}

function pie_cluster_w(data, div_name, title) {

	// require.config({
 //        paths : {
 //            echarts : "/static/echarts/"
 //        }
 //    });
    require(
    [
        'echarts',
        'echarts/chart/pie'
    ],
	function (echarts) {
		var myChart = echarts.init(document.getElementById(div_name));

		var option = {
		    title : {
		        text: title,
		        x:'center'
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    // legend: {
		    //     orient : 'vertical',
		    //     x : 'left',
		    //     data:data_x
		    // },
		    toolbox: {
		        show : false,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                        x: '25%',
		                        y: '120px',
		                        width: '50%',
		                        funnelAlign: 'left',
		                        max: 1548
		                    }
		                }
		            },
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : true,
		    series : [
		        {
		            name:title,
		            type:'pie',
		            radius : '50%',
		            center: ['52%', '50%'],
		            roseType : 'area',
		            itemStyle : {
			            normal : {
			              label : {
			                show : true
			              },
			              labelLine : {
			                show : true,
			                length : 10
			              }
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
		            data:data
		        }
		    ]
		}
		    myChart.setOption(option);

	});

}

function related_people(data){
	$('#related_people').empty();
	// var date = new Date();
	// var from_date_time = Math.floor(date.getTime()/1000) - 60*60*24*7;
	// var from_date = from_date_time.format('yyyy/MM/dd hh:mm');
	// var to_date = date.format('yyyy/MM/dd hh:mm');
	var html = '';
	html += ' <table class="table table-bordered table-striped table-condensed datatable" >';
	html += ' <thead><tr style="text-align:center;">';
	html += '<th style="width:70px;">姓名</th><th style="width:60px;">紧密度</th><th style="width:93px;">类型</th><th>单位</th><th>职务</th>';
	html += '</tr></thead>';
	html += '<tbody>';
	for(var i=0;i<10;i++){
		html += '<tr>'
		html += ' <td>'+data[i][0]+'</td>';
		html += ' <td>'+data[i][1]+'</td>';
		html += ' <td>'+data[i][2]+'</td>';
		html += ' <td>'+data[i][3]+'</td>';
		html += ' <td>'+data[i][4]+'</td>';
		html += '</tr>';
	}

	html += '</tbody></table>';
	$('#related_people').append(html);
}

function related_people_modal(){
	$('#user_List').empty();
	// var date = new Date();
	// var from_date_time = Math.floor(date.getTime()/1000) - 60*60*24*7;
	// var from_date = from_date_time.format('yyyy/MM/dd hh:mm');
	// var to_date = date.format('yyyy/MM/dd hh:mm');
	var html = '';
	html += ' <table class="table table-bordered table-striped table-condensed datatable" >';
	html += ' <thead><tr style="text-align:center;">';
	html += '<th>姓名</th><th>职务</th><th>紧密度</th>';
	html += '</tr></thead>';
	html += '<tbody>';
	for(var i=0;i<10;i++){
		html += '<tr>'
		html += ' <td>'+'09XPX78'+'</td>';
		html += ' <td>'+'入库推荐'+'</td>';
		html += ' <td>'+ '0.98' +'</td>';
		html += '</tr>';
	}

	html += '</tbody></table>';
	$('#user_List').append(html);
}



function pie_activity (data, div_name, title,c_list) {
	var data_x = [];
	var data_all =[];
	for(var i=0;i<data.length;i++){
		var data_single = {};
		data_single.value=data[i].count;
		data_single.name=data[i].name;
		data_x.push(data[i].name);
		data_all.push(data_single);
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
		var data = [];
		var myChart = echarts.init(document.getElementById(div_name));

		var option = {
			color:c_list,
		    title : {
		        text: title,
		        x:'center'
		    },
		    tooltip : {
		        trigger: 'item',
		        formatter: "{a} <br/>{b} : {c} ({d}%)"
		    },
		    // legend: {
		    //     orient : 'vertical',
		    //     x : 'left',
		    //     data:data_x
		    // },
		    toolbox: {
		        show : false,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {
		                show: true, 
		                type: ['pie', 'funnel'],
		                option: {
		                    funnel: {
		                        x: '25%',
		                        y: '120px',
		                        width: '50%',
		                        funnelAlign: 'left',
		                        max: 1548
		                    }
		                }
		            },
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    calculable : true,
		    series : [
		        {
		            name:title,
		            type:'pie',
		            radius : '46%',
		            center: ['46%', '50%'],
		            roseType : 'area',
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
			            // color: function(params) {
               //          // build a color map as your need.
               //          var colorList = c_list;
               //          return colorList[params.dataIndex]
               //      },
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
		            data:data_all
		        }
		    ]
		}
		    myChart.setOption(option);

	});

}

function sub_point_senti(data){
	var data_opint = data.ratio;
	var data_sentiratio = data.sentiratio;
	pie_cluster(data_opint,"sub_point_1",'主题分析' );
	pie_cluster_senti(data_sentiratio, "sub_sentiment_1",'情感分析')
	var data_w_point =[{'name':'徽文化，婺源','value':7},{'name':'瞎话，好感','value':3},{'name':'真理，一家之言','value':3}];
	var data_w_senti = [{'name':'中性','value':7},{'name':'悲伤','value':2},{'name':'愤怒','value':3},{'name':'高兴','value':1}];
	pie_cluster_w(data_w_point,"sub_point_2",'主题分析' );
	pie_cluster_w(data_w_senti, "sub_sentiment_2",'情感分析');
}

$('#showmore_user').click(function(){
	related_people_modal();
})

$("#close").off("click").click(function(){
    $('#related_people_modal').css('display','none');
    $("#float-wrap").css('display','none');
    return false;
});
// var name = "{{topic}}";

var pie_act_url = '';
pie_act_url += '/news/distinct_types_list/?query=' + name;
if (name == '冯骥才'){
	var act_subevent_data = [{"name": "其他", "count": 12}, {"name": "传统文化保护与传承", "count": 11}, {"name": "古村落保护", "count": 13}]
	var data_all = [{name:'正面支持', value:75},{name:'负面反对', value:106},{name:'中性', value:3}];
    var data_people=[['顾同昭', '0.80', '家庭成员-妻子', '无', '绘画爱好者'],['冯宽', '0.60', '家庭成员-儿子', '冯骥才民间文化基金会', '秘书长'],['韩美林', '0.60', '文艺工作者', '清华大学美术学院', '教授'],['李雪健', '0.40', '文艺工作者', '中央实验话剧院', '影视演员'],['白岩松', '0.40', '媒体工作者', '中央电视台', '主持人'],['冯小刚', '0.20', '文艺工作者', '无', '导演、演员'],['英达', '0.20', '文艺工作者', '北京英氏影视传媒公司', '导演、演员'],['罗杨', '0.20', '党政干部', '中国民间文艺家协会', '分党委书记、书法家'],['陈道明', '0.20', '文艺工作者', '无', '演员'],['余秋雨', '0.20', '文艺工作者', '澳门科技大学', '艺术学院院长']];
	//带0值的
	var weibo_r_1 = [{name:'合作者',value:2},{name:'家庭成员',value:4},{name:'商界人士',value:2},{name:'党政干部',value:19},{name:'其他人员',value:5},{name:'文艺工作者',value:30},{name:'媒体工作者',value:2}];
	related_people_pie(data_all,"all_support",'正负舆情' )



}
if(name == '赵实'){
	var act_subevent_data = [{"name":"纪念徐悲鸿诞辰120周年座谈会上发言","count":193},{"name":"当选新一届中国文联副主席","count":17},{"name":"赵实出席兰考下基层演出","count":15},{"name":"省文联第七次代表大会召开","count":19},{"name":"赵实在武都慰问演出连辑观看并讲话 ","count":23},]
	var data_all = [{name:'正面支持', value:75},{name:'负面反对', value:106},{name:'中性', value:3}];
    var data_people = [['孙家正' ,'0.80', '党政干部', '中国文学艺术界联合会', '主席'],['王莉莉', '0.60', '党政干部' ,'国家广播电影电视总局', '总局直属机关党委书记'],['雷元亮', '0.60', '党政干部' ,'中国广播电视学会', '副会长'],['王太华', '0.60', '党政干部', '全国政协文史和学习委员会' , '主任委员'],['姜树森' ,'0.40' ,'合作者', '广西电影制片厂、长春电影制片厂', '导演'],['王东明', '0.20', '党政干部', '无', '四川省委书记'],['李岚清', '0.20', '党政干部', '无', '曾任中共第十五届中央委员'],['王家瑞', '0.20', '党政干部', '国务院', '中共十八届中央委员'],['韩三平', '0.20', '文艺工作者', '无', '制片人、导演'],['路甬祥', '0.20', '党政干部', '国务院', '曾任中共中央委员']]
	//带0值的	
	// var weibo_r_1 = [{name:'党政干部',value:35},{name:'合作者',value:2},{name:'家庭成员',value:0},{name:'商界人士',value:0},{name:'其他人员',value:2},{name:'文艺工作者',value:16},{name:'媒体工作者',value:1},{name:'境外人员',value:0}];
	// 不带值为0的条目
    // var weibo_r_series = ['合作者','党政干部','其他人员','文艺工作者'];

    var weibo_r_1 = [{name:'党政干部',value:35},{name:'合作者',value:2},{name:'其他人员',value:2},{name:'文艺工作者',value:16}];


}



call_sync_ajax_request(pie_act_url, function(data){pie_activity(data, "active_type", '社会活动类型占比',['#3E13AF','#00C12B','#FF1800','#7109AA','#CD0074','#FFA900','#1142AA',
        '#9FEE00','#9BCA63','#B5C334','#E87C25','#27727B','#D7504B','#C6E579','#F4E001'])});

//假数据
pie_activity(act_subevent_data, "subeventpie", '社会活动主题占比',[ 
    '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed', 
    '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0', 
    '#1e90ff', '#ff6347', '#7b68ee', '#00fa9a', '#ffd700', 
    '#6b8e23', '#ff00ff', '#3cb371', '#b8860b', '#30e0e0' 
]);

//假数据
// call_sync_ajax_request(pie_act_url, function(data){pie_activity(data, "all_support",'总体舆情')});

var cluster_url = '';
cluster_url += '/cluster/comments_list/?topicid='+topicid+'&subeventid='+ subevent_id +'&min_cluster_num=&max_cluster_num=&cluster_eva_min_size='+cluster_eva_min_size+'&vsm='+vsm;
//call_sync_ajax_request(cluster_url, sub_point_senti);

var query_name = name;
related_people(data_people);
related_people_pie(weibo_r_1, 'related_people_pie', '相关人物比例')

function show_alert(data){
	if(data==true){
		$('#alert_png').css('display','inline')
	}else{
		$('#alert_png').css('display','none')
	}
}
var alert_url = '/news/alert/?query='+name
call_sync_ajax_request(alert_url,show_alert)
