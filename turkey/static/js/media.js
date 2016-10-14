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
            data : ['2016/7/1','2016/7/15','2016/8/1','2016/9/1','2016/10/1','2016/11/1','2016/12/1'],
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
            data:[ 0, 200,910,1200, 600, 300,200, 100]
        }
    ]
};
      myChart.setOption(option);           