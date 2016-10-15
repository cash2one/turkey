require(
             [  
                    'echarts'
                ],
function(ec){

 var ecConfig = require('echarts/config');
var myChart = echarts.init(document.getElementById('emergency_grah'),'shine'); 
var option = {
    tooltip : {
        trigger: 'axis',
        showDelay : 0,
        formatter : function (params) {
            // console.log(params);
            // if (params.value.length > 1) {
            //     return params.seriesName + ' :<br/>'
            //        + params.value[0] + 'cm ' 
            //        + params.value[1] + 'kg ';
            // }
            // else {
            //     return params.seriesName + ' :<br/>'
            //        + params.name + ' : '
            //        + params.value + 'kg ';
            // }
        }
    },
    legend: {
        data:['一级预警','二级预警','三级预警']
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
           name :"时间",
           type : 'category',
           data : ['2016/1/1','2016/2/1','2016/3/1','2016/4/1','2016/5/1','2016/6/1','2016/7/1','2016/7/15','2016/8/1','2016/9/1','2016/10/1','2016/11/1','2016/12/1']
        }
    ],
    yAxis : [
        {
            name :"预警指数",
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
            data: [['2016/7/15',274.0], ['2016/9/1',170.0]],
            markPoint : {
                data : [
                    {type : 'max', name: '土耳其军事政变'},
                    {type : 'min', name: '伊朗军事变动'}
                    // {name: '土耳其军事政变',value:274.0,xAxis: '2016/7/15', yAxis: 274.0}, 
                    // {name: '伊朗军事变动',value:170.0,xAxis: '2016/9/1', yAxis: 170.0}  
                     
                    
                ]
            }
        },
        {
            name:'三级预警',
            type:'scatter',
            data: [['2016/5/1',74.0], ['2016/8/21',110.0]],
            markPoint : {
                data : [
                    {type : 'max', name: '华盛顿一危化品列车发生脱轨'},
                    {type : 'min', name: '土耳其加济安泰普婚礼现场遭爆炸袭击'}
                   
                ]
            }
        },
        {
            name:'二级预警',
            type:'scatter',
            data: [['2016/2/21',14.0], ['2016/10/1',32.0]],
            markPoint : {
                data : [
                    {type : 'max', name: '突尼斯发生车祸21人死亡'},
                    {type : 'min', name: '日本北海道决堤淹水'}
                ]
            }
        }
    ]
};
         myChart.on(ecConfig.EVENT.CLICK, function (param){
           //console.log(param.name);
           window.open('/news/turkey_emergency');
         })
       myChart.setTheme('infographic');  
       myChart.setOption(option); 
})