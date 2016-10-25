/**
 * Created by Administrator on 2016/10/25.
 */

    +function(){
        var map = new BMap.Map("container");
        var point = new BMap.Point(32.863,39.937); //默认中心点
        var marker = new BMap.Marker(point);
        map.centerAndZoom(new BMap.Point(32.863,39.937), 7);
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

        var ovaltwo = new BMap.Polygon(add_oval(point,0.7,0.6), {fillOpacity:0.7,fillColor:"gold"});
        map.addOverlay(ovaltwo);
        var pointhree = new BMap.Point(28.97644, 41.008921);
        var ovalthree = new BMap.Polygon(add_oval(pointhree,0.5,0.2), {fillOpacity:0.5,fillColor:"gold"});
        map.addOverlay(ovalthree);

        var point8 = new BMap.Point(27.136230,38.427774);
        var oval8 = new BMap.Polygon(add_oval(point8,0.4,0.2), {fillOpacity:0.5,fillColor:"gold"});
        map.addOverlay(oval8);
        var point9 = new BMap.Point(27.927246,41.335576);
        var oval9 = new BMap.Polygon(add_oval(point9,0.5,0.2), {fillOpacity:0.5,fillColor:"gold"});
        map.addOverlay(oval9);
        var point10 = new BMap.Point(32.332764,40.006580);
        var oval10 = new BMap.Polygon(add_oval(point10,0.3,0.2), {fillOpacity:0.5,fillColor:"gold"});
        map.addOverlay(oval10);
        var point11 = new BMap.Point(28.984680,40.243895);
        var oval11 = new BMap.Polygon(add_oval(point11,0.4,0.2), {fillOpacity:0.5,fillColor:"gold"});
        map.addOverlay(oval11);
        var point12 = new BMap.Point(30.71228, 36.897194);
        var oval12 = new BMap.Polygon(add_oval(point12,0.6,0.1), {fillOpacity:0.5,fillColor:"gold"});
        map.addOverlay(oval12);


        var pointfour = new BMap.Point(33.376465, 35.200745);
        var ovalfour = new BMap.Polygon(add_oval(pointfour,0.8,0.3), {fillOpacity:0.5,fillColor:"purple"});
        map.addOverlay(ovalfour);

        var pointfive = new BMap.Point(34.639893,36.826875);
        var ovalfive = new BMap.Polygon(add_oval(pointfive,1,0.2), {fillOpacity:0.5,fillColor:"purple"});
        map.addOverlay(ovalfive);

        var pointsix= new BMap.Point(33.343506,36.279707);
        var ovalsix = new BMap.Polygon(add_oval(pointsix,0.8,0.2), {fillOpacity:0.5,fillColor:"purple"});
        map.addOverlay(ovalsix);

        var point7= new BMap.Point(29.520264,41.004775);
        var oval7 = new BMap.Polygon(add_oval(point7,0.5,0.2), {fillOpacity:0.5,fillColor:"purple"});
        map.addOverlay(oval7);

        var point13= new BMap.Point(29.750977,36.456636);
        var oval13 = new BMap.Polygon(add_oval(point13,0.5,0.2), {fillOpacity:1,fillColor:"salmon"});
        map.addOverlay(oval13);
        var point14= new BMap.Point(28.520508,41.129021);
        var oval14 = new BMap.Polygon(add_oval(point14,0.5,0.2), {fillOpacity:1,fillColor:"salmon"});
        map.addOverlay(oval14);
        var point15= new BMap.Point(32.717285,39.707187);
        var oval15 = new BMap.Polygon(add_oval(point15,0.5,0.2), {fillOpacity:1,fillColor:"salmon"});
        map.addOverlay(oval15);


        var one=document.getElementsByClassName("one")[0];
        var two=document.getElementsByClassName("two")[0];
        var three=document.getElementsByClassName("three")[0];
        var four=document.getElementsByClassName("four")[0];
        var all=document.getElementsByClassName('all')[0];
        all.onclick=function () {
            map.addOverlay(ovalone);
            map.addOverlay(ovaltwo);
            map.addOverlay(ovalthree);
            map.addOverlay(ovalfour);
            map.addOverlay(ovalfive);
            map.addOverlay(ovalsix);
            map.addOverlay(oval7);
            map.addOverlay(oval8);
            map.addOverlay(oval9);
            map.addOverlay(oval10);
            map.addOverlay(oval11);
            map.addOverlay(oval12);
            map.addOverlay(oval13);
        }
        one.onclick=function remove_overlay(){
            map.addOverlay(ovalone);
            map.removeOverlay(ovaltwo);
            map.removeOverlay(ovalthree);
            map.removeOverlay(ovalfour);
            map.removeOverlay(ovalfive);
            map.removeOverlay(ovalsix);
            map.removeOverlay(oval7);
            map.removeOverlay(oval8);
            map.removeOverlay(oval9);
            map.removeOverlay(oval10);
            map.removeOverlay(oval11);
            map.removeOverlay(oval12);
            map.removeOverlay(oval13);
            map.removeOverlay(oval14);
            map.removeOverlay(oval15);
        }
        two.onclick=function remove_overlay(){
            map.removeOverlay(ovalone);
            map.addOverlay(ovaltwo);
            map.addOverlay(ovalthree);
            map.addOverlay(oval8);
            map.addOverlay(oval9);
            map.addOverlay(oval10);
            map.addOverlay(oval11);
            map.addOverlay(oval12);
            map.removeOverlay(ovalfour);
            map.removeOverlay(ovalfive);
            map.removeOverlay(ovalsix);
            map.removeOverlay(oval7);
            map.removeOverlay(oval13);
            map.removeOverlay(oval14);
            map.removeOverlay(oval15);
        }
        three.onclick=function remove_overlay(){
            map.removeOverlay(ovalone);
            map.removeOverlay(ovaltwo);
            map.removeOverlay(ovalthree);
            map.removeOverlay(oval8);
            map.removeOverlay(oval9);
            map.removeOverlay(oval10);
            map.removeOverlay(oval11);
            map.removeOverlay(oval12);
            map.addOverlay(ovalfour);
            map.addOverlay(ovalfive);
            map.addOverlay(ovalsix);
            map.addOverlay(oval7);
            map.removeOverlay(oval13);
            map.removeOverlay(oval14);
            map.removeOverlay(oval15);
        }
        four.onclick=function remove_overlay() {
            map.removeOverlay(ovalone);
            map.removeOverlay(ovaltwo);
            map.removeOverlay(ovalthree);
            map.removeOverlay(ovalfour);
            map.removeOverlay(ovalfive);
            map.removeOverlay(ovalsix);
            map.removeOverlay(oval7);
            map.removeOverlay(oval8);
            map.removeOverlay(oval9);
            map.removeOverlay(oval10);
            map.removeOverlay(oval11);
            map.removeOverlay(oval12);
            map.addOverlay(oval13);
            map.addOverlay(oval14);
            map.addOverlay(oval15);

        }


        var data_info = [
            [33.376465, 35.200745,"主要活动于土耳其及北塞浦路斯，土耳其约3.6%的选民是该组织支持者大概190万人"],
            [32.864782, 39.92244, "2011年9月20日，在安卡拉市中心Kızılay附近制造的炸弹袭击造成3人死亡，34人受伤。"],
            [28.97644, 41.008921, "2010年6月8日，在伊斯坦布尔的Küçükçekmece区进行恐怖袭击，造成15名警察受伤。<br/>2010年10月31日，在伊斯坦布尔塔克西姆区制造的恐怖袭击造成32人受伤。<br/>2016年6月7日，TAK在伊斯坦布尔Fatih区制造汽车炸弹袭击，造成包括5名警察，6名平民在内的11人死亡，36人受伤。"],
//            [24.998413,35.534677,""]
            [30.71228, 36.897194, "2016年8月24日，在安塔利亚-凯梅尔的高速公路上制造了对土耳其宪兵部队的袭击。"],
//            [35.485021, 38.71987, "XX年XX月XX日，开塞利"],
            [28.984680,40.243895,"2016年4月27日，TAK在土耳其第四大城市布尔萨內的一座清真寺附近制造自杀式恐怖袭击。"],
            [32.332764,40.006580,"2016年2月17日，TAK在安卡拉市中心制造针对一辆运输军人的巴士的汽车炸弹袭击，造成28人死亡。<br/>2016年3月13日，TAK在安卡拉市中心的一个公交车站附近制造汽车炸弹袭击，造成至少37死125伤。"],
            [27.927246,41.335576,"2015年12月23日，TAK制造了针对伊斯坦布尔第二国际机场的恐怖袭击，导致一死一伤。"],
            [27.136230,38.427774,"2012年8月9日，在伊兹密尔发动针对土耳其军队的连环自杀式爆炸袭击，造成至少2名军人死亡，超过30人受伤。"],
            [40.737305,37.335224,"从2004年起，库尔德工人党加紧了对伊拉克边境地区土耳其军队、警察与政府目标的攻击。安卡拉向美方增施压力，以获得军事打击伊拉克北部库尔德工人党基地的许可。库尔德工人党宣称自己只是以行动来自卫和保护库尔德人。"],
            [44.143066,37.307181,"2014年8月25日中国驻大使馆25日证实，3名中国工人24日在土耳其东南部遭库尔德工人党武装人员劫持，使馆正在全力营救中方人员。"],
            [34.639893,36.826875,"2011年9月安卡拉警方搜查了安卡拉地区灰狼组织的40各处所，拘捕了 36，缴获大量枪支和刀具。据警方透露，他们计划向在平与民主党（BDP）发动袭击"],
            [33.343506,36.279707,"2014年10月的灰狼组织被卷入致命冲突和骚乱。当时库尔德人在土耳其的各个城市游行示威，抗议艾因阿拉伯围困期间，土耳其的不干预政策。Milliyet报道称灰狼组织正在伊斯坦布尔企图私刑处死一个年轻人。"],
            [29.520264,41.004775,"在2015年7月，灰狼组织在土耳其伊斯坦布尔举行抗议活动，抗议“中国政府禁止维吾尔人于斋戒月敬拜及斋戒”。该组织烧毁中国国旗，袭击中国餐馆，伤害了误认为是中国人的韩国游客"],
            [34.057617,36.527295,"2015年9月7-8日土耳其民族主义者，包括灰狼组织的成员，袭击了亲库尔德人民民主党（HDP）在土耳其的128个办事处。"],
            [30.014648,40.547200,"2015年11月21日，灰狼组织在伊斯坦布尔俄罗斯领事馆附近抗议俄罗斯参与叙利亚内战。他们指责俄罗斯屠宰叙利亚土库曼人"],
            [29.750977,36.456636,"2015年5月在土耳其南部城市默尔逊市（Mersin）举办以“和平的抗争”为主题的法轮功真相图片展。"],
            [28.520508,41.129021,"2015年7月19和20日，土耳其部分法轮功学员在伊斯坦布尔市举办活动，呼吁制止中共江泽民集团对法轮功长达十六年的残酷迫害。<br/>2016年9月18日，在土耳其的伊斯坦布尔市举办“第三届法轮大法修炼心得交流会”，并于当天在中国驻伊斯坦布尔使馆前举行了抗议活动。"],
            [32.717285,39.707187,"2015年12月1日，在土耳其首都安卡拉中东科技大学，法轮功学员举办了讲真相活动。"],



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


