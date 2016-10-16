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
    calculable : false,
    xAxis : [
        {
            type : 'category',
            boundaryGap : false,
            data : ['2016/7/1','2016/7/3','2016/7/5','2016/7/7','2016/7/9','2016/7/11','2016/7/13','2016/7/15','2016/7/16','2016/7/17','2016/7/18','2016/7/19','2016/7/20','2016/7/21','2016/7/22','2016/7/23','2016/7/24','2016/7/25','2016/7/26','2016/7/27','2016/7/28','2016/7/29','2016/7/30','2016/8/1','2016/8/3','2016/8/5','2016/8/7','2016/8/9','2016/8/11','2016/8/13','2016/8/15','2016/8/17','2016/8/19','2016/8/21','2016/8/23','2016/8/25','2016/8/27','2016/8/29','2016/9/1','2016/9/15','2016/10/1','2016/10/15'],
            name:"时间",
            axisLine: {
              onZero: false,
              show:false
            },
            splitLine:{
               show:false
            },
            axisLabel : {
               textStyle : {
                 decoration: 'none',
                 fontFamily: 'Microsoft YaHei',
                 fontSize: 12,
                  }
            },
            splitNumber:8
        }
    ],
    yAxis : [
        {
            type : 'value',
            name:"媒体热度",
            axisLine: {
                 onZero: false,
                 show:false
              },
             splitLine:{
              show:false,
              },
              splitArea:{
               show:true,
              areaStyle:{
               color:['#FFF','#F7F7F7']
                 }
           }
        }
    ],
    series : [
        {
            name:'媒体热度',
            type:'line',
            stack: '总量',
            symbolSize:6,
            data:[0,0,0,0,0,0,0,520,8000,12000,5000,6500,7200,200,2000,600,200,1000,500,230,100,80,30,10,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
          
        }

    ]
};
      myChart.setOption(option);    
      myChart.setTheme('infographic');       