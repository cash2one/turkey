/**
 * Created by Administrator on 2016/10/25.
 */

    +function(){
        var map = new BMap.Map("map_org");
        var point = new BMap.Point(40.231934,37.935533); //默认中心点
        var marker = new BMap.Marker(point);
        map.addControl(new BMap.NavigationControl());
        map.centerAndZoom(new BMap.Point(40.231934,37.935533), 7);
        map.enableScrollWheelZoom();
        function add_oval(centre,x,y)
        {
            var assemble=new Array();
            var angle;
            var dot;
            var tangent=x/y;
            for(i=0;i<36;i++)
            {
                angle = (2* Math.PI / 36) * i;
                dot = new BMap.Point(centre.lng+Math.sin(angle)*y*tangent, centre.lat+Math.cos(angle)*y);
                assemble.push(dot);
            }
            return assemble;
        }
        var pointone = new BMap.Point(41.198730, 37.405074);
        var ovalone = new BMap.Polygon(add_oval(pointone,5,1.3), {fillOpacity:0.5,fillColor:"green"});
        map.addOverlay(ovalone);

       


        var data_info = [
            [40.737305,37.335224,"从2004年起，库尔德工人党加紧了对伊拉克边境地区土耳其军队、警察与政府目标的攻击。安卡拉向美方增施压力，以获得军事打击伊拉克北部库尔德工人党基地的许可。库尔德工人党宣称自己只是以行动来自卫和保护库尔德人。"],
            [44.143066,37.307181,"2014年8月25日中国驻大使馆25日证实，3名中国工人24日在土耳其东南部遭库尔德工人党武装人员劫持，使馆正在全力营救中方人员。"],
            
        ];
        var opts = {
            backgroundColor:"yellow",
            width: 350,     // 信息窗口宽度
            height: 0,     // 信息窗口高度
            title: "事件详情"  // 信息窗口标题

        };
        run();
        function run() {
            for (var i = 0; i < data_info.length; i++) {
                var marker = new BMap.Marker(new BMap.Point(data_info[i][0], data_info[i][1]));  // 创建标注
                var content = data_info[i][2];
                map.addOverlay(marker);               // 将标注添加到地图中
                addClickHandler(content, marker);
            }
            function addClickHandler(content, marker) {
                marker.addEventListener("click", function (e) {
                        openInfo(content, e)
                    }
                );
            }
        }


        function openInfo(content, e) {
            var p = e.target;
            var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
            var infoWindow = new BMap.InfoWindow(content, opts);  // 创建信息窗口对象
            map.openInfoWindow(infoWindow, point); //开启信息窗口
        }

    }();


