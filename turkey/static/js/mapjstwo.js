/**
 * Created by Administrator on 2016/10/25.
 */
~function(){
    var map = new BMap.Map("allmap");
    var point = new BMap.Point(32.863, 39.937); //默认中心点
    var marker = new BMap.Marker(point);
    map.addControl(new BMap.NavigationControl());

    map.centerAndZoom(new BMap.Point(32.863, 39.937), 8);
    map.enableScrollWheelZoom();

    var pt = new BMap.Point(32.863, 39.937);
    var myIcon = new BMap.Icon("/static/img/c1.png", new BMap.Size(32,32),{anchor: new BMap.Size(10, 30)});
    var markers = new BMap.Marker(pt,{icon:myIcon});  // 创建标注
    map.addOverlay(markers);
    var opts = {
        width: 350,     // 信息窗口宽度
        height: 0,     // 信息窗口高度
        title: "商会组织"  // 信息窗口标题
    };
    var infoWindow = new BMap.InfoWindow("公共部门工会联合会或KESK(Confederation of Public Sector Unions or KESK)<br/>成立于1995年12月<br/>总部位于安卡拉<br/>领导人：Lami OZGEN, Sazyie KOSE", opts);  // 创建信息窗口对象
    markers.addEventListener("click", function(){
        map.openInfoWindow(infoWindow,pt); //开启信息窗口
    });

    var pt1 = new BMap.Point(28.970947, 41.004775);
    var myIcon1 = new BMap.Icon("/static/img/c2.png", new BMap.Size(32,32),{anchor: new BMap.Size(20, 40)});
    var marker1 = new BMap.Marker(pt1,{icon:myIcon1});  // 创建标注
    map.addOverlay(marker1);
    var infoWindow1 = new BMap.InfoWindow("土耳其商人和工业家联合会或TUSKON （Confederation of Businessmen and Industrialists of Turkey or TUSKON）<br/>成立于2005"+
        "(解散2016年7月27日)<br/>总部位于伊斯坦布尔<br/>领导人：Rizanur MERAL", opts);  // 创建信息窗口对象
    marker1.addEventListener("click", function(){
        map.openInfoWindow(infoWindow1,pt1); //开启信息窗口
    });

    var pt2 = new BMap.Point(28.674316, 41.104191);
    var myIcon2 = new BMap.Icon("/static/img/c3.png", new BMap.Size(32,32),{anchor: new BMap.Size(50, 50)});
    var marker2 = new BMap.Marker(pt1,{icon:myIcon2});  // 创建标注
    map.addOverlay(marker2);
    var infoWindow2 = new BMap.InfoWindow("革命工会联合会或DISK（Confederation of Revolutionary Workers Unions or DISK）<br/>成立于1967年"+
        "<br/>总部位于伊斯坦布尔<br/>领导人：Tayfun GORGUN", opts);  // 创建信息窗口对象
    marker2.addEventListener("click", function(){
        map.openInfoWindow(infoWindow2,pt2); //开启信息窗口
    });

    var pt3 = new BMap.Point(32.863, 39.937);
    var myIcon3 = new BMap.Icon("/static/img/c4.png", new BMap.Size(32,32),{anchor: new BMap.Size(30, 30)});
    var marker3 = new BMap.Marker(pt3,{icon:myIcon3});  // 创建标注
    map.addOverlay(marker3);
    var infoWindow3 = new BMap.InfoWindow("道德权利工人联合会或Hak-Is（Moral Rights Workers Union or Hak-Is）<br/>成立于1976年10月22日"+
        "<br/>总部位于安卡拉<br/>领导人：Mahmut ARSLAN", opts);  // 创建信息窗口对象
    marker3.addEventListener("click", function(){
        map.openInfoWindow(infoWindow3,pt3); //开启信息窗口
    });

    var pt4 = new BMap.Point(32.863, 39.937);
    var myIcon4 = new BMap.Icon("/static/img/c5.png", new BMap.Size(32,32),{anchor: new BMap.Size(-10, 40)});
    var marker4 = new BMap.Marker(pt4,{icon:myIcon4});  // 创建标注
    map.addOverlay(marker4);
    var infoWindow4 = new BMap.InfoWindow("土耳其雇主联合会或TISK（Turkish Confederation of Employers' Unions or TISK）"+
        "<br/>总部位于安卡拉<br/>领导人：Tugrul KUDATGOBILIK", opts);  // 创建信息窗口对象
    marker4.addEventListener("click", function(){
        map.openInfoWindow(infoWindow4,pt4); //开启信息窗口
    });

    var pt5 = new BMap.Point(32.863, 39.937);
    var myIcon5 = new BMap.Icon("/static/img/c6.png", new BMap.Size(32,32),{anchor: new BMap.Size(10, 10)});
    var marker5 = new BMap.Marker(pt5,{icon:myIcon5});  // 创建标注
    map.addOverlay(marker5);
    var infoWindow5 = new BMap.InfoWindow("土耳其劳工联合会（Turkish Confederation of Labor or Turk-Is）<br/>成立于1952年"+
        "<br/>总部位于安卡拉<br/>领导人：Ergun ATALAY", opts);  // 创建信息窗口对象
    marker5.addEventListener("click", function(){
        map.openInfoWindow(infoWindow5,pt5); //开启信息窗口
    });

    var pt6 = new BMap.Point(32.863, 39.937);
    var myIcon6 = new BMap.Icon("/static/img/c7.png", new BMap.Size(32,32),{anchor: new BMap.Size(20, 50)});
    var marker6 = new BMap.Marker(pt6,{icon:myIcon6});  // 创建标注
    map.addOverlay(marker6);
    var infoWindow6 = new BMap.InfoWindow("土耳其商业和商品交易所联合会或TOBB（Turkish Union of Chambers of Commerce and Commodity Exchanges or TOBB）<br/>成立于1950年3月8日"+
        "<br/>总部位于安卡拉<br/>领导人：M. Rifat HISARCIKLIOGLU", opts);  // 创建信息窗口对象
    marker6.addEventListener("click", function(){
        map.openInfoWindow(infoWindow6,pt6); //开启信息窗口
    });

    var pt7 = new BMap.Point(28.674316, 41.104191);
    var myIcon7 = new BMap.Icon("/static/img/c8.png", new BMap.Size(32,32),{anchor: new BMap.Size(10, 40)});
    var marker7 = new BMap.Marker(pt7,{icon:myIcon7});  // 创建标注
    map.addOverlay(marker7);
    var infoWindow7 = new BMap.InfoWindow("独立工商者和商人协会或MUSIAD （Independent Industrialists' and Businessmen's Association or MUSIAD）<br/>成立于1990年5月5日"+
        "<br/>总部位于安卡拉<br/>领导人：Nail OLPAK", opts);  // 创建信息窗口对象
    marker7.addEventListener("click", function(){
        map.openInfoWindow(infoWindow7,pt7); //开启信息窗口
    });

}();