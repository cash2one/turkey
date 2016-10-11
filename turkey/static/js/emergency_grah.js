var myChart = echarts.init(document.getElementById('emergency_grah')); 
var option = {
    tooltip : {
        trigger: 'axis',
        showDelay : 0,
        formatter : function (params) {
            if (params.value.length > 1) {
                return params.seriesName + ' :<br/>'
                   + params.value[0] + 'cm ' 
                   + params.value[1] + 'kg ';
            }
            else {
                return params.seriesName + ' :<br/>'
                   + params.name + ' : '
                   + params.value + 'kg ';
            }
        },  
        axisPointer:{
            show: true,
            type : 'cross',
            lineStyle: {
                type : 'dashed',
                width : 1
            }
        }
    },
    legend: {
        data:['一级预警','二级预警']
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            dataZoom : {show: true},
            dataView : {show: true, readOnly: false},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    xAxis : [
        {
            type : 'value',
            scale:true,
            axisLabel : {
                formatter: '{value} '
            }
        }
    ],
    yAxis : [
        {
            type : 'value',
            scale:true,
            axisLabel : {
                formatter: '{value} '
            }
        }
    ],
    series : [
        {
            name:'一级预警',
            type:'scatter',
            data: [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6]
            ],
            markPoint : {
                data : [
                    {type : 'max', name: '土耳其政变'},
                    {type : 'min', name: '伊朗军事变动'}
                ]
            },
            markLine : {
                data : [
                    {type : 'average', name: '警戒线'}
                ]
            }
        },
        {
            name:'二级预警',
            type:'scatter',
            data: [[174.0, 65.6], [175.3, 71.8], [193.5, 80.7], [186.5, 72.6], [187.2, 78.8]
               ],
            markPoint : {
                data : [
                    {type : 'max', name: '土耳其政变'},
                    {type : 'min', name: '伊朗军事变动'}
                ]
            },
            markLine : {
                data : [
                    {type : 'average', name: '警戒线'}
                ]
            }
        }
    ]
};
                    
       myChart.setOption(option); 