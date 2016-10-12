// var media_myChart = echarts.init(document.getElementById('media_hot')); 
// var media_option = 
var data = [[{"data":[{"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,521,8821,11027,5090,3169,3915,7583,4267,2297,1157,602,377,289,379,854,1388,2402,2410,2304,1569,1219,973,824,622,647,669,980,667,545,458,581,430,266,159,136,97,98,110,136,219,280,339,321,321,277,306,237,204,250,218,165,160,170,157,175,127,193,99,60,47,36,54,107,161,246,329,264,189,135,114],"label":{"name":"2016-08-27 18","value":11027},"name":"走势统计","type":"line"}],"dateFormat":"yyyy-MM-dd","datetime":["2016-08-26 00","2016-08-26 01","2016-08-26 02","2016-08-26 03","2016-08-26 04","2016-08-26 05","2016-08-26 06","2016-08-26 07","2016-08-26 08","2016-08-26 09","2016-08-26 10","2016-08-26 11","2016-08-26 12","2016-08-26 13","2016-08-26 14","2016-08-26 15","2016-08-26 16","2016-08-26 17","2016-08-26 18","2016-08-26 19","2016-08-26 20","2016-08-26 21","2016-08-26 22","2016-08-26 23","2016-08-27 00","2016-08-27 01","2016-08-27 02","2016-08-27 03","2016-08-27 04","2016-08-27 05","2016-08-27 06","2016-08-27 07","2016-08-27 08","2016-08-27 09","2016-08-27 10","2016-08-27 11","2016-08-27 12","2016-08-27 13","2016-08-27 14","2016-08-27 15","2016-08-27 16","2016-08-27 17","2016-08-27 18","2016-08-27 19","2016-08-27 20","2016-08-27 21","2016-08-27 22","2016-08-27 23","2016-08-28 00","2016-08-28 01","2016-08-28 02","2016-08-28 03","2016-08-28 04","2016-08-28 05","2016-08-28 06","2016-08-28 07","2016-08-28 08","2016-08-28 09","2016-08-28 10","2016-08-28 11","2016-08-28 12","2016-08-28 13","2016-08-28 14","2016-08-28 15","2016-08-28 16","2016-08-28 17","2016-08-28 18","2016-08-28 19","2016-08-28 20","2016-08-28 21","2016-08-28 22","2016-08-28 23","2016-08-29 00","2016-08-29 01","2016-08-29 02","2016-08-29 03","2016-08-29 04","2016-08-29 05","2016-08-29 06","2016-08-29 07","2016-08-29 08","2016-08-29 09","2016-08-29 10","2016-08-29 11","2016-08-29 12","2016-08-29 13","2016-08-29 14","2016-08-29 15","2016-08-29 16","2016-08-29 17","2016-08-29 18","2016-08-29 19","2016-08-29 20","2016-08-29 21","2016-08-29 22","2016-08-29 23","2016-08-30 00","2016-08-30 01","2016-08-30 02","2016-08-30 03","2016-08-30 04","2016-08-30 05","2016-08-30 06","2016-08-30 07","2016-08-30 08","2016-08-30 09","2016-08-30 10","2016-08-30 11","2016-08-30 12","2016-08-30 13"],"legend":["走势统计"],"title":"热点走势图"}],"从上图可以看出，整个事件的爆发点是2016年08月27日 18点，走势统计类型的数据较为突出。"];
function LineCallBack(data){
        var c1 = document.getElementById("media_hot");
        if (data==null||data==""){
            c1.innerHTML = "<br> <div align=\"center\" style=\"padding-top:50px\"><p style=\"display:inline;font-size: 14px\"><img src=\""+njxImgSrc+"/images/shouye/warn.png\" style=\"width:60px\"><br/>此时间段暂无信息</p></div>";
            return false;
        }else{
            var data1 = data[1];
            data = eval(data[0]);
            if(data[0].data==null || data[0].data.length==0){
                c1.innerHTML = "<br> <div align=\"center\" style=\"padding-top:50px\"><p style=\"display:inline;font-size: 14px\"><img src=\""+njxImgSrc+"/images/shouye/warn.png\" style=\"width:60px\"><br/>此时间段暂无信息</p></div>";
                stat1.innerHTML = '';
                return;
            }else{
                var _chartColumn10 = LineChart(data[0],"media_hot");
                $("#media_hot + .text").text(data1);
            }
        }
    }
    function LineChart(data,dom){

        var splitNum = 0;
        if(data.datetime.length>12){
            splitNum = 2;
        }
        $.each(data.data,function(){
            this.symbolSize = 6;
            this.itemStyle={'normal':{'lineStyle':{'width':2.8}}};
        });
        var config = require(
                [
                    'echarts',
                    'echarts/chart/line'
                ],
                function (ec) {
                    var chart1 = ec.init(document.getElementById(dom));
                    var option = {
                        animation : false,
                        tooltip : {
                            trigger: 'axis',
                            formatter:function(params){
                                v = params[0].name;
                                for (var i = 0, l = params.length; i < l; i++) {
                                    v += '<br/>' + params[i].seriesName + ' : ' + params[i].value;
                                }

                                return v;
                            }
                        },
                        toolbox: {
                            show : true,
                            orient:'vertical',
                            y:30,
                            x:'right',

                            feature : {
                                mark : {show: false},
                                dataView : {
                                    show: false,
                                    readOnly: false,
                                    lang: ['数据视图', '关闭', '刷新']
                                },
                                restore : {show: true},
                                saveAsImage : {
                                    show: true,
                                    name:data.name
                                },
                            }
                        },
                        legend: {
                            data:data.legend
                        },
                        grid:{
                            x:50,
                            x2:50
                        },
                        xAxis:[{
                            type : 'category',//category|time
                            boundaryGap: false ,
                            data : data.datetime,
                            axisLine: {
                                onZero: false,
                                show:false
                            },
                            splitLine:{
                                show:false
                            },
                            splitNumber:splitNum,
                            axisLabel : {
                                textStyle : {
                                    decoration: 'none',
                                    fontFamily: 'Microsoft YaHei',
                                    fontSize: 12,
                                }
                            },
                        }
                        ],
                        yAxis : [{
                            type : 'value',
                            axisLine: {
                                onZero: false,
                                show:false
                            },
                            splitLine:{
                                show:false
                            },
                            splitArea:{
                                show:true,
                                areaStyle:{
                                    color:['#FFF','#F7F7F7']
                                }
                            },
                            axisLabel:{
                                formatter:function(v){
                                    if(v>=1000){
                                        return (v/1000)+"k";
                                    }else{
                                        return v;
                                    }
                                }
                            },
                        }],


                        calculable : false,
                        series : data.data
                    }
                    chart1.setOption(option);
                    chart1.setTheme('infographic');
                    var enConfig = require('echarts/config');
                }
        );
    }
    

    LineCallBack(data);

// media_myChart.setOption(media_option); 



