 var myChart = echarts.init(document.getElementById('media_hot')); 
var option = {
    tooltip : {
        trigger: 'axis'
    },
    legend: {
        data:['媒体热度']
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    calculable : true,
    xAxis : [
        {
            type : 'category',
            boundaryGap : false,
            data : ['2016/7/1','2016/7/3','2016/7/5','2016/7/7','2016/7/9','2016/7/11','2016/7/13','2016/7/15','2016/7/17','2016/7/19','2016/7/21','2016/7/23','2016/7/25','2016/7/27','2016/7/29','2016/8/1','2016/8/3','2016/8/5','2016/8/7','2016/8/9','2016/8/11','2016/8/13','2016/8/15','2016/8/17','2016/8/19','2016/8/21','2016/8/23','2016/8/25','2016/8/27','2016/8/29','2016/9/1','2016/9/15','2016/10/1','2016/10/15'],
            name:"时间"
        }
    ],
    yAxis : [
        {
            type : 'value',
            name:"媒体热度"
        }
    ],
    series : [
        {
            name:'媒体热度',
            type:'line',
            stack: '总量',
            data:[ 0,0,0,0,0,0,60,70,200,600,1100,1300,1430,1500,1400,1380, 800, 550,450,400,200,400, 300,100,90,20,21,10,8,5,3,0,0,0]
        }
    ]
};
      myChart.setOption(option);           