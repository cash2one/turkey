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
            data : ['周一','周二','周三','周四','周五','周六','周日']
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'媒体热度',
            type:'line',
            stack: '总量',
            data:[120, 132, 101, 134, 90, 230, 210]
        }
    ]
};
      myChart.setOption(option);           