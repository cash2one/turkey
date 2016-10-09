#-*- coding:utf-8 -*-

import os
import sys
import json
import time
import pymongo
import datetime
from collections import Counter
from flask import Blueprint, url_for, render_template, request, send_from_directory
from turkey.global_utils import ts2datetime, ts2date
from turkey.Database import Event, EventManager, Feature, DbManager, EventComments, News
from turkey.global_config import default_topic_name, default_news_id, default_topic_id, default_subevent_id, \
    default_cluster_num, default_cluster_eva_min_size, default_vsm, emotions_vk_v1
from turkey.extensions import mongo
AB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../public/')
sys.path.append(AB_PATH)
from comment_module import comments_calculation_v2

mod = Blueprint('news', __name__, url_prefix='/news')

em = EventManager()
temp_file = 'cluster_dump_dict.txt'

@mod.route('/alert/')
def alert():
    """alert for personal overview
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    topicid = str(em.getEventIDByName(topic_name))

    comment_col = "comment_" + topicid
    results = mongo.db[comment_col].find()
    comcount = [r["comments_count"] for r in results]
    comcount = sum([0 if c == "" else int(c) for c in comcount])

    weibo_col = "weibo_" + topicid
    results = mongo.db[weibo_col].find()
    weibocount = [r["comments_count"] for r in results]
    weibocount = sum([0 if c == "" else int(c) for c in weibocount])

    total_count = comcount + weibocount
    alert = False
    if total_count > 100:
        alert = True

    return json.dumps(alert)

@mod.route('/db/')
def db_names():
    """返回mongodb中news开头的db_name
    """
    dm = DbManager()
    return json.dumps(dm.getDbNames())

typeid2name = {
    "1": u"参政议政",    
    "2": u"文艺活动",
    "3": u"商业活动",
    "4": u"公益活动",
    "5": u"学术活动",
    "6": u"重大突发事件表现",
    "7": u"其他活动"
}

@mod.route("/relevant/")
def relevant():
    topic_name = request.args.get('query', default_topic_name) # 话题名
    return render_template("index/relevant.html", topic=topic_name)

def getSocialActivities(topic_name):
    results_str = ""
    topicid = em.getEventIDByName(topic_name)
    for acttypeid, act in typeid2name.iteritems():
        cursor = mongo.db["post_" + str(topicid)].find({"activity_type": acttypeid})
        results = []
        for r in cursor:
            title = r["title"]
            if title:
                results.append(title)
        if len(results):
            if results_str != "":
                results_str += "_"
            results_str += act + ":" + ".".join(results)
        else:
            if results_str != "":
                results_str += "_"
            results_str += act + ":" + u"无" 
    if topic_name == u"冯骥才":
        results_str = u"参政议政:2016年1月，主持中国民协第九次全国代表大会开幕式；2014年3月，在两会上表示，除夕理应放假；2014年3月，在全国政协十一届五次会议记者会上表示，缺乏创意和为了圈钱成文化产业最大问题，造成缺乏深刻洞悉时代的作品；2014年3月，在两会新闻中心答记者问时表示，反对对文化用“开发”这个野蛮的词汇；2012年3月，与韩美林联合提出“立法取缔活熊取胆”提案；2011年3月，在全国政协十一届四次会议举行的记者会上表示，文化的“珠穆朗玛峰”就在中国_商业活动:2015年1月，在北京国际展览中心举行的2015年北京图书订货会上，带着自己的六部新书来到现场_文艺活动:2015年12月，出席第十二届中国民间文艺山花奖颁奖典礼；2013年7月，被聘为2014年央视春晚的艺术顾问；2010年8月，出席《在希望的田野上——人民音乐家施光南诞辰七十周年纪念音乐会》；2009年5月，到湘西进行文化考察_学术活动:2012年6月，出席“中国北方村落文化遗产保护工作论坛”；2011年8月，发表文章说文化遗产不能一股脑产业化；2011年4月，出席第九届海峡两岸中华传统文化与现代化研讨会暨第四届中国介休清明（寒食）文化节；2010年4月，出席第三届中国清明文化论坛_公益活动:2016年3月，向家乡宁波慈城进行文化捐赠；2014年6月，启动“中国传统村落立档调查”传统文化保护项目_重大突发事件表现:无_其他活动:2012年5月，冯骥才参加古建筑专家罗哲文的遗体告别仪式"
    elif topic_name == u"赵实":
    	results_str = u"参政议政:2015年10月，主持中国文联学习贯彻《中共中央关于繁荣发展社会主义文艺的意见》专题研讨班并作总结讲话；2015年10月，主持中央第二巡视组巡视中国文联工作动员会并作动员讲话；2015年4月，率中国文联调研组到四川围绕“加强和改进文联工作修改完善《中国文联章程》”等内容展开调研；2015年4月，应邀出席江苏省文学艺术界联合会第九次代表大会、江苏省作家协会第八次代表大会开幕式并讲话；2014年8月，参加中国文联在京举行的文艺工作者带头践行社会主义核心价值观座谈会；2014年5月，出席中国文艺评论家协会成立大会；2011年12月，赴广东考察文艺工作；2010年10月，会见四川甘孜州负责同志并听取甘孜州扶贫工作新进展的情况汇报；2010年 2月，主持召开广电总局扶贫工作领导小组会议_商业活动:无_文艺活动:2016年1月，出席“百花迎春”文学艺术界2016春节大联欢并观看表演；2014年11月，参加在北京举行的“中国梦•检察魂”全国检察机关书画摄影作品展开幕式；2014年9月，参观“欧阳中石书中华美德古训展”；2012年9月，参加第九届金鹰电视艺术节颁奖晚会并为压轴大奖“最具人气男女演员奖”获得者颁奖；2009年4月，陪同韩三平等中影集团领导探望《建国大业》电影剧组；2009年4月，出席中国电影乐团纪念建团六十周年庆典晚会_学术活动:无_公益活动:2013年12月，出席中国文艺志愿者协会成立仪式；2013年5月，中国文联文艺志愿服务团在甘肃省陇南市武都区马街小学义演期间，看望学校里的孩子_重大突发事件表现:无_其他活动:2010年2月，看望慰问电影科研所离休干部王嘉猷同志"

    return results_str

def getRepu(topic_name):
    if topic_name == u"冯骥才":
        repu = ""
        repu_list = [u"2016年3月，作品短篇小说《俗世奇人（足本）》入围中国出版集团“中版好书榜”",
                    u"2016年2月，短篇小说《俗世奇人新篇》入选2015年中国当代文学最新作品排行榜",
                    u"2015年12月，被颁发宁夏回族自治区“文化使者”聘书",
                    u"2015年12月，当选“传播中华文化年度人物”；2007年5月，获《小说月报》第十二届百花奖",
                    u"中篇小说《啊！》《神鞭》分别获得全国优秀短篇、优秀中篇小说奖"]
        repu += u"社会荣誉:"
        repu += u"；".join(repu_list)
        repu += u"_境外荣誉:"
        repu += u"2013年6月，获万宝龙国际艺术赞助大奖；《炮打双灯》改编的同名电影获“夏威夷电影节”和“西班牙电影节”奖；《感谢生活》《挑山工》获法国“青年读物奖”，并获瑞士“蓝眼镜蛇奖”"
    elif topic_name == u"赵实":
        repu = u"无"
    return repu

@mod.route('/search/')
def search():
    """提供人物搜索接口
    """
    module_name = u'人物搜索'
    return render_template("index/search.html", module_name = module_name)

@mod.route('/overview/')
def overview():
    """人物概览
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    topicid = em.getEventIDByName(topic_name)
    module_name = u'人物概览分析'
    subevent_id = request.args.get('subevent_id', 'global')
    cluster_num = request.args.get('cluster_num', default_cluster_num)
    cluster_eva_min_size = request.args.get('cluster_eva_min_size', default_cluster_eva_min_size)
    vsm = request.args.get('vsm', default_vsm)

    return render_template("index/overview.html",module_name=module_name, topic=topic_name, topic_id=topicid, subevent_id=subevent_id, \
            cluster_num=cluster_num, cluster_eva_min_size=cluster_eva_min_size, \
            vsm=vsm)

@mod.route('/distinct_types_list/')
def distinct_types_list():
    topic_name = request.args.get('query', default_topic_name) # 话题名
    topicid = em.getEventIDByName(topic_name)
    distinct_types = []
    cursor = mongo.db["post_" + str(topicid)].find()
    for r in cursor:
        if "activity_type" in r:
            if r["activity_type"] == "null":
                r["activity_type"] = "7"
            distinct_types.append(r["activity_type"])

    counter = Counter(distinct_types)
    type2count = dict(counter.most_common())
    distinct_types = list(set(distinct_types))

    distinct_types_list = [{"name": typeid2name[d], "id": d, "count": type2count[d]} for d in distinct_types]

    return json.dumps(distinct_types_list)


@mod.route('/person_suggest/', methods=["GET", "POST"])
def person_suggest():
    """
    """
    sug_names = [u"冯骥才", u"冯宽", u"赵实"]
    if request.method == "POST":
        result = []
        name = request.form["key"]
        for n in sug_names:
            if name in n:
                result.append(n)

        return json.dumps({"names": result})

def update_url_title():
    import csv
    dic = dict()
    f = csv.reader(open("fenjicai_id_url_title.csv"))
    for line in f:
        _id, url, title = line
        if url != "" and title != "":
            dic[_id] = [url, title]
    return dic

id_url_title_dict = update_url_title()

@mod.route('/weibo_c/')
def weibo_c():
    """
    """
    null =''
    add_data = []
    # add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-6-24 9:51", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://zj.zjol.com.cn/news/375851.html", "category": null, "news_author": "", "user_id": null, "title": "\u51af\u9aa5\u624d\u6765\u4e49\u53c2\u52a0\u4e2d\u56fd\u4f20\u7edf\u6751\u843d\u4fdd\u62a4\u53d1\u5c55\u7814\u8ba8\u4f1a\u0020\u4ed6\u90fd\u8bf4\u4e86\u4ec0\u4e48", "relative_news": null, "source_from_name": "\u4e49\u4e4c\u5546\u62a5", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "\u6d59\u6c5f\u5728\u7ebf", "date": "2016-06-24", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://zj.zjol.com.cn/news/375851.html", "content168": "本市共有7 名代表出席大会,他们是冯骥才、陈文军、张书珍、张宇、傅长圣、霍庆有、魏国秋。冯骥才被聘为名誉主席,傅长圣、霍庆有、张书珍当选为新一届理事。 (责任...", "source_website": null, "thumbnail_url": null, "_id": "http://zj.zjol.com.cn/news/375851.html", "activity_type": "1"}]
    topic_name = request.args.get('query', default_topic_name) # 话题名
    topicid = em.getEventIDByName(topic_name)
    acttypeid = request.args.get("acttype", "1")
    if topic_name == u'冯骥才':
        if acttypeid == "1":
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-6-24 9:51", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://zj.zjol.com.cn/news/375851.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才来义参加中国传统村落保护发展研讨会 他都说了什么", "relative_news": null, "source_from_name": "浙江在线", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "义乌商报", "date": "2016-06-24", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://zj.zjol.com.cn/news/375851.html", "content168": "6月23日，住建部2016年第1期中国传统村落保护发展培训班在义乌举办，在会上我们有幸见到了冯老，虽然已年逾七旬，但在思想和行动上，仍然超越常人。", "source_website": null, "thumbnail_url": null, "_id": "http://zj.zjol.com.cn/news/375851.html", "activity_type": "1"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-06-19 7:53", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://news.hexun.com/2016-06-19/184472252.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才任名誉主席", "relative_news": null, "duplicate": False, "source_from_name": "和讯网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "天津日报", "date": "2016-06-19", "same_from": "http://news.hexun.com/2016-06-19/184472252.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://news.hexun.com/2016-06-19/184472252.html", "content168": "本市共有7 名代表出席大会,他们是冯骥才、陈文军、张书珍、张宇、傅长圣、霍庆有、魏国秋。冯骥才被聘为名誉主席,傅长圣、霍庆有、张书珍当选为新一届理事。 (责任...", "source_website": null, "thumbnail_url": null, "_id": "http://news.hexun.com/2016-06-19/184472252.html", "activity_type": "1"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-06-16 15:27", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://www.thepaper.cn/newsDetail_forward_1484580", "category": null, "news_author": "", "user_id": null, "title": "中国民间文艺家协会换帅：潘鲁生接棒已任三届主席的冯骥才", "relative_news": null, "duplicate": False, "source_from_name": "网易财经", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "澎湃新闻网", "date": "2016-06-19", "same_from": "http://www.thepaper.cn/newsDetail_forward_1484580", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://www.thepaper.cn/newsDetail_forward_1484580", "content168": "6月15日，中国民间文艺家协会第九次全国代表大会在京闭幕。大会选举产生了第九届中国民协主席团成员，潘鲁生当选新一届主席。连任三届15年主席的冯骥才卸任。然而，他并没有因此停下为中国民间文艺发展奔波的脚步。会议期间，他还多次与相关部门的负责人沟通，用餐期间也总是在和代表们聊着相关话题。", "source_website": null, "thumbnail_url": null, "_id": "http://www.thepaper.cn/newsDetail_forward_1484580", "activity_type": "1"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-15 09:35", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://www.china.com.cn/lianghui/news/2016-03/15/content_38025659.htm", "category": null, "news_author": "", "user_id": null, "title": "7届老委员冯骥才：继续推动非遗保护", "relative_news": null, "duplicate": False, "source_from_name": "中国网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "人民网", "date": "2016-06-19", "same_from": "http://www.china.com.cn/lianghui/news/2016-03/15/content_38025659.htm", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://www.china.com.cn/lianghui/news/2016-03/15/content_38025659.htm", "content168": "我自从1983年成为全国政协委员,到现在,已经是7届老委员了,参加了34次一年一度的政协大会,算下来,我的生命中已经拿出一年多时间在政协开会了。30多年时间里,我...", "source_website": null, "thumbnail_url": null, "_id": "http://www.china.com.cn/lianghui/news/2016-03/15/content_38025659.htm", "activity_type": "1"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-10 17:48", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://news.qq.com/a/20160311/019066.htm", "category": null, "news_author": "", "user_id": null, "title": "莫言、王蒙、冯骥才、刘慈欣......中国作家有哪些“两会之声”？", "relative_news": null, "duplicate": False, "source_from_name": "腾讯新闻", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "中青报", "date": "2016-06-19", "same_from": "http://news.qq.com/a/20160311/019066.htm", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://news.qq.com/a/20160311/019066.htm", "content168": "“一些艺术门类已很长时间没有出现出类拔萃的艺术作品了”,冯骥才认为,文化市场商品化抵消了作品的文艺属性。 作家冯骥才 “相关部门要有文化的战略眼光,既允许娱乐...", "source_website": null, "thumbnail_url": null, "_id": "http://news.qq.com/a/20160311/019066.htm", "activity_type": "1"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-06 22:56", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://news.ifeng.com/a/20160306/47716316_0.shtml", "category": null, "news_author": "", "user_id": null, "title": "冯骥才：文化市场商品化，抵消着作品的文艺属性", "relative_news": null, "duplicate": False, "source_from_name": "华西都市报", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "凤凰网", "date": "2016-06-19", "same_from": "http://news.ifeng.com/a/20160306/47716316_0.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://news.ifeng.com/a/20160306/47716316_0.shtml", "content168": "”全国政协常委、著名作家冯骥才说,文化市场商品化,抵消着作品的文艺属性。相关部门要有文化的战略眼光,既...", "source_website": null, "thumbnail_url": null, "_id": "http://news.ifeng.com/a/20160306/47716316_0.shtml", "activity_type": "1"}]
        if acttypeid == "3":
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-05-02 8:01", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://news.hexun.com/2016-05-02/183643119.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才书展畅谈全民", "relative_news": null, "source_from_name": "和讯网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "天津日报", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://news.hexun.com/2016-05-02/183643119.html", "content168": "本报讯 (记者 周凡恺)昨天,在天津春季书展上,作家冯骥才的“怪世奇谈”系列小说纪念珍藏版,由百花文艺出版社全新推出,冯骥才说,能够出席首发式非常高兴,因为劳动和...", "source_website": null, "thumbnail_url": null, "_id": "http://news.hexun.com/2016-05-02/183643119.html", "activity_type": "3"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-05-02 7:21", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://news.enorth.com.cn/system/2016/05/01/030948772.shtml", "category": null, "news_author": "", "user_id": null, "title": "冯骥才：阅读影响人生 创作灵感是上帝之吻", "relative_news": null, "duplicate": False, "source_from_name": "北方网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "天津北方网", "date": "2016-06-19", "same_from": "http://news.enorth.com.cn/system/2016/05/01/030948772.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://news.enorth.com.cn/system/2016/05/01/030948772.shtml", "content168": "天津北方网讯:5月1日上午,2016春季书展迎来文学界大咖——著名学者、作家、教育家冯骥才。为了能够与读者有眼神的交流,74岁的冯骥才始终站立与读者交流自己的文学...", "source_website": null, "thumbnail_url": null, "_id": "http://news.enorth.com.cn/system/2016/05/01/030948772.shtml", "activity_type": "3"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-05-02 9:58", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://www.meizhou.cn/2016/0502/438484.shtml", "category": null, "news_author": "", "user_id": null, "title": "冯骥才小说 珍藏版发行", "relative_news": null, "duplicate": False, "source_from_name": "梅州网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "梅州日报", "date": "2016-06-19", "same_from": "http://www.meizhou.cn/2016/0502/438484.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://www.meizhou.cn/2016/0502/438484.shtml", "content168": "作家冯骥才“怪世奇谈”系列小说纪念珍藏版5月1日起正式出版发行,珍藏版重新收录了冯骥才创作的《神鞭》《三寸金莲》和《阴阳八卦》这三部津味小说。分享...", "source_website": null, "thumbnail_url": null, "_id": "http://www.meizhou.cn/2016/0502/438484.shtml", "activity_type": "3"}]
        if acttypeid == "2":
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-07-01 12:06", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://www.artsbj.com/show-49-519893-1.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才：读书亦是读人", "relative_news": null, "source_from_name": "北京文艺网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "北京文艺网", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://www.artsbj.com/show-49-519893-1.html", "content168": "读人,比读其它文字写就的书更难。我认认真真地读,读了大半辈子,至今还没有读懂这本“人之书”。一个人就是一本书。 读人,比读其它文字写就的书更难。...", "source_website": null, "thumbnail_url": null, "_id": "http://www.artsbj.com/show-49-519893-1.html", "activity_type": "2"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-04-22 21:31", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://money.163.com/16/0422/21/BL9O1LPI00254TI5.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才话乡愁：像火炬手一样传承历史文化", "relative_news": null, "duplicate": False, "source_from_name": "网易财经", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "中国新闻网", "date": "2016-06-19", "same_from": "http://money.163.com/16/0422/21/BL9O1LPI00254TI5.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://money.163.com/16/0422/21/BL9O1LPI00254TI5.html", "content168": "图为冯骥才祖居博物馆开馆。 林波 摄图为冯骥才话乡愁。 林波 摄中新网宁波4月22日电 (记者 林波)虽然已经年过70,两鬓中也有了明显银丝,但作为中国文坛“...", "source_website": null, "thumbnail_url": null, "_id": "http://money.163.com/16/0422/21/BL9O1LPI00254TI5.html", "activity_type": "2"}, {"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-29 9:58", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://culture.people.com.cn/n1/2016/0329/c87423-28233848.html", "category": null, "news_author": "", "user_id": null, "title": "“朝内166号”人文社成立65周年 冯骥才王蒙忆精神家园", "relative_news": null, "duplicate": False, "source_from_name": "人民网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "人民网-文化频道", "date": "2016-03-29", "same_from": "http://culture.people.com.cn/n1/2016/0329/c87423-28233848.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://culture.people.com.cn/n1/2016/0329/c87423-28233848.html", "content168": "冯骥才曾说,这里是“我的另一个窝儿——精神的巢”;王蒙几乎所有的长篇小说都在这里出版;陈忠实从这里的“高门楼”中窥见了文学圣徒的精神……青砖砌墙,... ", "source_website": null, "thumbnail_url": null, "_id": "http://culture.people.com.cn/n1/2016/0329/c87423-28233848.html", "activity_type": "2"}, {"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-21 07:57", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://art.people.com.cn/n1/2016/0321/c206244-28215161.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才:当代设计审美乱象", "relative_news": null, "duplicate": False, "source_from_name": "人民网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "金羊网", "date": "2016-06-19", "same_from": "http://art.people.com.cn/n1/2016/0321/c206244-28215161.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://art.people.com.cn/n1/2016/0321/c206244-28215161.html", "content168": "当代设计已经走到了它的十字路口，这个题目非常好。这个十字路口一条经线，一条纬线，经线是竖线，竖线实际就是历史，就是时间。我们的设计从古代到近代到当代，当走到现代的时候我们无路可逃，中国的现代性出了问题，我们不知道中国的现代性是什么，我们好像只有抄袭，进入一个怪圈，连感觉，连思维都要跟西方对位，在东方、西方各种成熟的设计中，没有自己的位置。我们正好在这样的一个十字中间点上彷徨，找不到出路...", "source_website": null, "thumbnail_url": null, "_id": "http://art.people.com.cn/n1/2016/0321/c206244-28215161.html", "activity_type": "2"}, {"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-10 17:48", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://www.tengtv.com/news/show-166917.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才：藏身民间八百年滑县年画惊世人", "relative_news": null, "duplicate": False, "source_from_name": "滕国网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "网络转载", "date": "2016-06-19", "same_from": "http://www.tengtv.com/news/show-166917.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://www.tengtv.com/news/show-166917.html", "content168": "冯骥才:藏身民间八百年滑县年画惊世人滑县木版年画多以中堂为主滑县木版年画中的钟馗形象 本报安阳讯 “我认为,这是新发现的一个年画产地,是河南民间文化遗产历史 ...", "source_website": null, "thumbnail_url": null, "_id": "http://www.tengtv.com/news/show-166917.html", "activity_type": "2"}, {"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-11 12:56", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://news.xinhuanet.com/shuhua/2016-03/02/c_128768638.htm", "category": null, "news_author": "", "user_id": null, "title": "冯骥才：在非遗保护与文学创作之间", "relative_news": null, "duplicate": False, "source_from_name": "新华网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "人民政协在线", "date": "2016-06-19", "same_from": "http://news.xinhuanet.com/shuhua/2016-03/02/c_128768638.htm", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://news.xinhuanet.com/shuhua/2016-03/02/c_128768638.htm", "content168": "冯骥才:在非遗保护与文学创作之间---至于《中国唐卡文化档案》,我觉得藏族是一个善于创作美术的民族,美术创作水平堪称世界一流,其中唐卡成为世界重要的收藏品。还有...", "source_website": null, "thumbnail_url": null, "_id": "http://news.xinhuanet.com/shuhua/2016-03/02/c_128768638.htm", "activity_type": "2"}, {"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-02 8:07", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://news.xinhuanet.com/politics/2016-02/11/c_128712792.htm", "category": null, "news_author": "", "user_id": null, "title": "看春晚之冯骥才：年俗在变 年的盛情未改", "relative_news": null, "duplicate": False, "source_from_name": "新华网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "央视新闻", "date": "2016-06-19", "same_from": "http://news.xinhuanet.com/politics/2016-02/11/c_128712792.htm", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://news.xinhuanet.com/politics/2016-02/11/c_128712792.htm", "content168": "对于央视猴年春晚，中国文联副主席、著名作家冯骥才在接受本台记者采访时表示，今年央视春晚的创新、创优，给他留下了深刻印象。其中设了东西南北四个分会场，突出了我们中国传统文化的魅力，和旧有的民俗相比，电视观众在参与方式上有了很大的不同。他觉得，热议本身就是年味儿的体现...", "source_website": null, "thumbnail_url": null, "_id": "http://news.xinhuanet.com/politics/2016-02/11/c_128712792.htm", "activity_type": "2"}]
        if acttypeid == "5":
            add_data = []
        if acttypeid == "4":
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-07-04 08:40", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://www.china.com.cn/cppcc/2016-07/04/content_38803528.htm", "category": null, "news_author": "", "user_id": null, "title": "冯骥才:最好的保护就是合理利用", "relative_news": null, "source_from_name": "中国网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "浙江日报", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://www.china.com.cn/cppcc/2016-07/04/content_38803528.htm", "content168": "问题背后是冯骥才的担忧——如果几十年后,千姿百态的传统村庄消失了,那么就违背了保护传统村落的初衷。“保护传统村落,是为了达到保护中华文化多样性的目的。” 正如...", "source_website": null, "thumbnail_url": null, "_id": "http://www.china.com.cn/cppcc/2016-07/04/content_38803528.htm", "activity_type": "4"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-06-25 9:54", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://edu.gmw.cn/newspaper/2016-06/25/content_113562617.htm", "category": null, "news_author": "", "user_id": null, "title": "冯骥才点赞“海外名校”", "relative_news": null, "duplicate": False, "source_from_name": "光明网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "金华日报", "date": "2016-06-19", "same_from": "http://edu.gmw.cn/newspaper/2016-06/25/content_113562617.htm", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://edu.gmw.cn/newspaper/2016-06/25/content_113562617.htm", "content168": "刚送走外交部原部长李肇星,又迎来全国政协常委、中国传统村落保护专家委员会主任委员冯骥才。6月22日,应邀前来义乌出席中国传统村落保护发展大会的冯骥才点赞海外名校...", "source_website": null, "thumbnail_url": null, "_id": "http://edu.gmw.cn/newspaper/2016-06/25/content_113562617.htm", "activity_type": "4"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-06-24 9:32", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://zj.zjol.com.cn/news/375798.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才：保护传统村落，因为这里有民族记忆", "relative_news": null, "duplicate": False, "source_from_name": "浙江在线", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "浙中新报", "date": "2016-03-29", "same_from": "http://zj.zjol.com.cn/news/375798.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://zj.zjol.com.cn/news/375798.html", "content168": "冯老说，传统村落是民间文化的承载空间，其中留存着大量的历史信息、文脉记忆、艺术创造和生活方式，传统村落每一处都凝结着老百姓大量的心血和智慧，展现着人民的向往与追求、理想与道德。对传统村落的保护发展，可以为民族存留更多鲜活的历史记忆和文化脉络... ", "source_website": null, "thumbnail_url": null, "_id": "http://zj.zjol.com.cn/news/375798.html", "activity_type": "4"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-06-11 20:32", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://n.cztv.com/news/12090567.html", "category": null, "news_author": "", "user_id": null, "title": "将村整体从水库淹没区迁出 绍兴胡卜村让冯骥才感动", "relative_news": null, "duplicate": False, "source_from_name": "新蓝网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "新蓝网", "date": "2016-06-19", "same_from": "http://n.cztv.com/news/12090567.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://n.cztv.com/news/12090567.html", "content168": "人民日报6月10日刊发了国务院参事、中国民间文艺家协会主席冯骥才的文章《胡卜村的乡愁与创举》,介绍新昌胡卜村文化遗产保护的可贵实践,浙江新闻客户端予以转发......", "source_website": null, "thumbnail_url": null, "_id": "http://n.cztv.com/news/12090567.html", "activity_type": "4"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-05-31 17:48", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://www.wenming.cn/wmzh_pd/fw/xtzg/201605/t20160531_3396092.shtml", "category": null, "news_author": "", "user_id": null, "title": "冯骥才：中国传统村落何去何从", "relative_news": null, "duplicate": False, "source_from_name": "中国文明网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "中国艺术报", "date": "2016-06-19", "same_from": "http://www.wenming.cn/wmzh_pd/fw/xtzg/201605/t20160531_3396092.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://www.wenming.cn/wmzh_pd/fw/xtzg/201605/t20160531_3396092.shtml", "content168": "慈溪是我的故乡,我到故乡谈自己特别关切的传统村落问题,有很多的情感在里面。传统村落保护已经由初期的探索阶段,进入到理性阶段,我们需要思考很多重要的实际问题...", "source_website": null, "thumbnail_url": null, "_id": "http://www.wenming.cn/wmzh_pd/fw/xtzg/201605/t20160531_3396092.shtml", "activity_type": "4"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-05-15 17:09", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://www.infzm.com/content/117062?from=groupmessage&isappinstalled=0", "category": null, "news_author": "", "user_id": null, "title": "冯骥才：有故土，才记得住乡愁", "relative_news": null, "duplicate": False, "source_from_name": "南方周末", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "作品上架", "date": "2016-06-19", "same_from": "http://www.infzm.com/content/117062?from=groupmessage&isappinstalled=0", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://www.infzm.com/content/117062?from=groupmessage&isappinstalled=0", "content168": "天津杨柳青以入选国家级非物质文化遗产的木版年画而知名,杨柳青镇南乡的三十六村正面临拆迁,2011年3月22日,冯骥才领着学生用摄像机、录音机和照片记录镇南三十...", "source_website": null, "thumbnail_url": null, "_id": "http://www.infzm.com/content/117062?from=groupmessage&isappinstalled=0", "activity_type": "4"}, {"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-04-29 8:04", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://zjnews.zjol.com.cn/system/2016/04/29/021130212.shtml", "category": null, "news_author": "", "user_id": null, "title": "跟着冯骥才探古村", "relative_news": null, "duplicate": False, "source_from_name": "浙江在线", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "浙江在线", "date": "2016-06-19", "same_from": "http://zjnews.zjol.com.cn/system/2016/04/29/021130212.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://zjnews.zjol.com.cn/system/2016/04/29/021130212.shtml", "content168": "一个小时的走访很快就结束了,站在出镇口,冯骥才回头,看了看右手边业已建成的民宿,又看了看左手河岸边,那些晾晒着衣衫和腌菜的民宅,发出了一阵感慨:“一个村落..", "source_website": null, "thumbnail_url": null, "_id": "http://zjnews.zjol.com.cn/system/2016/04/29/021130212.shtml", "activity_type": "4"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-04-28 8:04", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://zj.zjol.com.cn/news/328479.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才考察鸣鹤古镇", "relative_news": null, "duplicate": False, "source_from_name": "浙江在线", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "浙江在线", "date": "2016-06-19", "same_from": "http://zj.zjol.com.cn/news/328479.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://zj.zjol.com.cn/news/328479.html", "content168": "昨天上午,中国文联副主席、中国民间文艺家协会主席、著名作家冯骥才来到鸣鹤古镇实地考察。市委常委、宣传部部长华红陪同。 走在鸣鹤古镇的青石板路,打年糕、捏面人... ", "source_website": null, "thumbnail_url": null, "_id": "http://zj.zjol.com.cn/news/328479.html", "activity_type": "4"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-25 18:07", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://money.163.com/16/0325/18/BJ18CDQ100254TI5.html", "category": null, "news_author": "", "user_id": null, "title": "冯骥才向家乡宁波慈城文化捐赠", "relative_news": null, "duplicate": False, "source_from_name": "网易财经", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "中国新闻网", "date": "2016-06-19", "same_from": "http://money.163.com/16/0325/18/BJ18CDQ100254TI5.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://money.163.com/16/0325/18/BJ18CDQ100254TI5.html", "content168": "中新网天津3月25日电 (记者 张道正)冯骥才向家乡宁波慈城文化捐赠仪式25日在天津大学冯骥才文学艺术研究院举行。此次文化捐赠是冯骥才对家乡情感的表达,是一种文化的...", "source_website": null, "thumbnail_url": null, "_id": "http://money.163.com/16/0325/18/BJ18CDQ100254TI5.html", "activity_type": "4"}]
        if acttypeid == "7":
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-07-28 15:36", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://www.china.com.cn/cppcc/2016-07/28/content_38978036.htm", "category": null, "news_author": "", "user_id": null, "title": "唐山大地震40周年祭：冯骥才陈道明的记忆", "relative_news": null, "source_from_name": "中国网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "中国网", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://www.china.com.cn/cppcc/2016-07/28/content_38978036.htm", "content168": "全国政协常委、中国民间文艺家协会主席冯骥才 当时由於天气闷热,我睡在阁楼的地板上。在我被突如其来的狂跳的地面猛烈弹起的一瞬,完全出於本能扑向睡在小铁床上的...”， 正如...", "source_website": null, "thumbnail_url": null, "_id": "http://cul.qq.com/a/20160429/049840.htm", "activity_type": "7"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-04-29 16:59", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://cul.qq.com/a/20160429/049840.htm", "category": null, "news_author": "", "user_id": null, "title": "冯骥才悼念陈忠实：他的成就代表当代文学的高峰", "relative_news": null, "duplicate": False, "source_from_name": "腾讯", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "腾讯文化", "date": "2016-06-19", "same_from": "http://cul.qq.com/a/20160429/049840.htm", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://cul.qq.com/a/20160429/049840.htm", "content168": "冯骥才悼念陈忠实:他的成就代表当代文学的高峰 冯骥才:陈忠实的作品一定比他的生命长久,这正是所有作家最期待的...", "source_website": null, "thumbnail_url": null, "_id": "http://cul.qq.com/a/20160429/049840.htm", "activity_type": "7"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-06-24 9:32", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://news.sohu.com/20160423/n445655986.shtml", "category": null, "news_author": "", "user_id": null, "title": "冯骥才祖居博物馆开馆 姜昆刘诗昆等助阵(图)", "relative_news": null, "duplicate": False, "source_from_name": "搜狐新闻", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "现代金报", "date": "2016-03-29", "same_from": "http://news.sohu.com/20160423/n445655986.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://news.sohu.com/20160423/n445655986.shtml", "content168": "冯骥才和刘诗昆、姜昆参观祖居院里的老井这两天,相信不少宁波人的朋友圈都被一件事刷屏了——文化大咖、著名作家冯骥才回到了故乡慈城。这,当然不是冯骥才第一次... ", "source_website": null, "thumbnail_url": null, "_id": "http://news.sohu.com/20160423/n445655986.shtml", "activity_type": "7"}]
            # add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-07-28 15:36", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://www.china.com.cn/cppcc/2016-07/28/content_38978036.htm", "category": null, "news_author": "", "user_id": null, "title": "唐山大地震40周年祭：冯骥才陈道明的记忆", "relative_news": null, "source_from_name": "中国网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "中国网", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://www.china.com.cn/cppcc/2016-07/28/content_38978036.htm", "content168": "全国政协常委、中国民间文艺家协会主席冯骥才 当时由於天气闷热,我睡在阁楼的地板上。在我被突如其来的狂跳的地面猛烈弹起的一瞬,完全出於本能扑向睡在小铁床上的...”， 正如...", "source_website": null, "thumbnail_url": null, "_id": "http://cul.qq.com/a/20160429/049840.htm", "activity_type": "7"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-04-29 16:59", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://cul.qq.com/a/20160429/049840.htm", "category": null, "news_author": "", "user_id": null, "title": "冯骥才悼念陈忠实：他的成就代表当代文学的高峰", "relative_news": null, "duplicate": False, "source_from_name": "腾讯", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "腾讯文化", "date": "2016-06-19", "same_from": "http://cul.qq.com/a/20160429/049840.htm", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": 冯骥才悼念陈忠实:他的成就代表当代文学的高峰 冯骥才:陈忠实的作品一定比他的生命长久,这正是所有作家最期待的...", "source_website": null, "thumbnail_url": null, "_id": "http://cul.qq.com/a/20160429/049840.htm", "activity_type": "7"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-06-24 9:32", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://news.sohu.com/20160423/n445655986.shtml", "category": null, "news_author": "", "user_id": null, "title": "冯骥才祖居博物馆开馆 姜昆刘诗昆等助阵(图)", "relative_news": null, "duplicate": False, "source_from_name": "搜狐新闻", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "现代金报", "date": "2016-03-29", "same_from": "http://news.sohu.com/20160423/n445655986.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://news.sohu.com/20160423/n445655986.shtml", "content168": "冯骥才和刘诗昆、姜昆参观祖居院里的老井这两天,相信不少宁波人的朋友圈都被一件事刷屏了——文化大咖、著名作家冯骥才回到了故乡慈城。这,当然不是冯骥才第一次... ", "source_website": null, "thumbnail_url": null, "_id": "http://news.sohu.com/20160423/n445655986.shtml", "activity_type": "7"}]
    if topic_name == u'赵实':
        if acttypeid == '2':
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-08-19 13:25", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://cpc.people.com.cn/n1/2016/0809/c117005-28623009.html", "category": null, "news_author": "", "user_id": null, "title": "第十届中国国际民间艺术节在西宁开幕 罗富和王国生赵实启动开幕", "relative_news": null, "source_from_name": "中国共产党新闻网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "青海日报", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://cpc.people.com.cn/n1/2016/0809/c117005-28623009.html", "content168": "全国政协副主席罗富和,青海省委书记王国生,中国文联党组书记、常务副主席赵实共同启动开幕。赵实,青海省委副书记、省长郝鹏,印度文化关系委员会主任拉贾塞卡分别致辞。...”， 正如...", "source_website": null, "thumbnail_url": null, "_id": "http://cpc.people.com.cn/n1/2016/0809/c117005-28623009.html", "activity_type": "2"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-02-03 15:07", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://www.cnjxol.com/gov/jxwyw/content/2016-02/03/content_2594265.htm", "category": null, "news_author": "", "user_id": null, "title": "中国文联党组领导看望慰问老艺术家", "relative_news": null, "duplicate": False, "source_from_name": "嘉兴在线", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "嘉兴文艺网", "date": "2016-06-19", "same_from": "http://www.cnjxol.com/gov/jxwyw/content/2016-02/03/content_2594265.htm", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://www.cnjxol.com/gov/jxwyw/content/2016-02/03/content_2594265.htm", "content168": "1月27日,中国文联党组书记、副主席赵实在北京医院看望中国文联荣誉委员高占祥时,与他亲切交谈。 本报记者  李博  摄 本报讯 猴年春节前夕,中国文联党组领导... ", "source_website": null, "thumbnail_url": null, "_id": "http://www.cnjxol.com/gov/jxwyw/content/2016-02/03/content_2594265.htm", "activity_type": "2"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-02-27 9:32", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://bbs.tianya.cn/post-384-36579-1.shtml", "category": null, "news_author": "", "user_id": null, "title": "潜江：擦亮剧本交易名片 建设中国戏剧之都(转载)", "relative_news": null, "duplicate": False, "source_from_name": "天涯据舍", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "军旅书法家", "date": "2016-02-27", "same_from": "http://bbs.tianya.cn/post-384-36579-1.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://bbs.tianya.cn/post-384-36579-1.shtml", "content168": "体现,是落实赵实书记对潜江提出的“打造戏剧之都”的又一创举,开创了国内种类最全、签约最多、影响最广的“三个第一”,吸引全国着名剧作家、剧评家和知名文化企业、文艺院团负责人近3", "source_website": null, "thumbnail_url": null, "_id": "http://bbs.tianya.cn/post-384-36579-1.shtml", "activity_type": "2"}]
        if acttypeid == '1':
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-08-15 10:54", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://gz.people.com.cn/n2/2016/0815/c369967-28836138.html", "category": null, "news_author": "", "user_id": null, "title": "中国文联党组书记赵实到新蒲新区参观考察", "relative_news": null, "source_from_name": "人民网贵州站", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "人民网", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://gz.people.com.cn/n2/2016/0815/c369967-28836138.html", "content168": "8月11号,中国文联党组书记、副主席赵实一行到我区,实地参观了遵义市城乡规划展览馆,就遵义城市规划建设、经济社会发展等情况进行考察,市委常委、宣传部部长郑欣,区... ", "source_website": null, "thumbnail_url": null, "_id": "http://gz.people.com.cn/n2/2016/0815/c369967-28836138.html", "activity_type": "1"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-05-23 07:56", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://gansu.gscn.com.cn/system/2016/05/23/011387456.shtml", "category": null, "news_author": "", "user_id": null, "title": "中国文联在陇南召开文艺工作座谈会 赵实李沛文出席会议并讲话", "relative_news": null, "duplicate": False, "source_from_name": "中国甘肃网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "中国甘肃网", "date": "2016-06-19", "same_from": "http://gansu.gscn.com.cn/system/2016/05/23/011387456.shtml", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://gansu.gscn.com.cn/system/2016/05/23/011387456.shtml", "content168": "赵实指出,各级文艺工作者要深刻领会习总书记在文艺工作座谈会上的讲话精神,把讲话作为思想武器来分辨是非,把握正确导向,常学常新,真信真用,更好地指导工作,推动发展...", "source_website": null, "thumbnail_url": null, "_id": "http://gansu.gscn.com.cn/system/2016/05/23/011387456.shtml", "activity_type": "1"},{"classid": null, "weight": 5, "more_same_link": null, "rank": 1, "datetime": "2016-03-21 9:32", "last_modify": 1458631347.504635, "replies": null, "summary": null, "id": "http://cpc.people.com.cn/n1/2016/0321/c117005-28215009.html", "category": null, "news_author": "", "user_id": null, "title": "李建华刘慧会见赵实刘大为", "relative_news": null, "duplicate": False, "source_from_name": "中国共产党网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.504635, "timestamp": 1453305600, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "宁夏日报", "date": "2016-02-27", "same_from": "http://cpc.people.com.cn/n1/2016/0321/c117005-28215009.html", "subeventid": "949e4351-29fa-4621-a38d-63f965f57a59", "pagesize": null, "url": "http://cpc.people.com.cn/n1/2016/0321/c117005-28215009.html", "content168": "近日,自治区党委书记、人大常委会主任李建华,自治区主席刘慧在北京会见了中国文联党组书记、副主席赵实,中国文联副主席、中国美术家协会主席刘大为和创作人民大会堂宁夏厅...", "source_website": null, "thumbnail_url": null, "_id": "http://cpc.people.com.cn/n1/2016/0321/c117005-28215009.html", "activity_type": "1"}]
        if acttypeid == '4':
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-05-23 20:28", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://hn.gansudaily.com.cn/system/2016/05/23/016090012.shtml", "category": null, "news_author": "", "user_id": null, "title": "赵实一行深入武都区开展精准扶贫", "relative_news": null, "source_from_name": "每日甘肃网", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "陇南日报", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://hn.gansudaily.com.cn/system/2016/05/23/016090012.shtml", "content168": "赵实一行回访武都区鱼龙镇上尹家村村民,并赠送全家福照片。本报记者杨小艾摄 每日甘肃网5月23日讯据陇南日报报道(记者杨小艾罗艳)5月19日,中国文联党组书记、副主...", "source_website": null, "thumbnail_url": null, "_id": "http://hn.gansudaily.com.cn/system/2016/05/23/016090012.shtml", "activity_type": "4"}]
        if acttypeid == '7':
            add_data = [{"classid": null, "more_same_link": null, "rank": 1, "datetime": "2016-08-11 09:56", "last_modify": 1458631347.632713, "replies": null, "summary": null, "id": "http://www.xnwbw.com/html/2016-08/11/content_84317.htm", "category": null, "news_author": "", "user_id": null, "title": "赵实收藏《西宁晚报》", "relative_news": null, "source_from_name": "西宁晚报", "showurl": null, "user_name": null, "user_image_url": null, "same_news_num": null, "user_url": null, "first_in": 1458631347.632713, "timestamp": 1466733060, "isV": null, "title1": null, "tplid": null, "key": null, "transmit_name": "西宁晚报", "date": "2016-05-02", "subeventid": "56f0f2b313de9935ba7d6e96_other", "pagesize": null, "url": "http://www.xnwbw.com/html/2016-08/11/content_84317.htm", "content168": "8月8日，本报推出的第十届中国国际民间艺术节特刊受到了中国文联党组书记、常务副主席赵实的充分肯定，也赢得了各国嘉宾和艺术家的盛赞。“西宁晚报全方位、多角度对中国国际民间艺术节进行了报道，宣传力度大，影响力、传播力不言而喻，我一定要好好收藏这份报纸。”8月8日，赵实对本报报道给予了充分肯定", "source_website": null, "thumbnail_url": null, "_id": "http://www.xnwbw.com/html/2016-08/11/content_84317.htm", "activity_type": "7"}]


    results =add_data
    cursor = mongo.db["post_" + str(topicid)].find({"activity_type": acttypeid}).sort("rank", pymongo.ASCENDING)
    
    same_count = 0
    for r in cursor:
        try:
            r["url"], r["title"] = id_url_title_dict[r["_id"]]
            if "http://" not in r["url"]:
                r["url"] = "http://" + r["url"]
        except KeyError:
            pass
        if r["title"] == u"“纪念徐悲鸿诞辰120周年座谈会”在人民大会堂举行":
            if same_count == 0:
                results.append(r)
                same_count += 1
            else:
                same_count += 1
        else:
            results.append(r)
    # if acttypeid == '1':
    #     results.append(add_data)
    return json.dumps(results[:])

@mod.route('/')
def index():
    """返回页面
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    module_name = u'社会活动分析'
    topicid = em.getEventIDByName(topic_name)
    distinct_types = []
    cursor = mongo.db["post_" + str(topicid)].find()
    for r in cursor:
        if "activity_type" in r:
            if r["activity_type"] == "null":
                r["activity_type"] = "7"
            distinct_types.append(r["activity_type"])

    counter = Counter(distinct_types)
    additem = {}
    if topic_name == u'冯骥才':
        additem["1"] = 6
        additem["2"] = 7
        additem["3"] = 3
        additem["4"] = 9
        additem["5"] = 0
        additem["6"] = 0
        additem["7"] = 3
    if topic_name == u'赵实':
        additem["1"] = 5
        additem["2"] = 3
        additem["3"] = 0
        additem["4"] = 1
        additem["5"] = 0
        additem["6"] = 0
        additem["7"] = 1
    type2count = dict(counter.most_common())
    distinct_types = list(set(distinct_types))

    distinct_types_list = [{"name": typeid2name[d], "id": d, "count": type2count[d]+additem[d]} for d in distinct_types]

    event = Event(topicid)

    start_ts = event.getStartts()
    default_startts = start_ts - 3600 * 24 * 30 * 12 * 2
    last_modify = event.getLastmodify()
    status = event.getStatus()
    end_ts = event.getEndts()
    if end_ts:
        end_date = ts2date(end_ts)
    else:
        end_date = u'无'
    modify_success = event.getModifysuccess()

    time_range = request.args.get('time_range', ts2date(default_startts) + '-' + ts2date(last_modify + 24 * 3600))

    return render_template('index/semantic.html', distinct_act_type=distinct_types_list, topic=topic_name, module_name=module_name,time_range=time_range, status=status, \
            start_date=ts2datetime(start_ts), end_date=end_date, last_modify=ts2datetime(last_modify), modify_success=modify_success)

@mod.route('/trend/')
def trend():
    """返回话题趋势页面
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    mode = request.args.get('mode', 'day')
    topicid = em.getEventIDByName(topic_name)
    event = Event(topicid)

    start_ts = event.getStartts()
    default_startts = start_ts - 3600 * 24 * 30
    last_modify = event.getLastmodify()
    status = event.getStatus()
    end_ts = event.getEndts()
    if end_ts:
        end_date = ts2date(end_ts)
    else:
        end_date = u'无'
    modify_success = event.getModifysuccess()

    time_range = request.args.get('time_range', ts2date(default_startts) + '-' + ts2date(last_modify + 24 * 3600))

    return render_template('index/trend.html', mode=mode, topic=topic_name, time_range=time_range, status=status, \
            start_date=ts2datetime(start_ts), end_date=end_date, last_modify=ts2datetime(last_modify), modify_success=modify_success)

@mod.route('/subeventpie/')
def subeventpie():
    """子观点占比
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    # topic_name = u'APEC2014-微博'
    topicid = em.getEventIDByName(topic_name)

    eventcomment = EventComments(topicid)
    comments = eventcomment.getAllNewsComments()

    cluster_ratio = dict()
    for comment in comments:
        if 'clusterid' in comment:
            clusterid = comment['clusterid']

            try:
                cluster_ratio[clusterid] += 1
            except KeyError:
                cluster_ratio[clusterid] = 1

    results = dict()
    total_count = sum(cluster_ratio.values())
    for clusterid, ratio in cluster_ratio.iteritems():
        feature = eventcomment.get_feature_words(clusterid)
        if feature and len(feature):
            results[','.join(feature[:3])] = float(ratio) / float(total_count)

    return json.dumps(results)

@mod.route('/sentimentpie/')
def sentimentpie():
    """
    情绪占比
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    # topic_name = u'APEC2014-微博'
    topicid = em.getEventIDByName(topic_name)

    eventcomment = EventComments(topicid)
    comments = eventcomment.getAllNewsComments()

    senti_dict = {
            0:'中性',
            1:'积极',
            2:'愤怒',
            3:'悲伤'
        }
    senti_ratio = dict()
    for comment in comments:
        if 'sentiment' in comment:
            sentiment = comment['sentiment']

            try:
                senti_ratio[sentiment] += 1
            except KeyError:
                senti_ratio[sentiment] = 1

    results = dict()
    total_count = sum(senti_ratio.values())
    for sentiment, ratio in senti_ratio.iteritems():
        label = senti_dict[sentiment]
        if label and len(label):
            results[label] = float(ratio) / float(total_count)

    return json.dumps(results)

@mod.route('/sentiment/')
def sentiment():
    """
    主观微博
    """
    topic_name = request.args.get('query', default_topic_name)
    # topic_name = u'APEC2014-微博'
    topicid = em.getEventIDByName(topic_name)

    eventcomment = EventComments(topicid)
    comments = eventcomment.getAllNewsComments()

    sentiment_comments = dict()
    for comment in comments:
        if 'sentiment' in comment:
            sentiment = comment['sentiment']
            try:
                sentiment_comments[sentiment].append(comment)
            except KeyError:
                sentiment_comments[sentiment] = [comment]
    return json.dumps(sentiment_comments)
    
@mod.route('/manage/')
def mange():
    """返回话题管理页面
    """
    return render_template('index/opinion.html')

@mod.route('/topics/')
def topics():
    """返回话题数据
    """
    em = EventManager()
    results = em.getEvents()
    final = []
    for r in results:
        topic = dict()
        try:
            topic['_id'] = str(r['_id'])
            topic['name'] = r['topic']
            topic['start_datetime'] = ts2datetime(r['startts'])
            if 'endts' in r:
                topic['end_datetime'] = ts2datetime(r['endts'])

            topic['status'] = r['status']
            topic['last_modify'] = ts2datetime(r['last_modify'])
            topic['modify_success'] = r['modify_success']
            final.append(topic)
        except KeyError:
            pass

    return json.dumps(final)

@mod.route('/trenddata/')
def trenddata():
    """获取每个话题按天走势
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    mode = request.args.get('mode', 'day')

    topicid = em.getEventIDByName(topic_name)
    event = Event(topicid)
    if mode == 'day':
        raw = event.getTrendData()
    else:
        raw = event.getHourData()

    dates = []
    counts = []
    for date, count in raw:
        dates.append(date)
        counts.append(count)

    return json.dumps({"dates": dates, "counts": counts})

@mod.route('/othertext/')
def othertext():
    topic_name = request.args.get('query', default_topic_name) # 话题名

    topicid = em.getEventIDByName(topic_name)
    event = Event(topicid)
    results = event.getOtherSubEventInfos()

    return json.dumps(results)

@mod.route('/eventriver/')
def eventriver():
    """event river数据
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    sort = request.args.get('sort', 'tfidf') # weight, addweight, created_at, tfidf
    end_ts = request.args.get('ts', None)
    during = request.args.get('during', None)

    if end_ts:
        end_ts = int(end_ts)

    if during:
        during = int(during)
        start_ts = end_ts - during

    topicid = em.getEventIDByName(topic_name)
    event = Event(topicid)
    subeventlist, dates, total_weight = event.getEventRiverData(start_ts, end_ts, sort=sort)

    return json.dumps({"dates": dates, "name": topic_name, "type": "eventRiver", "weight": total_weight, "eventList": subeventlist})

@mod.route('/keywords/')
def opinion_keywords():
    """关键词云数据
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    end_ts = request.args.get('ts', None)
    during = request.args.get('during', None)

    subevent_status = request.args.get('subevent', 'global')
    topk_keywords = request.args.get('topk', 50) # topk keywords

    if subevent_status != 'global':
        subeventid = subevent_status
        feature = Feature(subeventid)
        counter = Counter()
        counter.update(feature.get_newest())
        top_keywords_count = counter.most_common(topk_keywords)

        subevent_keywords = dict(top_keywords_count)

        return json.dumps(subevent_keywords)
    else:
        topicid = em.getEventIDByName(topic_name)
        event = Event(topicid)
        if end_ts:
            end_ts = int(end_ts)

        if during:
            during = int(during)

        counter = Counter()
        subevents = event.getSubEvents()
        for subevent in subevents:
            feature = Feature(subevent["_id"])
            counter.update(feature.get_newest())

        top_keywords_count = counter.most_common(topk_keywords)

        return json.dumps(dict(top_keywords_count))


@mod.route('/ratio/')
def opinion_ratio():
    """饼图数据
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    topk = request.args.get('topk', 10)
    end_ts = request.args.get('ts', None)
    during = request.args.get('during', None)
    subevent_status = request.args.get('subevent', 'global')

    if end_ts:
        end_ts = int(end_ts)

    if during:
        during = int(during)
        start_ts = end_ts - during

    topicid = em.getEventIDByName(topic_name)
    event = Event(topicid)

    if subevent_status != 'global':
        subeventid = subevent_status
        results = event.getMediaCount(start_ts, end_ts, subevent=subeventid)
    else:
        results = event.getMediaCount(start_ts, end_ts)

    from collections import Counter
    results = Counter(results)
    results = dict(results.most_common(topk))

    total_weight = sum(results.values())
    results = {k: float(v) / float(total_weight) for k, v in results.iteritems()}

    return json.dumps(results)


@mod.route('/weibos/')
def opinion_weibos():
    """重要信息排序
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    end_ts = request.args.get('ts', None)
    during = request.args.get('during', None)
    sort = request.args.get('sort', 'weight')
    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 10))
    subevent_status = request.args.get('subevent', 'global')

    if end_ts:
        end_ts = int(end_ts)

    if during:
        during = int(during)
        start_ts = end_ts - during

    topicid = em.getEventIDByName(topic_name)
    event = Event(topicid)

    results = dict()
    if subevent_status != 'global':
        subeventid = subevent_status
        results = event.getSortedInfos(start_ts, end_ts, key=sort, subeventid=subeventid, limit=limit, skip=skip)
        for r in results:
            try:
                r["url"], r["title"] = id_url_title_dict[r["_id"]]
                if "http://" not in r["url"]:
                    r["url"] = "http://" + r["url"]
            except KeyError:
                pass
        return json.dumps(results)
    else:
        results = event.getSortedInfos(start_ts, end_ts, key=sort, subeventid=None, limit=limit, skip=skip)
        for r in results:
            try:
                r["url"], r["title"] = id_url_title_dict[r["_id"]]
                if "http://" not in r["url"]:
                    r["url"] = "http://" + r["url"]
            except KeyError:
                pass
        return json.dumps(results)


@mod.route('/timeline/')
def timeline():
    topic_name = request.args.get('query', default_topic_name) # 话题名
    timestamp = int(request.args.get('ts'))
    subevent_status = request.args.get('subevent', 'global')
    during = int(request.args.get('during', 3600 * 24))

    topicid = em.getEventIDByName(topic_name)
    event = Event(topicid)

    results = dict()
    if subevent_status == 'global':
        count = event.getInfoCount(timestamp - during, timestamp)
        results["global"] = [timestamp, count]
    else:
        subeventid = subevent_status
        count = event.getInfoCount(timestamp - during, timestamp, subevent=subeventid)
        results[subeventid] = [timestamp, count]

    return json.dumps(results)

@mod.route('/peak/')
def getPeaks():
    '''获取拐点数据
    '''
    from peak_detection import detect_peaks
    limit = int(request.args.get('limit', 10))
    query = request.args.get('query', None)
    during = int(request.args.get('during', 24 * 3600))

    subevent_status = request.args.get('subevent', 'global')
    lis = request.args.get('lis', '')

    try:
        lis = [float(da) for da in lis.split(',')]
    except:
        lis = []

    ts_lis = request.args.get('ts', '')
    ts_lis = [float(da) for da in ts_lis.split(',')]

    new_zeros = detect_peaks(lis)

    time_lis = {}
    for idx, point_idx in enumerate(new_zeros):
        ts = ts_lis[point_idx]
        end_ts = ts

        time_lis[idx] = {
            'ts': end_ts * 1000,
            'title': str(idx)
        }

    return json.dumps(time_lis)

@mod.route('/comments/')
def commments():
    """
    查看有无评论
    """
    topic_name = request.args.get('query', default_topic_name)
    news_id = request.args.get('news_id', default_news_id)
    topicid = em.getEventIDByName(topic_name)

    eventcomment = EventComments(topicid)
    comments = eventcomment.getNewsComments(news_id)
    if comments:
        return json.dumps({"status":"success"})
    else:
        return json.dumps({"status":"fail"})

@mod.route("/report/")
def reportdata():
    """生成舆情报告
    """
    PRESENT_AB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../')

    topic_name = request.args.get('query', default_topic_name) # 话题名
    topicid = em.getEventIDByName(topic_name)

    report_txt_filepath = "./report/report.txt"
    report_doc_filepath = "./report/OutNetReport_%s.doc" % topicid

    nodes, links = getNetworkNodeLinks(topic_name)
    introduction = ""
    socialrelation_summary = ""
    socialactivity_summary = ""
    best_friends = ""
    start_datetime = "" 
    end_datetime = ""
    social_activity = getSocialActivities(topic_name)
    reputation = getRepu(topic_name)
    behavior = ""
    jianju = ""
    yuqing = ""
    shideshifan = ""
    overall = ""
    if topic_name == u"冯骥才":
        start_datetime = "2005" 
        end_datetime = "目前"
        introduction = u"冯骥才，男，1942年出生于天津，祖籍浙江宁波慈溪县（今宁波市江北区慈城镇），当代著名作家、文学家、艺术家，民间艺术工作者，民间文艺家，画家。现任全国政协常委，中国文学艺术界联合会副主席，中国民间文艺家协会主席，中国民主促进会中央副主席，国际民间艺术组织（IOV）副主席，中国小说学会会长等职。早年在天津从事绘画工作，后专职文学创作和民间文化研究，大力推动民间文化保护宣传工作。创作了大量优秀散文、小说和绘画作品，有多篇文章入选中小学、大学课本，如散文《珍珠鸟》。曾任天津市文联主席、国际笔会中国中心会员。是“文革”后崛起的“伤痕文学运动”代表作家，一九八五年后以“文化反思小说”对文坛产生深远影响"
        socialrelation_summary = u"受关注程度高，社会关系多"
        best_friends = u"顾同昭:家庭成员-妻子:山西平顺县旅游工作考察调研；浙江慈城寻根；“抢救民间文化遗产”公益画展；为《霓裳集》作序:绘画爱好者:0.8_冯宽:家庭成员-儿子:浙江慈城寻根；陪同参观天津大学冯骥才文学艺术研究院；参加盘点大同雕塑家底大型活动:冯骥才民间文化基金会秘书长，天津市宁波商会理事:0.6_韩美林:文艺工作者:被颁发宁夏“文化使者”聘书；参加韩美林美术馆开幕并讲话；提出“立法取缔活熊取胆”提案:国家一级美术师，清华大学美术学院教授，中央文史馆研究员:0.6_李雪健:文艺工作者:参与拍摄马年央视春晚《春晚是什么》先导片；参加文艺工作座谈会:中国文学艺术界联合会副主席，中国电影家协会主席:0.4_白岩松:媒体工作者:被颁发宁夏“文化使者”聘书；参加“山花奖”获奖代表、传承人代表座谈会:中央电视台主持人:0.4"
        friends_ratio = u"合作者:2_家庭成员:4_商界人士:2_境外人员:0_党政干部:19_其他人员:5_文艺工作者:30_媒体工作者:2"
        socialactivity_summary = u"活跃"
        # behavior的开头日期注意后面用冒号
        behavior += u"2012年3月7日:在回答记者提问时，对当时正处在“代笔门事件”风波中的作家韩寒表示支持：“如果我是韩寒，就不会搭理这事，你爱说什么说什么去，我还是继续写文章，不断地发表作品”。（数据清洗后，新闻121条，评论1078条，支持的占12.73%，反对的占70.91%，中立的占16.36%）"
        behavior += u"_2005年11月7日:在江西省婺源县举办的中国乡村文化旅游论坛上回答听众提问时称，婺源文化受外来文化影响很深，不是单一的徽文化。（数据清洗后，新闻19条，评论191条，支持的占7.69%，反对的占38.46%，中立的占53.85%）"
        jianju += u"无检举信息"
        yuqing += u"无"
        shideshifan = u"无"
        overall = u"参与的社会活动按出席频率排序依次为参政议政、文艺活动、学术活动，较守政治规矩，家人在各类事件中无特别表现。"
    elif topic_name == u"赵实":
        start_datetime = "2009" 
        end_datetime = "目前"
        introduction = u"女，汉族，1953年8月出生，吉林长春人，1979年加入中国共产党，1968年11月参加工作，吉林大学经济管理学院国民经济计划与管理专业毕业，在职研究生学历，经济学硕士，高级政工师，国家二级电影导演。现任中国文学艺术界联合会党组书记、副主席、书记处书记"
        socialrelation_summary = u"社会关系较多"
        best_friends = u"孙家正:党政干部:考察广东文艺工作；出席中央第二巡视组巡视中国文联工作动员会；出席“百花迎春”文艺界2016春节大联欢；出席第七届中国牡丹奖颁奖晚会；出席第二届北京国际电影开幕式:中国文学艺术界联合会主席:0.8_王莉莉:党政干部:出席“两代表一委员”学习实践活动座谈会；出席总局扶贫工作领导小组会议；出席总局纪念三八国际劳动妇女节暨表彰大会:国家广播电影电视总局直属机关党委书记:0.6_雷元亮:党政干部:出席观看艺术团艺术周演出:中国广播电视学会副会长:0.6_王太华:党政干部:会见四川甘孜州负责同志；考察国家中影数字制作基地；看望慰问王嘉猷同志:全国政协文史和学习委员会主任委员:0.6_姜树森:文艺工作者:联合导演电影《花园街五号》:广西电影制片厂、长春电影制片厂导演:0.4"
        friends_ratio = u"合作者:2_家庭成员:0_商界人士:0_境外人员:0_党政干部:35_其他人员:2_文艺工作者:16_媒体工作者:1"
        socialactivity_summary = u"较活跃"
        behavior = u"无"
        jianju += u"无检举信息"
        yuqing += u"无"
        shideshifan = u"无"
        overall += u"参与的社会活动按出席频率排序依次为参政议政、文艺活动、公益活动，较守政治规矩，家人在各类事件中无特别表现。"

    targets = []
    for link in links:
        target = link["target"]
        targets.append(target)

    counter = Counter(targets)
    user_count_dict = dict(counter.most_common())
    users = sorted(user_count_dict.iteritems(), key=lambda (k, v): v, reverse=False)
    uresult = users[-5:]

    data = {
        "name": topic_name,
        "introduction": introduction,
        "start": start_datetime,
        "end": end_datetime,
        "socialrelation_summary": socialrelation_summary,
        "best_friends": best_friends,
        "friends_ratio": friends_ratio,
        "socialactivity_summary": socialactivity_summary,
        "social_activity": social_activity,
        "reputation": reputation,
        "behavior": behavior,
        "jianju": jianju,
        "yuqing": yuqing,
        "shideshifan": shideshifan,
        "overall": overall
    }

    fw = open(report_txt_filepath, "w")
    fw.write("%s\n" % data["name"].encode("utf-8"))
    fw.write("%s\n" % data["start"])
    fw.write("%s\n" % data["end"])
    fw.write("%s\n" % data["introduction"].encode("utf-8"))
    fw.write("%s\n" % data["socialrelation_summary"].encode("utf-8"))
    fw.write("%s\n" % data["best_friends"].encode("utf-8"))
    fw.write("%s\n" % data["friends_ratio"].encode("utf-8"))
    fw.write("%s\n" % data["socialactivity_summary"].encode("utf-8"))
    fw.write("%s\n" % data["social_activity"].encode("utf-8"))
    fw.write("%s\n" % data["reputation"].encode("utf-8"))
    fw.write("%s\n" % data["behavior"].encode("utf-8"))
    fw.write("%s\n" % data["jianju"].encode("utf-8"))
    fw.write("%s\n" % data["yuqing"].encode("utf-8"))
    fw.write("%s\n" % data["shideshifan"].encode("utf-8"))
    fw.write("%s" % data["overall"].encode("utf-8"))
    fw.close()

    command = 'java -jar ./report/report.jar "%s" "%s"' % (report_txt_filepath, report_doc_filepath)
    os.system(command)
    
    return send_from_directory(PRESENT_AB_PATH, report_doc_filepath, as_attachment=True, attachment_filename=(u"网络舆情概要报告-%s.doc" % topic_name).encode("utf-8"))


@mod.route("/network/")
def network():
    """
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    module_name = u'社会关系分析'
    return render_template("index/network.html",module_name = module_name, topic=topic_name)

def getNetworkNodeLinks(name):
    nodes = []
    links = []
    if name == u"冯骥才":
        nodes = [
            {"category": 0, "name": "冯骥才", "value": 28},
            {"category": 1, "name": "冯宽", "value": 23},
            {"category": 1, "name": "顾同昭", "value": 23},
            #{"category": 1, "name": "冯吉甫", "value": 13},
            {"category": 1, "name": "戈长复", "value": 13},
            {"category": 3, "name": "柳静安", "value": 13},
            {"category": 3, "name": "耿彦波", "value": 13},
            {"category": 3, "name": "常嗣新", "value": 13},
            {"category": 3, "name": "郑一民", "value": 13},
            {"category": 3, "name": "李楠", "value": 13},
            {"category": 3, "name": "柯基生", "value": 13},
            {"category": 3, "name": "何平", "value": 13},
            {"category": 3, "name": "英达", "value": 13},
            {"category": 3, "name": "宋雨桂", "value": 13},
            {"category": 3, "name": "韩美林", "value": 23},
            {"category": 3, "name": "陈建文", "value": 13},
            {"category": 3, "name": "罗杨", "value": 13},
            {"category": 3, "name": "郭运德", "value": 13},
            {"category": 3, "name": "蒋效愚", "value": 13},
            {"category": 3, "name": "卢昌华", "value": 13},
            {"category": 3, "name": "崔波", "value": 13},
            {"category": 3, "name": "蔡国英", "value": 13},
            {"category": 3, "name": "徐广国", "value": 13},
            {"category": 3, "name": "何学清", "value": 13},
            {"category": 3, "name": "马力", "value": 13},
            {"category": 3, "name": "余秋雨", "value": 13},
            {"category": 3, "name": "莫言", "value": 13},
            {"category": 3, "name": "郑欣淼", "value": 13},
            {"category": 3, "name": "樊锦诗", "value": 13},
            {"category": 3, "name": "严歌苓", "value": 13},
            {"category": 3, "name": "刘诗昆", "value": 13},
            {"category": 3, "name": "陈履生", "value": 13},
            {"category": 3, "name": "白岩松", "value": 23},
            {"category": 3, "name": "王峻", "value": 13},
            {"category": 3, "name": "谢雅贞", "value": 13},
            {"category": 3, "name": "王勇超", "value": 13},
            {"category": 3, "name": "韦苏文", "value": 13},
            {"category": 3, "name": "刘华", "value": 13},
            {"category": 3, "name": "沙玛拉毅", "value": 13},
            {"category": 3, "name": "吴元新", "value": 13},
            {"category": 3, "name": "曹保明", "value": 13},
            {"category": 3, "name": "李雪健", "value": 23},
            {"category": 3, "name": "冯小刚", "value": 13},
            {"category": 3, "name": "陈道明", "value": 13},
            {"category": 3, "name": "章金莱", "value": 13},
            {"category": 3, "name": "徐沛东", "value": 13},
            {"category": 3, "name": "姜昆", "value": 13},
            {"category": 3, "name": "李谷一", "value": 13},
            {"category": 3, "name": "贾平凹", "value": 13},
            {"category": 3, "name": "冯其庸", "value": 13},
            {"category": 3, "name": "麦家", "value": 13},
            {"category": 3, "name": "严隽琪", "value": 13},
            {"category": 3, "name": "丁晓芳", "value": 13},
            {"category": 3, "name": "张贤亮", "value": 13},
            {"category": 3, "name": "贝陆慈", "value": 13},
            {"category": 3, "name": "郑云峰", "value": 13},
            {"category": 3, "name": "施光南", "value": 13},
            {"category": 3, "name": "洪如丁", "value": 13},
            {"category": 3, "name": "成龙", "value": 13},
            {"category": 3, "name": "吴秀波", "value": 13},
            {"category": 3, "name": "姚明", "value": 13},
            {"category": 3, "name": "林丹", "value": 13},
            {"category": 3, "name": "葛优", "value": 13},
            {"category": 3, "name": "范伟", "value": 13},
            {"category": 3, "name": "张嘉译", "value": 13},
            # # {"category": 2, "name": "陪同参观天津大学冯骥才文学艺术研究院", "value": 20,"label":"事件1"},
            # {"category": 2, "name": "盘点大同雕塑家底大型活动", "value": 20,"label":"事件2"},
            # {"category": 2, "name": "山西平顺县旅游工作考察调研", "value": 20,"label":"事件3"},
            # {"category": 2, "name": "《霓裳集》作序", "value": 20,"label":"事件4"},
            # {"category": 2, "name": "“抢救民间文化遗产”公益画展", "value": 20,"label":"事件5"},
            # {"category": 2, "name": "浙江慈城寻根", "value": 20,"label":"事件6"},
            # {"category": 2, "name": "《绝世金莲》出版", "value": 20,"label":"事件7"},
            # {"category": 2, "name": "作品被拍成电影《炮打双灯》", "value": 20,"label":"事件8"},
            # #{"category": 2, "name": "作品被拍成电影《酒婆》", "value": 20},
            # #{"category": 2, "name": "作品被拍成电影《一个人和一座城市》", "value": 20},
            # #{"category": 2, "name": "作品被拍成电影《神鞭》", "value": 20},
            # {"category": 2, "name": "邀请举办个人画展", "value": 20,"label":"事件9"},
            # {"category": 2, "name": "参加韩美林美术馆开幕并讲话", "value": 20,"label":"事件10"},
            # {"category": 2, "name": "主持中国民协第九次全国代表大会开幕式", "value": 20,"label":"事件11"},
            # {"category": 2, "name": "被颁发宁夏“文化使者”聘书", "value": 20,"label":"事件12"},
            # {"category": 2, "name": "参加保护与发展传统村落座谈会", "value": 20,"label":"事件13"},
            # {"category": 2, "name": "参加“山花奖”获奖代表、传承人代表座谈会", "value": 20,"label":"事件14"},
            # {"category": 2, "name": "参加文艺工作座谈会", "value": 20,"label":"事件15"},
            # {"category": 2, "name": "联合提出“立法取缔活熊取胆”提案", "value": 20,"label":"事件16"},
            # {"category": 2, "name": "在庆祝中国民主促进会成立70周年之际接受看望", "value": 20,"label":"事件17"},
            # {"category": 2, "name": "举行“冯骥才向家乡宁波慈城文化捐赠仪式”", "value": 20,"label":"事件18"},
            # {"category": 2, "name": "张贤亮去世之际接受采访", "value": 20,"label":"事件19"},
            # {"category": 2, "name": "获万宝龙国际艺术赞助大奖", "value": 20,"label":"事件20"},
            # {"category": 2, "name": "参与《在希望的田野上——人民音乐家施光南诞辰七十周年纪念音乐会》", "value": 20,"label":"事件21"},
            # {"category": 2, "name": "参与拍摄马年央视春晚《春晚是什么》先导片", "value": 20,"label":"事件22"},     
        ]

        links = [
            # # {"source": "冯骥才", "target": "陪同参观天津大学冯骥才文学艺术研究院", "weight": 3, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            # {"source": "冯骥才", "target": "盘点大同雕塑家底大型活动", "weight": 3, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            # {"source": "冯骥才", "target": "山西平顺县旅游工作考察调研", "weight": 3, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            # {"source": "冯骥才", "target": "《霓裳集》作序", "weight": 3, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            # {"source": "冯骥才", "target": "“抢救民间文化遗产”公益画展", "weight": 3, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            # {"source": "冯骥才", "target": "浙江慈城寻根", "weight": 3, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            # {"source": "冯骥才", "target": "《绝世金莲》出版", "weight": 3},
            # {"source": "冯骥才", "target": "作品被拍成电影《炮打双灯》", "weight": 3},
            # #{"source": "冯骥才", "target": "作品被拍成电影《酒婆》", "weight": 3},
            # #{"source": "冯骥才", "target": "作品被拍成电影《一个人和一座城市》", "weight": 3},
            # #{"source": "冯骥才", "target": "作品被拍成电影《神鞭》", "weight": 3},
            # {"source": "冯骥才", "target": "邀请举办个人画展", "weight": 3},
            # {"source": "冯骥才", "target": "参加韩美林美术馆开幕并讲话", "weight": 3},
            # {"source": "冯骥才", "target": "主持中国民协第九次全国代表大会开幕式", "weight": 3},
            # {"source": "冯骥才", "target": "被颁发宁夏“文化使者”聘书", "weight": 3},
            # {"source": "冯骥才", "target": "参加保护与发展传统村落座谈会", "weight": 3},
            # {"source": "冯骥才", "target": "参加“山花奖”获奖代表、传承人代表座谈会", "weight": 3},
            # {"source": "冯骥才", "target": "参加文艺工作座谈会", "weight": 3},
            # {"source": "冯骥才", "target": "联合提出“立法取缔活熊取胆”提案", "weight": 3},
            # {"source": "冯骥才", "target": "在庆祝中国民主促进会成立70周年之际接受看望", "weight": 3},
            # {"source": "冯骥才", "target": "举行“冯骥才向家乡宁波慈城文化捐赠仪式”", "weight": 3},
            # {"source": "冯骥才", "target": "张贤亮去世之际接受采访", "weight": 3},
            # {"source": "冯骥才", "target": "获万宝龙国际艺术赞助大奖", "weight": 3},
            # {"source": "冯骥才", "target": "参与《在希望的田野上——人民音乐家施光南诞辰七十周年纪念音乐会》", "weight": 3},
            # {"source": "冯骥才", "target": "参与拍摄马年央视春晚《春晚是什么》先导片", "weight": 3},
            {"source": "冯骥才", "target": "冯宽", "weight": 8, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯骥才", "target": "柳静安", "weight": 4},
            {"source": "冯骥才", "target": "冯宽", "weight": 8, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯骥才", "target": "耿彦波", "weight": 4},
            {"source": "冯骥才", "target": "顾同昭", "weight": 8, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯骥才", "target": "常嗣新", "weight": 4},
            {"source": "冯骥才", "target": "郑一民", "weight": 4},
            {"source": "冯骥才", "target": "顾同昭", "weight": 4, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯骥才", "target": "顾同昭", "weight": 4, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯骥才", "target": "戈长复", "weight": 8, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯骥才", "target": "顾同昭", "weight": 4, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯骥才", "target": "冯宽", "weight": 4, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯骥才", "target": "李楠", "weight": 4},
            {"source": "冯骥才", "target": "柯基生", "weight": 4},
            {"source": "冯骥才", "target": "何平", "weight": 4},
            {"source": "冯骥才", "target": "英达", "weight": 4},
            {"source": "冯骥才", "target": "宋雨桂", "weight": 4},
            {"source": "冯骥才", "target": "韩美林", "weight": 4},
            {"source": "冯骥才", "target": "陈建文", "weight": 4},
            {"source": "冯骥才", "target": "罗杨", "weight": 4},
            {"source": "冯骥才", "target": "郭运德", "weight": 4},
            {"source": "冯骥才", "target": "蒋效愚", "weight": 4},
            {"source": "冯骥才", "target": "卢昌华", "weight": 4},
            {"source": "冯骥才", "target": "崔波", "weight": 4},
            {"source": "冯骥才", "target": "蔡国英", "weight": 4},
            {"source": "冯骥才", "target": "徐广国", "weight": 4},
            {"source": "冯骥才", "target": "何学清", "weight": 4},
            {"source": "冯骥才", "target": "马力", "weight": 4},
            {"source": "冯骥才", "target": "余秋雨", "weight": 4},
            {"source": "冯骥才", "target": "莫言", "weight": 4},
            {"source": "冯骥才", "target": "郑欣淼", "weight": 4},
            {"source": "冯骥才", "target": "樊锦诗", "weight": 4},
            {"source": "冯骥才", "target": "严歌苓", "weight": 4},
            {"source": "冯骥才", "target": "刘诗昆", "weight": 4},
            {"source": "冯骥才", "target": "陈履生", "weight": 4},
            {"source": "冯骥才", "target": "韩美林", "weight": 4},
            {"source": "冯骥才", "target": "白岩松", "weight": 4},
            {"source": "冯骥才", "target": "王峻", "weight": 4},
            {"source": "冯骥才", "target": "谢雅贞", "weight": 4},
            {"source": "冯骥才", "target": "王勇超", "weight": 4},
            {"source": "冯骥才", "target": "韦苏文", "weight": 4},
            {"source": "冯骥才", "target": "刘华", "weight": 4},
            {"source": "冯骥才", "target": "沙玛拉毅", "weight": 4},
            {"source": "冯骥才", "target": "吴元新", "weight": 4},
            {"source": "冯骥才", "target": "曹保明", "weight": 4},
            {"source": "冯骥才", "target": "罗杨", "weight": 4},
            {"source": "冯骥才", "target": "李雪健", "weight": 4},
            {"source": "冯骥才", "target": "冯小刚", "weight": 4},
            {"source": "冯骥才", "target": "陈道明", "weight": 4},
            {"source": "冯骥才", "target": "章金莱", "weight": 4},
            {"source": "冯骥才", "target": "徐沛东", "weight": 4},
            {"source": "冯骥才", "target": "姜昆", "weight": 4},
            {"source": "冯骥才", "target": "李谷一", "weight": 4},
            {"source": "冯骥才", "target": "贾平凹", "weight": 4},
            {"source": "冯骥才", "target": "冯其庸", "weight": 4},
            {"source": "冯骥才", "target": "麦家", "weight": 4},
            {"source": "冯骥才", "target": "韩美林", "weight": 4},
            {"source": "冯骥才", "target": "严隽琪", "weight": 4},
            {"source": "冯骥才", "target": "丁晓芳", "weight": 4},
            {"source": "冯骥才", "target": "张贤亮", "weight": 4},
            {"source": "冯骥才", "target": "贝陆慈", "weight": 4},
            {"source": "冯骥才", "target": "郑云峰", "weight": 4},
            {"source": "冯骥才", "target": "洪如丁", "weight": 4},
            {"source": "冯骥才", "target": "施光南", "weight": 4},
            {"source": "冯骥才", "target": "成龙", "weight": 4},
            {"source": "冯骥才", "target": "吴秀波", "weight": 4},
            {"source": "冯骥才", "target": "姚晨", "weight": 4},
            {"source": "冯骥才", "target": "姚明", "weight": 4},
            {"source": "冯骥才", "target": "林丹", "weight": 4},
            {"source": "冯骥才", "target": "葛优", "weight": 4},
            {"source": "冯骥才", "target": "李雪健", "weight": 4},
            {"source": "冯骥才", "target": "范伟", "weight": 4},
            {"source": "冯骥才", "target": "张嘉译", "weight": 4},
            {"source": "冯骥才", "target": "白岩松", "weight": 4},
        ]
    elif name == u"冯宽":
        nodes = [
            {"category": 0, "name": "冯宽", "value": 28},
            
            {"category": 1, "name": "冯骥才", "value": 23},
            {"category": 1, "name": "顾同昭", "value": 23},
            {"category": 1, "name": "戈长复", "value": 23},
            
            {"category": 3, "name": "柳静安", "value": 13},
            {"category": 3, "name": "郑云峰", "value": 13},
            {"category": 3, "name": "孟鸣飞", "value": 13},
            {"category": 3, "name": "王悲秋", "value": 13},
            {"category": 3, "name": "陈玉恒", "value": 13},
            {"category": 3, "name": "朱树江", "value": 13},
            {"category": 3, "name": "陆炳文", "value": 13},
            {"category": 3, "name": "耿彦波", "value": 13},
            {"category": 3, "name": "张建勋", "value": 13},
            {"category": 3, "name": "李春梅", "value": 13}
            
        #     {"category": 2, "name": "参观青岛出版集团荣誉室以及职工书吧", "value": 20,"label":"事件1"},
        #     {"category": 2, "name": "出席“意品天真——王悲秋先生画展及签名售书”", "value": 20,"label":"事件2"},
        #     {"category": 2, "name": "出席春祭大典暨乙未年春节传统文化庙会", "value": 20,"label":"事件3"},
        #     {"category": 2, "name": "参与盘点大同雕塑家底大型活动", "value": 20,"label":"事件4"},
        #     {"category": 2, "name": "参与津苏联办创建先进基层组织建设工作交流活动", "value": 20,"label":"事件5"},
        #     {"category": 2, "name": "陪同汾酒集团文化中心主任柳静安参观天津大学冯骥才文学艺术研究院", "value": 20,"label":"事件6"},
        #     {"category": 2, "name": "浙江慈城寻根", "value": 20,"label":"事件7"},
        ]

        links = [
            # {"source": "冯宽", "target": "参观青岛出版集团荣誉室以及职工书吧", "weight": 3},
            # {"source": "冯宽", "target": "出席“意品天真——王悲秋先生画展及签名售书”", "weight": 3},
            # {"source": "冯宽", "target": "出席春祭大典暨乙未年春节传统文化庙会", "weight": 3},
            # {"source": "冯宽", "target": "参与盘点大同雕塑家底大型活动", "weight": 3},
            # {"source": "冯宽", "target": "参与津苏联办创建先进基层组织建设工作交流活动", "weight": 3},
            # {"source": "冯宽", "target": "陪同汾酒集团文化中心主任柳静安参观天津大学冯骥才文学艺术研究院", "weight": 3},
            # {"source": "冯宽", "target": "浙江慈城寻根", "weight": 3},
            {"source": "冯宽", "target": "郑云峰", "weight": 4},
            {"source": "冯宽", "target": "孟鸣飞", "weight": 4},
            {"source": "冯宽", "target": "王悲秋", "weight": 4},
            {"source": "冯宽", "target": "陈玉恒", "weight": 4},
            {"source": "冯宽", "target": "朱树江", "weight": 4},
            {"source": "冯宽", "target": "陆炳文", "weight": 4},
            {"source": "冯宽", "target": "冯骥才", "weight": 10, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯宽", "target": "耿彦波", "weight": 4},
            {"source": "冯宽", "target": "张建勋", "weight": 4},
            {"source": "冯宽", "target": "李春梅", "weight": 4},
            {"source": "冯宽", "target": "冯骥才", "weight": 4},
            {"source": "冯宽", "target": "柳静安", "weight": 4},
            {"source": "冯宽", "target": "戈长复", "weight": 8, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}},
            {"source": "冯宽", "target": "顾同昭", "weight": 8, "itemStyle": {"normal": {"width": 3.5,"color":'#F2935C'}}}
        ]

    elif name == u"赵实":
        nodes = [
            {"category": 0, "name": "赵实", "value": 28},
            {"category": 3, "name": "王东明", "value": 13},
            {"category": 3, "name": "孙家正", "value": 23},
            {"category": 3, "name": "李五四", "value": 13},
            {"category": 3, "name": "罗志军", "value": 13},
            {"category": 3, "name": "钱小芊", "value": 13},

            {"category": 3, "name": "李岚清", "value": 13},
            {"category": 3, "name": "章素贞", "value": 13},
            {"category": 3, "name": "刘延东", "value": 13},
            {"category": 3, "name": "卢展工", "value": 13},
            {"category": 3, "name": "王家瑞", "value": 13},

            {"category": 3, "name": "王健", "value": 13},
            {"category": 3, "name": "韩再芬", "value": 13},
            {"category": 3, "name": "刘奇葆", "value": 13},
            {"category": 3, "name": "刘淇", "value": 13},
            {"category": 3, "name": "路甬祥", "value": 13},
            {"category": 3, "name": "詹姆斯-卡梅隆", "value": 13},
            {"category": 3, "name": "邓文迪", "value": 13},
            {"category": 3, "name": "章子怡", "value": 13},
            {"category": 3, "name": "范冰冰", "value": 13},
            {"category": 3, "name": "冯小刚", "value": 13},
            {"category": 3, "name": "姜文", "value": 13},
            {"category": 3, "name": "徐克", "value": 13},
            {"category": 3, "name": "欧阳中石", "value": 13},
            {"category": 3, "name": "张雪", "value": 13},
            {"category": 3, "name": "张海", "value": 13},
            {"category": 3, "name": "王元军", "value": 13},
            {"category": 3, "name": "刘永富", "value": 13},
            {"category": 3, "name": "李前光", "value": 13},
            {"category": 3, "name": "夏红民", "value": 13},
            # {"category": 2, "name": "王东明看望赵实一行并就有关工作交换意见", "value": 20,"label":"事件1"},
            # {"category": 2, "name": "中国文联专题研讨繁荣发展社会主义文艺意见", "value": 20,"label":"事件2"},
            # {"category": 2, "name": "中央第二巡视组巡视中国文联工作动员会召开", "value": 20,"label":"事件3"},
            # {"category": 2, "name": "引领风气之先 以优秀作品报答人民——孙家正、赵实考察广东文艺工作", "value": 20,"label":"事件4"},
            # {"category": 2, "name": "多出有筋骨、有道德、有温度的文艺作品", "value": 20,"label":"事件5"},
            # {"category": 2, "name": "李岚清篆刻书法艺术展在京举行", "value": 20,"label":"事件6"},
            # {"category": 2, "name": "“百花迎春”文学艺术界2020春节大联欢举行", "value": 20,"label":"事件7"},
            # {"category": 2, "name": "出席国家大剧院演出黄梅戏《徽州往事》", "value": 20,"label":"事件8"},
            # {"category": 2, "name": "第二届北京国际电影开幕", "value": 20,"label":"事件9"},
            # {"category": 2, "name": "参观“欧阳中石书中华美德古训展”", "value": 20,"label":"事件10"},
            # {"category": 2, "name": "出席第七届中国牡丹奖颁奖晚会", "value": 20,"label":"事件11"},
            # {"category": 2, "name": "出席甘肃省双联行动精准扶贫精准脱贫主题晚会", "value": 20,"label":"事件12"},
        ]
        links = [
            # {"source": "赵实", "target": "王东明看望赵实一行并就有关工作交换意见", "weight": 3},
            # {"source": "赵实", "target": "中国文联专题研讨繁荣发展社会主义文艺意见", "weight": 3},
            # {"source": "赵实", "target": "中央第二巡视组巡视中国文联工作动员会召开", "weight": 3},
            # {"source": "赵实", "target": "引领风气之先 以优秀作品报答人民——孙家正、赵实考察广东文艺工作", "weight": 3},
            # {"source": "赵实", "target": "多出有筋骨、有道德、有温度的文艺作品", "weight": 3},
            # {"source": "赵实", "target": "李岚清篆刻书法艺术展在京举行", "weight": 3},
            # {"source": "赵实", "target": "“百花迎春”文学艺术界2016春节大联欢举行", "weight": 3},
            # {"source": "赵实", "target": "出席国家大剧院演出黄梅戏《徽州往事》", "weight": 3},
            # {"source": "赵实", "target": "第二届北京国际电影开幕", "weight": 3},
            # {"source": "赵实", "target": "参观“欧阳中石书中华美德古训展”", "weight": 3},
            # {"source": "赵实", "target": "出席第七届中国牡丹奖颁奖晚会", "weight": 3},
            # {"source": "赵实", "target": "出席甘肃省双联行动精准扶贫精准脱贫主题晚会", "weight": 3},
            {"source": "赵实", "target": "王东明", "weight": 4},
            {"source": "赵实", "target": "孙家正", "weight": 4},
            {"source": "赵实", "target": "李五四", "weight": 4},
            {"source": "赵实", "target": "孙家正", "weight": 4},
            {"source": "赵实", "target": "罗志军", "weight": 4},
            {"source": "赵实", "target": "钱小芊", "weight": 4},
            {"source": "赵实", "target": "王健", "weight": 4},
            {"source": "赵实", "target": "李岚清", "weight": 4},
            {"source": "赵实", "target": "章素贞", "weight": 4},
            {"source": "赵实", "target": "刘延东", "weight": 4},
            {"source": "赵实", "target": "卢展工", "weight": 4},
            {"source": "赵实", "target": "王家瑞", "weight": 4},
            {"source": "赵实", "target": "孙家正", "weight": 4},
            {"source": "赵实", "target": "韩再芬", "weight": 4},
            {"source": "赵实", "target": "刘奇葆", "weight": 4},
            {"source": "赵实", "target": "刘淇", "weight": 4},
            {"source": "赵实", "target": "路甬祥", "weight": 4},
            {"source": "赵实", "target": "孙家正", "weight": 4},
            {"source": "赵实", "target": "詹姆斯-卡梅隆", "weight": 4},
            {"source": "赵实", "target": "邓文迪", "weight": 4},
            {"source": "赵实", "target": "章子怡", "weight": 4},
            {"source": "赵实", "target": "范冰冰", "weight": 4},
            {"source": "赵实", "target": "冯小刚", "weight": 4},
            {"source": "赵实", "target": "姜文", "weight": 4},
            {"source": "赵实", "target": "徐克", "weight": 4},
            {"source": "赵实", "target": "欧阳中石", "weight": 4},
            {"source": "赵实", "target": "张雪", "weight": 4},
            {"source": "赵实", "target": "张海", "weight": 4},
            {"source": "赵实", "target": "王元军", "weight": 4},
            {"source": "赵实", "target": "孙家正", "weight": 4},
            {"source": "赵实", "target": "刘永富", "weight": 4},
            {"source": "赵实", "target": "李前光", "weight": 4},
            {"source": "赵实", "target": "夏红民", "weight": 4},   
        ]

    return nodes, links

@mod.route("/networkdata/")
def networkdata():
    """
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    data = None
    category_list = ['中心人物', '家庭成员',  '好友']
    # category_dict = [{"name": c} for c in category_list]
    category_dict = [{"name":"中心人物","itemStyle": {"normal":{"color":'#EDD3A1'}}},{"name":"家庭成员","itemStyle": {"normal":{"color":'#D1B4B9'}}},{"name":"好友","itemStyle": {"normal":{"color":'#F2DEDE'}}}]
    
    nodes, links = getNetworkNodeLinks(topic_name)
    
    data = {
        "category_list": category_list,
        "category_dict": category_dict,
        "nodes": nodes,
        "links": links
    }

    return json.dumps(data)

@mod.route("/nodeinfo/", methods=["GET", "POST"])
def nodeinfo():
    """节点信息
    """
    if request.method == "POST":
        node_data = None
        name = request.form["name"]
        if name == u"冯骥才":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"当代著名作家、文学家、艺术家，民间艺术工作者，民间文艺家，画家。早年在天津从事绘画工作，后专职文学创作和民间文化研究。",
                "url": "http://baike.baidu.com/link?url=IgZUSMlXTKanp6UfAbjcRip25maZ28Kx4qklAiV7CxEWSk9RpKKvUur75BjJ26KFAPprKJ34bJ8AWBsb71O5wq"
            }
        elif name == u"冯宽":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"冯骥才民间文化基金会秘书长，冯骥才之子",
                "url": "/news/relevant/?query=冯宽"
            }
        elif name == u"顾同昭":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"绘画爱好者，著有白描仕女图《霓裳集》，冯骥才的妻子",
                "url": ""
            }            
        elif name == u"冯吉甫":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"金融家，冯骥才的父亲",
                "url": ""
            }
        elif name == u"戈长复":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"冯骥才的母亲",
                "url": ""
            }
        elif name == u"柳静安":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"汾酒集团文化中心主任，汾酒文化学者，是汾酒文化的传承人之一",
                "url": "http://blog.sina.com.cn/s/blog_54ecfe570101mt4m.html"
            }
        elif name == u"耿彦波":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"太原市委副书记，市人民政府市长、党组书记",
                "url": "https://zh.wikipedia.org/wiki/%E8%80%BF%E5%BD%A6%E6%B3%A2"
            }
        elif name == u"常嗣新":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"山西省文联主席团委员、山西省民间文艺家协会主席、中国民间文艺家协会理事",
                "url": "http://baike.baidu.com/view/9543044.htm"
            }
        elif name == u"郑一民":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"河北省民间文艺家协会主席，河北省徐福千童会秘书长、编审",
                "url": "http://baike.baidu.com/subview/3282318/8836192.htm"
            }
        elif name == u"李楠":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"1993年开始从事新闻摄影，先后在《山东画报》、《大众日报》担任摄影记者，现为山东工艺美术学院摄影专业教师",
                "url": "http://baike.baidu.com/subview/34867/6532323.htm#viewPageContent"
            }
        elif name == u"柯基生":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"亚洲最大宗三寸金莲收藏家，国际知名外科医生，现任广川医院院长、台湾性学会顾问",
                "url": "https://zh.wikipedia.org/wiki/%E6%9F%AF%E5%9F%BA%E7%94%9F"
            }
        elif name == u"何平":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国大陆知名导演，中国电影集团公司一级导演",
                "url": "https://zh.wikipedia.org/wiki/%E4%BD%95%E5%B9%B3_(%E5%A4%A7%E9%99%86%E5%AF%BC%E6%BC%94)"
            }
        elif name == u"英达":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地男演员、导演。北京英氏影视传媒公司艺术总监和总导演，北京吉利大学英氏影视学院院长",
                "url": "http://baike.baidu.com/view/33391.htm"
            }
        elif name == u"宁静":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名内地女演员，1990年代中国大陆女星的代表人物之一，代表作有《我很丑，可是我很温柔》、《阳光灿烂的日子》、《孝庄秘史》等，宁静表演上富有野性和张力，给观众留下了很深的印象",
                "url": "http://baike.baidu.com/subview/40309/5946268.htm"
            }
        elif name == u"巫刚":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国影视演员，1983毕业于解放军艺术学院戏剧系并被国家领导分配到八一电影制片厂当演员，此后他在许多影视片中演出各种不同类型的角色",
                "url": "http://baike.baidu.com/view/199902.htm"
            }
        elif name == u"赵小锐":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国男演员，1978年考入中国青年艺术剧院作为话剧演员，因出演《水浒传》的李逵为观众熟知",
                "url": "http://baike.baidu.com/view/461198.htm"
            }
        elif name == u"高阳":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"大陆演员，曾参演《少年包青天Ⅰ》",
                "url": "http://baike.baidu.com/link?url=isufaMX86JxJGLTj7H0RBy2pPXH7e_kJxPDB_pmEfBqPnEfZ0uUjmBEA9FC4UoqYnJifEvdoeZchcrhg_Uxbw5rkCXQ9J8PobWPvcji4Qp7"
            }
        elif name == u"徐正运":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"毕业于中央戏曲学院表演系，共参与了100多部话剧与电影的表演与创作，曾在多部电视剧电影中饰演杜聿明",
                "url": "http://baike.baidu.com/view/3075816.htm"
            }
        elif name == u"常吴":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"配音演员",
                "url": ""
            }
        elif name == u"韦大军":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"导演、编剧，1987年毕业于北京广播学院（今中国传媒大学），先后从事文艺、纪录片、电视剧等多种类型的艺术创作",
                "url": "http://baike.baidu.com/link?url=Vlqo0aOuFFDJ3k_4KWftI_N1reU0oaBUPwbqBaHg5T0u8wr9IBK-LJvWdK9mDNrkz--b0qZBk5Nw4N-k_QyW3_"
            }
        elif name == u"李辉":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地导演、编剧，中国电影导演协会会员，中国电影艺术家协会会员。曾在徐州电视台从事记者、摄像、编导等工作，后进入南京电影制片厂担任影视剧导演，任南京电影制片厂编导室主任",
                "url": "http://baike.baidu.com/link?url=2viSkAQsRprqlJ7UfUrCoQQm0aQ2bhmfm-meWk_Akjii_lrVyOLxVNw8GRAa77r-Dke8ffHeqO-5ubpDeaZT-EvWQJTTAZo6VhhZ6ooNvLW"
            }
        elif name == u"刘心武":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"演员、编剧，中国当代著名作家、红学研究家，擅长青年题材写作。研究《红楼梦》长达十余年，坚持从秦可卿这一人物入手，开创了红学研究的一个新分支——秦学",
                "url": "http://baike.baidu.com/subview/33944/11068876.htm"
            }
        elif name == u"方方":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"湖北省作家协会主席、省文学创作系列高评委会主任，中国作协全委会委员，一级作家",
                "url": "http://baike.baidu.com/subview/16768/7908241.htm"
            }
        elif name == u"邓刚":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国作协全国委员，辽宁省作协副主席，大连市文联副主席及作家协会主席，辽宁省劳动模范，大连市劳动模范",
                "url": "http://baike.baidu.com/subview/391098/8464667.htm"
            }
        elif name == u"李杭育":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级作家，80年代专注写作，“寻根派”代表人物\"；90年代从事纪录片创作，大量作品发表于中国中央电视台；2000年开始研究古典音乐和电影；2008年开始转型油画",
                "url": "http://baike.baidu.com/view/2342349.htm"
            }
        elif name == u"孙甘露":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"作家，上海网络作家协会副会长。1986年发表成名作《访问梦境》，随后的《我是少年酒坛子》和《信使之函》则使他成为一个典型的“先锋派”",
                "url": "http://baike.baidu.com/view/118312.htm"
            }
        elif name == u"周友朝":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国电影导演，代表作有《步入辉煌》、《一棵树》、《高原如梦》",
                "url": "http://baike.baidu.com/view/1058110.htm"
            }
        elif name == u"任程伟":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"影视演员，1993年毕业于上海戏剧学院，1994年首次参演电视剧《帝女花》，2001年主演《大雪无痕》，并获得第十九届中国电视金鹰奖观众最喜爱男演员",
                "url": "http://baike.baidu.com/view/230883.htm"
            }
        elif name == u"姚晨":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地女演员，别名“微博女王”，毕业于北京电影学院表演系，成名作《武林外传》，代表作有《潜伏》、《离婚律师》、《爱出色》、《九层妖塔》",
                "url": "http://baike.baidu.com/view/6340.htm"
            }
        elif name == u"罗京民":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国大陆男演员，代表作品有《士兵突击》、《我的团长我的团》、《国宝迷踪》",
                "url": "http://baike.baidu.com/view/1636792.htm"
            }            
        elif name == u"宋雨桂":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"民革中央画院院长、中国美术家协会理事、辽宁省文联副主席、辽宁美术家协会主席、辽宁美术馆馆长、国家一级美术师、辽宁省政协常委、民革辽宁省副主委",
                "url": "http://songyujia.findart.com.cn/"
            }
        elif name == u"韩美林":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级美术师，清华大学美术学院教授，中央文史馆研究员，中国当代极具影响力的天才造型艺术家，在绘画、书法、雕塑、陶瓷、设计乃至写作等诸多艺术领域都有很高造诣",
                "url": "http://baike.baidu.com/view/30623.htm"
            }
        elif name == u"陈建文":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国大陆演员，1979年2月14日生，毕业于CMA北京现代音乐学院JAZZ音乐系，2004年加入TVB",
                "url": "http://baike.baidu.com/subview/419681/12861533.htm"
            }
        elif name == u"罗杨":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名书法家，中国文联主席团委员，中国民间文艺家协会分党组书记、驻会副主席、秘书长",
                "url": "http://baike.baidu.com/subview/728589/8129279.htm"
            }
        elif name == u"郭运德":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"天津市文化广播影视局（天津市文物局）局长",
                "url": "http://baike.baidu.com/view/1038084.htm"
            }
        elif name == u"蒋效愚":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"全国政协教科文卫体委员会副主任，北京奥运城市发展促进会副会长",
                "url": "http://baike.baidu.com/view/418648.htm"
            }
        elif name == u"卢昌华":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"全国政协港澳台侨委员会副主任。1973年至1978年在青阳县插队，曾先后任公社副书记、书记，中共青阳县委副书记",
                "url": "http://baike.baidu.com/view/5295863.htm"
            }
        elif name == u"崔波":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"演员，毕业于北京电影学院表演系，代表作有《华胥引》、《川军团血战到底》、《尖刀队》、《少年天子》",
                "url": "http://baike.baidu.com/subview/715508/8733579.htm"
            }
        elif name == u"蔡国英":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"宁夏回族自治区党委常委、宣传部部长，自治区政协副主席、政协党组副书记",
                "url": "http://baike.baidu.com/subview/318069/9254300.htm"
            }
        elif name == u"徐广国":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"宁夏回族自治区党委常委、银川市委书记",
                "url": "http://baike.baidu.com/view/682342.htm"
            }
        elif name == u"何学清":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"宁夏自治区人大常委会党组副书记，中央党校在职研究生班经济管理专业毕业，中央党校研究生学历",
                "url": "http://baike.baidu.com/view/715514.htm"
            }
        elif name == u"马力":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中央戏剧学院京剧系教研室主任，著名青年京剧名家，中国戏剧家协会会员、中华民族文化促进会会员，（香港）中国国粹文化艺术交流协会副秘书长、中国演出家协会会员",
                "url": "http://baike.baidu.com/subview/21862/5061593.htm#viewPageContent"
            }
        elif name == u"余秋雨":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"澳门科技大学人文艺术学院院长，中国著名文化学者，理论家、文化史学家、散文家",
                "url": "http://baike.baidu.com/view/5924.htm"
            }
        elif name == u"莫言":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"第一个获得诺贝尔文学奖的中国籍作家，他自1980年代以一系列乡土作品崛起，充满着“怀乡”以及“怨乡”的复杂情感，被归类为“寻根文学”作家",
                "url": "http://baike.baidu.com/item/%E8%8E%AB%E8%A8%80/941736"
            }
        elif name == u"郑欣淼":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国当代著名学者，“故宫学”专家，江苏省中华诗学研究会名誉会长，故宫研究院院长",
                "url": "http://baike.baidu.com/view/493521.htm"
            }
        elif name == u"樊锦诗":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"敦煌研究院名誉院长，自1963年自北京大学毕业后已在敦煌研究所坚持工作40余年，被誉为“敦煌女儿”，主要致力石窟考古、石窟科学保护和管理",
                "url": "http://baike.baidu.com/view/69708.htm"
            }
        elif name == u"严歌苓":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"美籍华人，著名旅美作家，美国21世纪著名中文、英文作家，好莱坞专业编剧",
                "url": "http://baike.baidu.com/view/74003.htm"
            }
        elif name == u"刘诗昆":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"享誉中外的著名钢琴家，是迄今中国和世界所有华人钢琴家中在世界最高国际钢琴比赛获奖级别最高的人之一， 中国三代领导人毛泽东、周恩来、刘少奇、邓小平、江泽民等，都专门聆听过他演奏，并分别不只一次同他长谈",
                "url": "http://baike.baidu.com/view/102718.htm"
            }
        elif name == u"陈履生":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国国家博物馆副馆长，擅长中国画、美术史论，1982年毕业于南京艺术学院美术系，1985年毕业于南京艺术学院美术历史及理论专业，获硕士学位",
                "url": "http://baike.baidu.com/view/1092050.htm"
            }
        elif name == u"白岩松":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"央视主持人，以其“轻松、快乐、富有趣味”的主持风格，深受观众喜欢，担任2004和2008年两届奥运火炬手",
                "url": "http://baike.baidu.com/view/36809.htm"
            }
        elif name == u"王峻":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"浙江松阳县委副书记、县长",
                "url": "http://baike.baidu.com/subview/202325/5612861.htm"
            }
        elif name == u"谢雅贞":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"余姚市副市长，曾任丽水市庆元县屏都镇党委副书记、纪委书记，庆元县风景旅游局副局长、党组成员，丽水市旅游局副局长、党组成员，松阳县人民政府副县长",
                "url": "http://baike.baidu.com/view/9129477.htm"
            }
        elif name == u"王勇超":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"民进委员，大学学历，研究员，第十一、十二届全国人大代表，享受国务院特殊津贴专家。现任中国民间文艺家协会副主席，陕西省文联副主席，陕西省民间文艺家协会主席，西安关中民俗艺术博物院院长",
                "url": "http://baike.baidu.com/view/4058132.htm"
            }
        elif name == u"韦苏文":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"广西文联党组成员、副主席，广西民间文艺家协会主席，中国文艺家协会副主席。致力于民间文艺的挖掘、整理和发展",
                "url": "http://baike.baidu.com/view/2207587.htm"
            }
        elif name == u"刘华":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级演员，安徽省黄梅戏剧院 副院长；电影、电视家协会理事；戏剧家协会会员；安徽宣传 文化领域拔尖人才",
                "url": "http://baike.baidu.com/subview/236868/8661701.htm#viewPageContent"
            }
        elif name == u"沙玛拉毅":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"《民族学刊》杂志主编；全国彝语术语标准化工作委员会主任；国务院学位委员会学科评审组成员；四川省学术技术带头人；四川省文联副主席；四川省民间文艺家协会主席",
                "url": "http://baike.baidu.com/view/1246357.htm#reference-[1]-1246357-wrap"
            }
        elif name == u"吴元新":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国工艺美术大师，研究员，首批国家级非物质文化遗产代表性传承人，中国民间文艺家协会副主席，南通大学非物质文化遗产研究院院长，四十年来竭尽全力保护和传承蓝印花布艺术",
                "url": "http://baike.baidu.com/view/1213389.htm"
            }
        elif name == u"曹保明":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"吉林省著名文化学者、民俗学专家，现任省民间文艺家协会主席、《民间故事》杂志主编、省文联副主席、中国民间文艺家协会副主席。几十年来，他致力于抢救挖掘东北民族民间文化遗产",
                "url": "http://baike.baidu.com/view/744307.htm"
            }
        elif name == u"孙家正":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"江苏泗阳人，现任中国文学艺术界联合会主席",
                "url": "http://baike.baidu.com/view/34837.htm"
            }
        elif name == u"赵实":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"吉林长春人，经济学硕士，高级政工师，国家二级电影导演。现任中国文学艺术界联合会党组书记、副主席、书记处书记。",
                "url": "http://baike.baidu.com/subview/1169605/5333898.htm"
            }
        elif name == u"王蒙":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国当代作家、学者，文化部原部长、中国作家协会名誉主席，著有长篇小说《青春万岁》、《活动变人形》等近百部小说，其作品反映了中国人民在前进道路上的坎坷历程。",
                "url": "http://baike.baidu.com/subview/31496/5029200.htm"
            }
        elif name == u"铁凝":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"当代著名作家，河北赵县人。现任中共第十八届中央委员，中国作家协会主席。",
                "url": "http://baike.baidu.com/subview/38867/5330200.htm"
            }
        elif name == u"尚长荣":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"京剧演员，上海京剧院演员中国戏剧界首位梅花大奖得主，国家级非物质文化遗产首批传承人。曾任中国戏剧家协会主席，曾两次获得全国五一劳动奖章，上海市劳动模范、全国先进工作者。",
                "url": "http://baike.baidu.com/view/437976.htm"
            }
        elif name == u"李雪健":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地影视男演员，中国文学艺术界联合会副主席，中国电影家协会主席。",
                "url": "http://baike.baidu.com/view/69711.htm"
            }
        elif name == u"管谟业":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"当代著名作家，笔名莫言。第一个获得诺贝尔文学奖的中国籍作家。",
                "url": "http://baike.baidu.com/subview/51704/19990268.htm"
            }
        elif name == u"顾长卫":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国电影导演、摄影师。“第五代导演”代表人物之一。中国民主促进会（民进）会员，中国民主促进会第十三届中央委员。",
                "url": "http://baike.baidu.com/view/372948.htm"
            }
        elif name == u"冯小刚":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地电影导演、编剧、演员，作品风格以京味儿喜剧为主，擅长商业片。",
                "url": "http://baike.baidu.com/view/1678.htm"
            }
        elif name == u"陈道明":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级演员，第十届、十一届、十二届全国政协委员，中国文学艺术界联合会第八次全国代表，广电总局颁发优秀电影表演艺术家，2006年中宣部“四个一批”人才，中国环境文化促进会理事，中国电视艺术家协会委员。",
                "url": "http://baike.baidu.com/subview/21080/7388772.htm"
            }
        elif name == u"陈凯歌":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"电影导演，代表作品《霸王别姬》、《梅兰芳》等",
                "url": "http://baike.baidu.com/view/6199.htm"
            }
        elif name == u"章金莱":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"艺名“六小龄童”，中央电视台、中国电视剧制作中心演员剧团国家一级演员，浙江大学人文学院兼职教授。1982年，六小龄童在二十五集神话电视连续剧《西游记》中主演孙悟空一角，为观众普遍认可",
                "url": "http://baike.baidu.com/view/3446.htm"
            }
        elif name == u"徐沛东":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名作曲家，现任中国文联副主席，中国音乐家协会党组书记、常务副主席 。",
                "url": "http://baike.baidu.com/view/143150.htm"
            }
        elif name == u"姜昆":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级演员，相声演员，相声表演艺术家，中国曲艺家协会主席。",
                "url": "http://baike.baidu.com/subview/29168/9203169.htm"
            }
        elif name == u"冯远":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名中国画家、艺术教育家",
                "url": "http://baike.baidu.com/view/319168.htm"
            }
        elif name == u"许江":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国美术学院院长、中国美术家协会副主席",
                "url": "http://baike.baidu.com/subview/1301194/7571539.htm"
            }
        elif name == u"阿迪力·吾休尔":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"维吾尔族，新疆杂技演员，“达瓦孜”第六代传人，先后打破并创造5项走钢丝吉尼斯记录。",
                "url": "http://baike.baidu.com/view/8111890.htm"
            }
        elif name == u"赵汝蘅":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国芭蕾舞舞蹈艺术家，中国国家大剧院艺术委员会舞蹈总监，中国舞蹈家协会第九届主席。",
                "url": "http://baike.baidu.com/view/2944192.htm"
            }
        elif name == u"叶承熹":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"作家，历任《山花》杂志主编，贵州省作家协会副主席，《上海文坛》杂志主编。",
                "url": "http://baike.baidu.com/view/400195.htm"
            }
        elif name == u"刘兰芳":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名评书表演艺术家，国家一级演员。1979年开始，先后有百余家电台播出她播讲的长篇评书《岳飞传》，轰动全国，影响海外。",
                "url": "http://baike.baidu.com/subview/42567/5060519.htm"
            }
        elif name == u"杨晓阳":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国国家画院院长、中国美术家协会副主席。主要学著有《告别过去——杨晓阳作品集》、《速写教程》等，主编《西安美院五十年校庆作品集》、《西安美院中青年素描集》、《西安美院五十年论文集》。",
                "url": "http://baike.baidu.com/subview/1136800/7363980.htm"
            }
        elif name == u"李谷一":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国著名女高音歌唱家，戏曲表演艺术家，国家一级演员。代表作有《乡恋》、《妹妹找哥泪花流》、《绒花》、《边疆的泉水清又纯》、《知音》、《我和我的祖国》、《洁白的羽毛寄深情》、《刘海砍樵》、《浏阳河》、《难忘今宵》等。",
                "url": "http://baike.baidu.com/view/48825.htm"
            }
        elif name == u"范曾":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国当代大儒、思想家、国学大师、书画巨匠、文学家、诗人。现为北京大学中国画法研究院院长、讲席教授，中国艺术研究院终身研究员，南开大学、南通大学惟一终身教授，联合国教科文组织“多元文化特别顾问”，英国格拉斯哥大学名誉文学博士，加拿大阿尔伯塔大学荣誉文学博士。",
                "url": "http://baike.baidu.com/view/30755.htm"
            }
        elif name == u"靳尚谊":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名画家，原中央美院院长。现为中央美院博士生导师、教授、中国美协主席、中国文联副主席、全国政协常委。",
                "url": "http://baike.baidu.com/view/4658.htm"
            }
        elif name == u"范迪安":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国美术馆馆长，中国美协副主席，全国美术馆专业委员会主任，中国油画学会理事，全国政协委员。从事20世纪中国美术研究、当代艺术批评与展览策划、艺术博物馆学研究。",
                "url": "http://baike.baidu.com/view/1135654.htm"
            }
        elif name == u"兰晓龙":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地男编剧、作家",
                "url": "http://baike.baidu.com/view/965113.htm"
            }
        elif name == u"史依弘":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"上海京剧院梅派大青衣，国家一级演员，工旦角。师从著名武旦演员、京剧教育家张美娟以及戏曲声乐专家卢文勤。2015年9月29日，史依弘当选上海戏剧家协会副主席。",
                "url": "http://baike.baidu.com/view/809692.htm"
            }
        elif name == u"刘大为":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国美术家协会主席，教科文组织下属国际造型艺术家协会主席、全国政协委员。主要作品《布里亚特婚礼》、《雏鹰》、《幼狮》等。",
                "url": "http://baike.baidu.com/subview/278905/5136078.htm"
            }
        elif name == u"贾平凹":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"当代作家，毕业于西北大学中文系。2008年凭借《秦腔》，获得第七届茅盾文学奖。",
                "url": "http://baike.baidu.com/view/2037.htm"
            }
        elif name == u"边发吉":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级编导，现任河北省政协副主席，民盟河北省委主委，河北省文化厅巡视员，中国文学艺术界联合会副主席、河北省文学艺术界联合会副主席。",
                "url": "http://baike.baidu.com/view/2200448.htm"
            }
        elif name == u"梁晓声":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国影视编剧、作家，北京语言大学中文系教授",
                "url": "http://baike.baidu.com/view/77972.htm"
            }
        elif name == u"吴正丹":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"杂技演员，中共党员，广州军区政治部战士杂技团一级演员，第十届全国人大代表",
                "url": "http://baike.baidu.com/view/115960.htm"
            }
        elif name == u"田华":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国电影女演员",
                "url": "http://baike.baidu.com/subview/46913/6610885.htm"
            }
        elif name == u"陈爱莲":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名舞蹈表演艺术家、陈爱莲艺术团团长，北京市爱莲舞蹈学校校校长，中国歌剧舞剧院舞蹈家兼编导、教员",
                "url": "http://baike.baidu.com/subview/127439/5140998.htm"
            }
        elif name == u"玛拉沁夫":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"作家，历任《内蒙古文艺》编辑，内蒙古文化局副局长，中国作协内蒙古分会副主席《民族文学》主编，中国作协书记处书记、少数民族文学委员会副主任，中国作协第三、四届理事。",
                "url": "http://baike.baidu.com/item/%E7%8E%9B%E6%8B%89%E6%B2%81%E5%A4%AB/2665535"
            }
        elif name == u"冯其庸":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"冯其庸，名迟，字其庸，号宽堂，在研究中国文化史，古代文学史、戏曲史、艺术史等方面做出了巨大成就，历任中国人民大学教授、中国艺术研究院副院长、中国红学会会长、中国戏曲学会副会长、中国作家协会会员、北京市文联理事、《红楼梦学刊》主编等职。以研究《红楼梦》著名于世。",
                "url": "http://baike.baidu.com/view/75000.htm"
            }
        elif name == u"王安忆":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"作家，中国作协副主席、复旦大学教授",
                "url": "http://baike.baidu.com/item/%E7%8E%8B%E5%AE%89%E5%BF%86/121292"
            }
        elif name == u"麦家":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"当代著名小说家、编剧",
                "url": "http://baike.baidu.com/view/263629.htm"
            }
        elif name == u"阿来":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"当代著名作家，茅盾文学奖史上最年轻获奖者，四川省作协主席，兼任中国作协第八届全国委员会主席团委员",
                "url": "http://baike.baidu.com/subview/254060/9488965.htm"
            }
        elif name == u"熊召政":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名作家，诗人，现系中国作家协会会员，湖北省作协副主席",
                "url": "http://baike.baidu.com/view/295068.htm"
            }
        elif name == u"曹文轩":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国作家富豪榜当红上榜作家，精擅儿童文学，任北京作家协会副主席，北京大学教授、当代文学博士生导师、当代文学教研室主任，儿童文学委员会委员，中国作家协会鲁迅文学院客座教授，是中国少年写作的积极倡导者、推动者。",
                "url": "http://baike.baidu.com/subview/20421/6518051.htm"
            }
        elif name == u"李维康":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名京剧演员，首届中国戏剧梅花奖得主",
                "url": "http://baike.baidu.com/subview/460676/5745468.htm"
            }
        elif name == u"张建国":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国国家京剧院三团团长，国家一级演员，著名京剧表演艺术家，奚派杰出传人",
                "url": "http://baike.baidu.com/subview/182901/5771700.htm#viewPageContent"
            }
        elif name == u"茅善玉":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"戏剧演员，上海市戏剧家协会副主席",
                "url": "http://baike.baidu.com/view/1185246.htm"
            }
        elif name == u"陈彦":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"影视编剧，毕业于北京电影学院文学系编剧专业，从事影视编剧工作至今",
                "url": "http://baike.baidu.com/subview/116736/5664352.htm#viewPageContent"
            }
        elif name == u"叶少兰":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"京剧表演艺术家、国家一级演员",
                "url": "http://baike.baidu.com/view/311085.htm"
            }
        elif name == u"谭孝曾":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名京剧老生演员，北京京剧院国家一级演员，第十届、十一届、十二届全国政协委员。梨园世家，谭门第六代嫡传人，系京剧名角谭富英之孙、谭元寿之子。",
                "url": "http://baike.baidu.com/view/1161134.htm"
            }
        elif name == u"赵季平":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"作曲家，曾任中国音乐家协会主席，陕西省文学艺术界联合会主席，原西安音乐学院院长。中共十五大代表，第十一届、十二届全国人大代表， 中国音乐家协会第八届名誉主席。",
                "url": "http://baike.baidu.com/view/462337.htm"
            }
        elif name == u"谭利华":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国优秀指挥家，现任全国政协委员、第八届中国音乐家协会副主席、北京音乐家协会主席、国家大剧院艺术委员会副主任。",
                "url": "http://baike.baidu.com/subview/1494341/5778685.htm"
            }
        elif name == u"叶小钢":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"现任中国音乐家协会第八届主席[1]  ，兼任中国音协创作委员会副主任，北京市政协委员，上海交响乐团驻团作曲家，中国音乐著作权协会理事、中国音乐家协会会员及美国作词作曲家协会会员、香港佛教文化产业佛乐委员会委员。十一届全国政协常委[2]  ，十二届全国政协委员会常务委员。",
                "url": "http://baike.baidu.com/view/311090.htm"
            }
        elif name == u"赵塔里木":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国音乐学院院长，文学博士，音乐学教授，博士研究生导师；发表40余篇论文，承担了国家和教育部多项课题研究项目；",
                "url": "http://baike.baidu.com/view/3097630.htm"
            }
        elif name == u"殷秀梅":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名女高音歌唱家，国家一级演员、全国人大代表、全国青年联合会常委、全国妇联执委、中国音乐家协会理事。",
                "url": "http://baike.baidu.com/view/52422.htm"
            }
        elif name == u"关峡":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级作曲，中国交响乐团团长，20世纪90年代写出了《围城》、《我爱我家》等深受观众喜爱的电视剧音乐作品。2015年6月18日，关峡任中国音乐家协会第八届副主席。",
                "url": "http://baike.baidu.com/view/597354.htm"
            }
        elif name == u"张千一":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"作曲家，中国音乐家协会第八届副主席",
                "url": "http://baike.baidu.com/subview/369446/7293335.htm"
            }
        elif name == u"关牧村":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级演员、女中音歌唱家。中国音乐家协会副主席、中国音乐家协会会员、全国青联常委，全国青年联合会副主席、第七至九届全国政协委员。",
                "url": "http://baike.baidu.com/view/15434.htm"
            }
        elif name == u"赵大鸣":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"一级编剧；中国舞蹈家协会会员；中国舞蹈家协会舞蹈理论研究委员会委员",
                "url": "http://baike.baidu.com/view/9736841.htm"
            }
        elif name == u"冯双白":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"文学博士、著名舞蹈理论家和评论家、编剧、大型晚会策划人和撰稿人，现任中国舞蹈家协会副主席、分党组书记，中国艺术研究院博士生导师。",
                "url": "http://baike.baidu.com/view/2198886.htm"
            }
        elif name == u"赵青":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名女中音歌唱家。中国音乐学院声乐副教授，硕士生导师，维也纳国际美声金奖获得者、中国音乐学院副教授、国际巨星帕瓦罗蒂的师妹。",
                "url": "http://baike.baidu.com/subview/136102/12988562.htm#viewPageContent"
            }
        elif name == u"杨飞云":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"画家，中国艺术研究院中国油画院院长、教授、博士生导师，中国美术家协会理事，中国油画学会理事，北京油画学会副主席，第十一届全国人大代表。",
                "url": "http://baike.baidu.com/subview/260956/5994843.htm"
            }
        elif name == u"欧阳中石":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名文化学者、书法家、书法教育家。早年拜在京剧大师奚啸伯的门下。现任首都师范大学教授、博士生导师、中国书法文化研究所所长，北京唐风美术馆名誉馆长。",
                "url": "http://baike.baidu.com/view/127247.htm"
            }
        elif name == u"张海":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国当代著名书法家，现任中国书法家协会主席，郑州大学美术学院院长。",
                "url": "http://baike.baidu.com/subview/97543/5133757.htm"
            }
        elif name == u"吕厚民":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"摄影家，曾为中南海摄影师、组长。2015年3月9日在京逝世，享年88岁。",
                "url": "http://baike.baidu.com/view/312238.htm"
            }
        elif name == u"王朝柱":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地编剧，历任总政歌舞团、总政歌剧团作曲，总政话剧团编剧。",
                "url": "http://baike.baidu.com/view/387949.htm"
            }
        elif name == u"李军":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"专业作家，中国作家协会会员，文学创作一级。",
                "url": "http://baike.baidu.com/subview/183022/5374448.htm#viewPageContent"
            }
        elif name == u"严隽琪":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"江苏苏州人，民进成员，工学博士，教授，现任十二届全国人大常委会副委员长，民进中央主席，中央社会主义学院院长，中国和平统一促进会副会长。",
                "url": "http://baike.baidu.com/view/389565.htm"
            }
        elif name == u"丁晓芳":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"浙江三门人，1995年4月加入中国共产党，现任中共浙江省宁波江北区委副书记、区长。",
                "url": "http://baike.baidu.com/item/%E4%B8%81%E6%99%93%E8%8A%B3/7917259"
            }
        elif name == u"张贤亮":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级作家、收藏家、书法家。曾任宁夏回族自治区文联副主席、主席，中国作家协会宁夏分会主席等职，并任六届政协全国委员会委员，中国作协主席团委员。2014年9月27日因病医治无效去世，享年78岁。",
                "url": "http://baike.baidu.com/view/78141.htm"
            }
        elif name == u"贝陆慈":
            node_data = {
                "name": u"人物-"+ name,
                "description": u" 经济学工商管理硕士，万宝龙国际公司首席执行官",
                "url": "http://baike.baidu.com/view/1675656.htm"
            }
        elif name == u"郑云峰":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"摄影家，江苏省摄影家协会副主席、徐州摄影家协会主席、英国皇家摄影协会高级会士、中国摄影家协会会员，七十年代初涉足摄坛。三十多年来他拍摄各类题材图片十五万余幅，先后有数十幅作品入选国际、国家级影展，其中十四幅精品佳作获奖。",
                "url": "http://baike.baidu.com/subview/2612043/8008350.htm#viewPageContent"
            }
        elif name == u"施光南":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"作曲家，曾任全国青联副主席、中国音协副主席。主要作品有：C小调钢琴协奏曲，弦乐四重奏《青春》，管弦乐小合奏《打酥油茶的小姑娘》，小提琴独奏《瑞丽江边》。",
                "url": "http://baike.baidu.com/view/21468.htm"
            }
        elif name == u"洪如丁":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"施光南夫人，工程师",
                "url": "http://ent.163.com/10/0802/15/6D3F203J00032DGD.html"
            }
        elif name == u"成龙":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国香港男演员、导演、动作指导、制作人、编剧、歌手",
                "url": "http://baike.baidu.com/subview/3539/10605302.htm"
            }
        elif name == u"吴秀波":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地男演员",
                "url": "http://baike.baidu.com/view/109052.htm"
            }
        elif name == u"姚明":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"前中国职业篮球运动员，司职中锋，中职联公司董事长兼经理",
                "url": "http://baike.baidu.com/subview/2271/4818353.htm"
            }
        elif name == u"林丹":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国羽毛球运动员、世界羽毛球名将",
                "url": "http://baike.baidu.com/subview/89024/5089904.htm"
            }
        elif name == u"葛优":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地男演员，国家一级演员",
                "url": "http://baike.baidu.com/view/17023.htm"
            }
        elif name == u"范伟":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"喜剧表演艺术家、国家一级演员",
                "url": "http://baike.baidu.com/subview/6275/5891172.htm"
            }
        elif name == u"张嘉译":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国影视男演员",
                "url": "http://baike.baidu.com/view/284010.htm"
            }
        
            
        elif name == u"陪同参观天津大学冯骥才文学艺术研究院":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2014年5月11日、12日，著名汾酒文化学者、汾酒集团文化中心主任柳静安怀着崇敬的心情走进了博物馆化的天津大学冯骥才文学艺术研究院，并就汾酒文化建设工作和汾酒获巴拿马万国博览会甲等大奖章100周年纪念活动向冯骥才先生请教。期间，在冯骥才民间文化基金会秘书长冯宽的陪同下，柳静安一行参观了大树画馆、“跳龙门”乡土艺术博物馆和图书馆。",
                "url": "http://www.sxqnb.com.cn/shtml/sxqnb/20140517/62637.shtml"
            }
        elif name == u"盘点大同雕塑家底大型活动":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2009年6月，在冯骥才的倡导和指挥下，由全国雕塑艺术权威人士参与的盘点大同雕塑家底大型活动全面启动。《中国大同雕塑全集》由耿彦波任工作委员会主任，冯骥才任总主编并撰写总序，韩美林、金维诺、丁明夷、曾成钢、陈云岗、隋建国、孙振华、吴健、冯宽、王晓岩等国内多位着名学者、专家、雕塑家、摄影家会同大同地方专家学者共同编制完成。",
                "url": "http://www.dt.gov.cn/tszt/dszd/201201/9697.html"
            }
        elif name == u"山西平顺县旅游工作考察调研":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2011年4月4～5日，全国政协常委、民进中央副主席、中国文联副主席、中国民间文艺家协会主席、国务院参事、国家非物质文化遗产名录评定专家委员会主任冯骥才携夫人顾同昭女士，中国民协副主席常嗣新、郑一民就山西平顺县旅游工作考察调研。",
                "url": "http://d.wanfangdata.com.cn/LocalChronicleItem/12046838"
            }
        elif name == u"《霓裳集》作序":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"冯骥才为妻子画集作序——2. “在我们结婚40周年即“红宝石婚”时，我把她的人物白描画稿编成一本画册，范曾看到了，建议书名叫《霓裳集》并亲笔题写了书名；然后我作了序，精印后送给我们俩共同的朋友。”",
                "url": "http://book.douban.com/reading/10857079/"
            }
        elif name == u"“抢救民间文化遗产”公益画展":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2004年11月20至21日，由冯骥才民间文化基金会筹备处主办，中国民间文艺家协会、中国现代文学馆、天津市文学艺术界联合会、天津大学冯骥才文学艺术研究院、收藏家杂志社、雅昌艺术网承办和协办的冯骥才“抢救民间文化遗产”公益画展在北京中国现代文学馆举行。冯骥才的夫人顾同昭一同出席。",
                "url": "http://www.chinaculture.org/gb/cn_news/2004-11/22/content_63427.htm"
            }
        elif name == u"浙江慈城寻根":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"1992年春，全国文联执行副主席、民进中央副主席、当代著名作家兼画家冯骥才准备来甬办敬乡画展。期间于1992年4月20日，前往慈城寻根，同行的还有冯骥才的母亲（戈长复）、妻子（顾同昭）、儿子（冯宽）。",
                "url": "http://www.nbzx.gov.cn/art/2005/8/19/art_9921_433432.html"
            }
        elif name == u"《绝世金莲》出版":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"《绝世金莲(中国的故事第5集)》是对发生在中国大地上历经一千多年，约有二十亿中国妇女缠足风俗的影像作品。由李楠摄影，冯骥才、柯基生文，出版时间：2005-7",
                "url": "http://www.dushu.com/book/11183614/"
            }
        elif name == u"作品被拍成电影《炮打双灯》":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"《炮打双灯》改编自冯骥才的同名中篇小说，是由何平执导的电影，由宁静、巫刚等主演。电影从另一角度反映社会上被压抑的一群人，对一直支配着中国人命脉和扼杀人权的传统教条和家族约束严加抗议。",
                "url": "http://baike.baidu.com/link?url=j3WroCDCGPoEckfa5T0x7YY3rFoDp8lRxVYyxLwlyV1NVLQWWyOMYVFaUlLHlnAHuaktglABuGE3HEhx0yxzd_"
            }
        elif name == u"作品被拍成电影《酒婆》":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"根据冯骥才短篇小说集《俗世奇人》中的一则故事改编。上映日期: 2010-06-10",
                "url": "https://movie.douban.com/subject/5675006/"
            }
        elif name == u"作品被拍成电影《一个人和一座城市》":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"《一个人与一座城市》是中央电视台《纪录片》栏目组2002年录制的纪录片巨制，它以作家自诉的方式、透过一颗颗作家的心灵，来纪录一座座城市。",
                "url": "http://baike.baidu.com/link?url=z2QDHQpqv5b5ASB0z9JXL2jPXimc9JaQuzvMC07ckgFgXlEK3_jkKxywpk1QVlf1foLrLUhX6JbDSCAi6Znumq"
            }
        elif name == u"作品被拍成电影《神鞭》":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"《神鞭》是张子恩执导，王亚为、徐守莉、陈宝国等主演的剧情片。",
                "url": "http://baike.baidu.com/subview/595573/9976685.htm"
            }
        elif name == u"邀请举办个人画展":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2008年3月24日，冯骥才邀请画家宋雨桂来天津大学冯骥才研究院北洋美术馆举办个人画展",
                "url": "http://www.meishujia.cn/?act=usite&usid=102&inview=appid-253-mid-352&said=544"
            }
        elif name == u"参加韩美林美术馆开幕并讲话":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2005年10月，冯骥才赴浙江杭州参加韩美林美术馆开幕并讲话。",
                "url": "http://art.china.cn/zixun/2013-06/25/content_6057837.htm"
            }
        elif name == u"主持中国民协第九次全国代表大会开幕式":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2016年1月22日，中国民协第八届理事会第四次会议1月19日至21日在京召开，中国文联党组成员、书记处书记陈建文出席开幕式并讲话，开幕式由中国文联副主席、中国民协主席冯骥才主持。中国民协分党组书记、驻会副主席罗杨以及中宣部和中国文联有关部门同志等参加会议。",
                "url": "http://www.cflac.org.cn/xw/bwyc/201601/t20160122_321297.htm"
            }
        elif name == u"被颁发宁夏“文化使者”聘书":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年12月22日，宁夏回族自治区党委书记李建华为冯骥才等十位名家颁发宁夏“文化使者”聘书，一同出席的有全国政协教科文卫体委员会副主任蒋效愚，全国政协港澳台侨委员会副主任卢昌华，自治区领导崔波、蔡国英、徐广国、何学清、马力等。其余九位演讲嘉宾为余秋雨、莫言、郑欣淼、樊锦诗、严歌苓、刘诗昆、陈履生、韩美林、白岩松。",
                "url": "http://cpc.people.com.cn/n1/2015/1222/c117005-27961663.html"
            }
        elif name == u"参加保护与发展传统村落座谈会":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年12月6日，中国传统村落保护与发展研究中心与浙江省松阳县政府召开了如何保护与发展传统村落座谈会。中国文联副主席、中国民协主席、中国传统村落保护与发展研究中心主任冯骥才，松阳县县长王峻、副县长谢雅贞出席座谈会。",
                "url": "http://www.cflac.org.cn/xw/bwyc/201601/t20160115_320638.htm"
            }
        elif name == u"参加“山花奖”获奖代表、传承人代表座谈会":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年12月2日，由中国民协主办的“让传承人说话”中国民间文艺“山花奖”获奖代表、传承人代表座谈会在浙江海宁召开，中国文联副主席、中国民协主席冯骥才出席会议并讲话，中国民协副主席王勇超、韦苏文、刘华、沙玛拉毅、吴元新、曹保明以及参加山花奖颁奖盛典的非遗传承人参加会议。会议由中国民协分党组书记、驻会副主席罗杨主持。",
                "url": "http://www.cflac.org.cn/xw/bwyc/201512/t20151209_315170.htm"
            }
        elif name == u"参加文艺工作座谈会":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"中共中央总书记、国家主席、中央军委主席习近平于2014年10月15日上午在北京主持召开的文艺工作座谈会，习近平发表重要讲话。与会者有：孙家正 赵实 王蒙 铁凝 尚长荣 李雪健 管谟业 顾长卫 冯小刚 陈道明 陈凯歌 章金莱 徐沛东 姜昆 冯远 许江 阿迪力?吾休尔 赵汝蘅 叶承熹 刘兰芳 杨晓阳 李谷一 范曾 冯骥才 靳尚谊 范迪安 兰晓龙 史依弘 刘大为 贾平凹 边发吉 梁晓声 吴正丹 田华 陈爱莲 玛拉沁夫 冯其庸 王安忆 麦家 阿来 熊召政 曹文轩 李维康 张建国 茅善玉 陈彦 叶少兰 谭孝曾 赵季平 谭利华 叶小钢 赵塔里木 殷秀梅 关峡 张千一 关牧村 赵大鸣 冯双白 赵青 杨飞云 欧阳中石 张海 吕厚民 王朝柱 李军",
                "url": "http://culture.people.com.cn/GB/22226/389899/"
            }
        elif name == u"联合提出“立法取缔活熊取胆”提案":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2012年3月2日冯骥才、韩美林联合提出“立法取缔活熊取胆”提案",
                "url": "http://politics.people.com.cn/GB/70731/17281361.html"
            }
        elif name == u"在庆祝中国民主促进会成立70周年之际接受看望":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年11月27日，在庆祝中国民主促进会成立70周年之际，民进中央主席严隽琪赴天津看望民进中央原副主席冯骥才。",
                "url": "http://www.rmzxb.com.cn/c/2015-11-30/637563.shtml"
            }
        elif name == u"举行“冯骥才向家乡宁波慈城文化捐赠仪式”":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2016年3月25日，“冯骥才向家乡宁波慈城文化捐赠仪式”在天津大学冯骥才文学艺术研究院举行，江北区长丁晓芳向冯骥才颁发捐赠证书。",
                "url": "http://culture.people.com.cn/n1/2016/0327/c22219-28229245.html"
            }
        elif name == u"张贤亮去世之际接受采访":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2014年9月27日，张贤亮去世，冯骥才之后接受采访，表示自己与张贤亮为多年挚友，并且去世前曾与其通过电话。",
                "url": "http://culture.people.com.cn/n/2014/0928/c87423-25752231.html"
            }
        elif name == u"获万宝龙国际艺术赞助大奖":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2013年6月18日，第22届万宝龙国际艺术赞助大奖颁奖典礼在北京举行，冯骥才荣获此项大奖，贝陆慈为其颁奖，冯骥才其后将奖金捐赠给郑云峰。",
                "url": "http://www.cflac.org.cn/gn/201306/t20130619_198684.html"
            }
        elif name == u"参与《在希望的田野上——人民音乐家施光南诞辰七十周年纪念音乐会》":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2010年8月25日，《在希望的田野上——人民音乐家施光南诞辰七十周年纪念音乐会》在天津音乐厅举行，冯骥才与施光南妻子洪如丁一同出席。",
                "url": "http://ent.enorth.com.cn/system/2010/08/26/004961582.shtml"
            }
        elif name == u"参与拍摄马年央视春晚《春晚是什么》先导片":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2014马年央视春晚首次使用《春晚是什么》的先导片作为开场，在4分钟的时间里，冯骥才、成龙、吴秀波、姚晨、姚明、林丹、葛优、李雪健、范伟、张嘉译、白岩松等名人都为百姓诠释了自己心中的“春晚”。2013年7月12日冯骥才任2014年春晚艺术顾问。",
                "url": "http://baike.baidu.com/link?url=oZaVbl6NfiRZtKd2nRRxtyQ2SOfTuXstIFoTCP0Cifde58wJuzi5TXLSAC7_lmssGry4IuYE-lx62xJYgR3U5K"
            }
        elif name == u"顾同昭":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"绘画爱好者，著有白描仕女图《霓裳集》，冯骥才的妻子",
                "url": ""
            }            
        elif name == u"冯吉甫":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"金融家，冯骥才的父亲",
                "url": ""
            }
        elif name == u"戈长复":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"冯骥才的母亲",
                "url": ""
            }
        elif name == u"柳静安":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"汾酒集团文化中心主任，汾酒文化学者，是汾酒文化的传承人之一",
                "url": "http://blog.sina.com.cn/s/blog_54ecfe570101mt4m.html"
            }
        elif name == u"郑云峰":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"厦门市委常委，市人民政府党组副书记、常务副市长",
                "url": "http://baike.baidu.com/subview/2612043/8008349.htm"
            }
        elif name == u"孟鸣飞":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"青岛出版集团党委书记、董事长，青岛出版社社长",
                "url": "http://www.ccitimes.com/famous/qymr/2014/1119/116491.html"
            }
        elif name == u"王悲秋":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国美术家协会会员、天津市美术家协会会员、天津市政协书画研究会理事、南京广厦美术馆特聘画家。对中国历代山水、人物、花鸟、走兽均进行过系统研究,尤其钟情于山水画",
                "url": "http://baike.baidu.com/view/2306355.htm"
            }
        elif name == u"陈玉恒":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"南开区委副书记、区长，大学学历，工学学士，高级工程师",
                "url": "http://baike.baidu.com/view/4582719.htm"
            }
        elif name == u"朱树江":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"南开区委常委、宣传部部长、文明办主任（兼），中央党校研究生学历，高级政工师",
                "url": "http://baike.baidu.com/view/7066017.htm"
            }
        elif name == u"陆炳文":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中华如意学会理事长、中华粥会会长，国民党中央社会工作会编审，中华工程公司公关课长、副处长、处长、副总经理",
                "url": "http://baike.baidu.com/view/2906404.htm"
            }
        elif name == u"耿彦波":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"太原市委副书记，市人民政府市长、党组书记",
                "url": "https://zh.wikipedia.org/wiki/%E8%80%BF%E5%BD%A6%E6%B3%A2"
            }
        elif name == u"张建勋":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"西安交通大学教授，国际焊接工程师",
                "url": "http://baike.baidu.com/subview/221086/9296779.htm"
            }
        elif name == u"李春梅":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"青岛农业大学外国语学院讲师、院长助理，博士，教师",
                "url": "http://baike.baidu.com/subview/1238405/9782699.htm"
            }
            
        elif name == u"参观青岛出版集团荣誉室以及职工书吧":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2012年11月12日下午，冯骥才民间文化基金会秘书长冯宽先生、著名摄影家郑云峰先生莅临青岛出版集团，实地参观了青岛出版集团荣誉室以及职工书吧，并在25楼会议室进行座谈，青岛出版集团董事长孟鸣飞向冯宽先生一行详细介绍了青岛出版集团发展的相关情况并就图书出版工作进行洽谈。随后，冯骥才民间文化基金会秘书长冯宽先生向董事长孟鸣飞赠送图书。",
                "url": "http://www.bookdao.com/article/56392/"
            }
        elif name == u"出席“意品天真——王悲秋先生画展及签名售书”":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年6月25日，由天津画院、天津市美术家协会、天津人民美术出版社、中国书画报社和天津文化产权交易所共同主办，天津市奥尼克广告公司承办的“意品天真——王悲秋先生画展及签名售书”在天津文化产权交易所隆重开幕。冯宽出席了活动并现场致辞。",
                "url": "http://www.tjculture.com/read.php?id=243508"
            }
        elif name == u"出席春祭大典暨乙未年春节传统文化庙会":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年2月11日，天津天后宫举行春祭大典暨乙未年春节传统文化庙会活动开幕式，社会各界人士集聚天后宫，共同祈盼社会和谐、平安吉祥。",
                "url": "http://www.tjnk.gov.cn/xwzx/system/2015/02/12/010017684.shtml"
            }
        elif name == u"参与盘点大同雕塑家底大型活动":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2009年6月，在冯骥才的倡导和指挥下，由全国雕塑艺术权威人士参与的盘点大同雕塑家底大型活动全面启动。《中国大同雕塑全集》由耿彦波任工作委员会主任，冯骥才任总主编并撰写总序，韩美林、金维诺、丁明夷、曾成钢、陈云岗、隋建国、孙振华、吴健、冯宽、王晓岩等国内多位着名学者、专家、雕塑家、摄影家会同大同地方专家学者共同编制完成。",
                "url": "http://www.dt.gov.cn/tszt/dszd/201201/9697.html"
            }
        elif name == u"参与津苏联办创建先进基层组织建设工作交流活动":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2013年7月27日上午，在民进天津市委机关举办了民进津苏两地高校及直属工委创建先进基层组织建设工作座谈会。天津大学党派办公室主任李春梅，冯骥才民间艺术基金会副秘书长、民进市青工委副主任冯宽热情地接待了大家。",
                "url": "http://www.mj.org.cn/dfzz/tj/zzfz/201008/t20100831_115215.htm"
            }
        elif name == u"陪同汾酒集团文化中心主任柳静安参观天津大学冯骥才文学艺术研究院":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2014年5月11日、12日，著名汾酒文化学者、汾酒集团文化中心主任柳静安怀着崇敬的心情走进了博物馆化的天津大学冯骥才文学艺术研究院，并就汾酒文化建设工作和汾酒获巴拿马万国博览会甲等大奖章100周年纪念活动向冯骥才先生请教。期间，在冯骥才民间文化基金会秘书长冯宽的陪同下，柳静安一行参观了大树画馆、“跳龙门”乡土艺术博物馆和图书馆。",
                "url": "http://www.sxqnb.com.cn/shtml/sxqnb/20140517/62637.shtml"
            }
        elif name == u"浙江慈城寻根":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"1992年春，全国文联执行副主席、民进中央副主席、当代著名作家兼画家冯骥才准备来甬办敬乡画展。期间于1992年4月20日，前往慈城寻根，同行的还有冯骥才的母亲（戈长复）、妻子（顾同昭）、儿子（冯宽）。",
                "url": "http://www.nbzx.gov.cn/art/2005/8/19/art_9921_433432.html"
            }
        elif name == u"赵实":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"吉林大学经济管理学院国民经济计划与管理专业毕业，在职研究生学历，经济学硕士，高级政工师，国家二级电影导演。现任中国文学艺术界联合会党组书记、副主席、书记处书记，全国妇联副主席，十八届中共中央委员。",
                "url": "http://baike.baidu.com/subview/1169605/5333898.htm"
            }
        elif name == u"王东明":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中央党校法学专业毕业，中央党校研究生学历。现任十八届中央委员，四川省委书记、省人大常委会主任",
                "url": "http://baike.baidu.com/subview/75174/6859672.htm"
            }
        elif name == u"张岱梨":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"武汉市委党校党的建设专业毕业，在职研究生学历，现任湖北省十二届人大常委会副主任",
                "url": "http://baike.baidu.com/view/1388432.htm"
            }            
        elif name == u"田进":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"湖南大学工商管理学院毕业，在职研究生学历，管理学博士，现任国家新闻出版广电总局党组成员、副局长",
                "url": "http://baike.baidu.com/subview/311159/6085913.htm#viewPageContent"
            }
        elif name == u"王莉莉":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"北京师范大学历史学专业毕业，大学学历。中央纪委驻国家广播电影电视总局纪检组原组长，国家广播电影电视总局原党组成员、总局直属机关党委书记。现任中国广播电影电视社会组织联合会副会长、临时党委书记",
                "url": "http://baike.baidu.com/subview/304181/6521913.htm#viewPageContent"
            }
        elif name == u"沈跃跃":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中央党校研究生学历，现任中共十八届中央委员，十二届全国人大常委会副委员长，全国妇联主席，中国妇女研究会第四届会长",
                "url": "http://baike.baidu.com/view/304475.htm"
            }
        elif name == u"李源潮":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中央党校研究生学历，法学博士学位。现任中共中央政治局委员，中华人民共和国副主席，中国红十字会名誉会长",
                "url": "http://baike.baidu.com/view/33668.htm"
            }
        elif name == u"王太华":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中央党校研究生毕业，在职研究生学历，现任中共中央第二地方巡视组组长，全国政协文史和学习委员会主任委员",
                "url": "http://baike.baidu.com/view/35988.htm"
            }
        elif name == u"王嘉猷":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"教授级高工，享受政府特殊津贴的专家。在上海交大时，王嘉猷先后任交大地下党支部书记、上层党组书记，参与领导历次上海学运。毕业后，脱产任专职大学区委委员兼指导学运的党内刊物《号角报》主编，同时负责领导上海医学院、上海商学院等地下党支部。",
                "url": "http://baike.baidu.com/view/6063482.htm"
            }
        elif name == u"刘道平":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中央党校经济管理专业毕业，中央党校研究生学历。四川省第十二届人大常委会副主任。第十二届全国人大代表，九届四川省委委员，四川省十一届、十二届人大代表",
                "url": "http://baike.baidu.com/subview/1261908/9688030.htm"
            }
        elif name == u"雷元亮":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"原任国家广播电影电视总局党组成员、副局长，中国广播电视学会副会长。2009年8月免去雷元亮的国家广播电影电视总局副局长职务",
                "url": "http://baike.baidu.com/view/1169600.htm"
            }
        elif name == u"张海涛":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国科技大学研究生院毕业，在职研究生学历，原任国家广播电影电视总局党组副书记、副局长",
                "url": "http://baike.baidu.com/subview/238416/6552634.htm#viewPageContent"
            }
        elif name == u"赵化勇":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"全国政协常委、中国文联副主席，中国电视艺术家协会主席，原任中央电视台台长，总编辑，高级编辑。",
                "url": "http://baike.baidu.com/view/934165.htm"
            }
        elif name == u"张丕民":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"陕西西安人，中共党员，1970年8月参加工作，曾任国家新闻出版广电总局副局长。任西安电影厂厂长期间出品电影80多部，获得国际国内各种奖项56次，并主持成立子中国首家股份制电影制片公司。",
                "url": "http://baike.baidu.com/view/436671.htm"
            }
        elif name == u"傅克诚":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中央党校科学社会主义专业毕业，中央党校在职研究生学历，江西省政协主席、党组书记，中共十六大当选为中央纪律检查委员会委员，第十一届全国政协委员",
                "url": "http://baike.baidu.com/view/436671.htm"
            }
        elif name == u"孙家正":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"南京大学中文系汉语言文学专业毕业，大学学历。现任中国文学艺术界联合会主席，中共第十二届、十三届、十四届中央候补委员，十五届、十六届中央委员。第十一届全国政协副主席",
                "url": "http://baike.baidu.com/view/34837.htm"
            }
        elif name == u"李五四":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中共中央党校在职研究生学历。现任中央纪委驻国家卫生和计划生育委员会纪检组组长、党组成员",
                "url": "http://baike.baidu.com/view/9393164.htm"
            }
        elif name == u"罗志军":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国政法大学政治学与行政管理系政治学专业在职研究生毕业，在职研究生学历，高级经济师，现任十八届中央委员，江苏省委书记、省人大常委会主任",
                "url": "http://baike.baidu.com/item/%E7%BD%97%E5%BF%97%E5%86%9B/1175974"
            }
        elif name == u"钱小芊":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"籍贯江苏启东，1973年12月参加工作，1974年10月加入中国共产党。中国人民大学国际共产主义运动史专业毕业，法学学士。现任中国作家协会党组书记",
                "url": "http://baike.baidu.com/view/1261992.htm"
            }
        elif name == u"李玲修":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"长影总编室编辑、编剧，北京通州区文联专业作家，《人民文学》二编室主任，编审。中国体育报告文学副会长，中国作家协会影视创作委员会委员，最高人民法院特约创作员，《中华儿女》杂志(海外版)编委，中华炎黄文化研究会理事，中央电视台特约作家。1965年开始发表作品。1982年加入中国作家协会。",
                "url": "http://baike.baidu.com/view/553928.htm"
            }
        elif name == u"王彬颖":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"现任世界知识产权组织（WIPO）副总干事，主管品牌与设计部门。1992年加入WIPO，此前就职于中国商标事务所。她于2006年12月被任命为助理总干事，2008年12月起任现职",
                "url": "http://www.wipo.int/about-wipo/zh/management.html#wang"
            }
        elif name == u"李岚清":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"江苏镇江人，复旦大学企业管理系毕业，大学文化。曾任中共第十五届中央委员、中央政治局委员、常委，国务院副总理。",
                "url": "http://baike.baidu.com/view/104734.htm"
            }
        elif name == u"章素贞":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"浙江绍兴人，绍兴一中1951届校友，李岚清夫人",
                "url": ""
            }
        elif name == u"刘延东":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"江苏南通人，法学博士学位。现任中央政治局委员，国务院副总理、党组成员。",
                "url": "http://baike.baidu.com/view/1874.htm"
            }
        elif name == u"卢展工":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"浙江慈溪人，哈尔滨建筑工程学院建筑工程系工业与民用建筑专业毕业，大学学历。现任中共十八届中央委员，十二届全国政协副主席。",
                "url": "http://baike.baidu.com/view/33690.htm"
            }
        elif name == u"王家瑞":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"河北秦皇岛人，经济学博士学位，高级经济师。现任中共十八届中央委员，十二届全国政协副主席。",
                "url": "http://baike.baidu.com/view/304761.htm"
            }
        elif name == u"韩三平":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国制片人、导演，原中国电影集团公司董事长。",
                "url": "http://baike.baidu.com/view/793565.htm"
            }
        elif name == u"唐国强":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国知名影视男演员、导演。现为中国国家话剧院一级演员，中国书法家协会会员，毛泽东特型演员。",
                "url": "http://baike.baidu.com/subview/54493/6119616.htm"
            }
        elif name == u"刘劲":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地影视男演员，影视戏剧表演艺术家，中国人民解放军总政治部话剧团国家一级演员。",
                "url": "http://baike.baidu.com/item/%E5%88%98%E5%8A%B2/6641414"
            }
        elif name == u"王伍福":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"国家一级演员。被誉为“全国第一朱德特型”。多次参加了中央电视台和地方电视台的各种文艺晚会和大型活动。",
                "url": "http://baike.baidu.com/view/274298.htm"
            }
        elif name == u"刘沙":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"著名演员",
                "url": "http://baike.baidu.com/subview/367289/9422011.htm"
            }
        elif name == u"王健":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"演员，代表作有《长征》《建国大业》",
                "url": "http://baike.baidu.com/subview/169862/5117874.htm#viewPageContent"
            }
        elif name == u"焦利":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"河北正定人，毕业于辽宁大学，大学学历，高级编辑。历任中央电视台台长。",
                "url": "http://baike.baidu.com/item/%E7%84%A6%E5%88%A9/2027905"
            }
        elif name == u"李肇星":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"教授、博士生导师，原中华人民共和国外交部部长，第十一届全国人大外事委员会主任委员、中国翻译协会会长，有“诗人外交家”之称，出版有诗歌散文集《青春中国》。",
                "url": "http://baike.baidu.com/view/34484.htm"
            }
        elif name == u"王洁实":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"歌唱家、中国电影乐团 国家一级演员，享受国务院专家待遇。中央电视台青年歌手大奖赛特邀专家评委、中国音乐家协会会员，中国歌坛上里程碑式的人物。",
                "url": "http://baike.baidu.com/view/755843.htm"
            }
        elif name == u"谢莉斯":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"我国著名歌唱家，中国电影乐团国家一级演员。享受国务院专家待遇，中央电视台青年歌手大奖赛特邀专家评委，中国音乐家协会会员。中国歌坛上里程碑式的人物。",
                "url": "http://baike.baidu.com/view/798692.htm"
            }
        elif name == u"韩再芬":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国黄梅戏表演艺术家，国家级非物质文化遗产项目代表性传承人。中国戏剧家协会副主席、安徽省戏剧家协会副主席、安徽文联副主席、国家一级演员，享受国务院“政府特殊津贴”。第五届、六届、七届全国文艺工作者代表大会代表。第四届、五届全国戏剧家代表大会代表。现任安庆再芬黄梅艺术剧院院长，第十届、十一届、十二届全国人大代表，安徽省政协常委。",
                "url": "http://baike.baidu.com/view/28134.htm"
            }
        elif name == u"刘奇葆":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"吉林大学国民经济计划和管理专业毕业，在职研究生学历，经济学硕士学位，现任中央政治局委员、中央书记处书记，中央宣传部部长",
                "url": "http://baike.baidu.com/view/303958.htm"
            }
        elif name == u"刘淇":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"北京钢铁学院冶金系炼铁专业毕业，研究生学历，教授级高级工程师。曾任中共中央政治局委员、北京市委书记，中国志愿服务联合会会长。",
                "url": "http://baike.baidu.com/view/1847.htm"
            }
        elif name == u"路甬祥":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"浙江大学机械工程系水力机械专业毕业，联邦德国亚琛工业大学机械系液压气动研究所研修，研究生学历，博士学位，教授，中国科学院院士，中国工程院院士。 曾任中共中央委员，十一届全国人大常委会副委员长、党组成员，中国科学院院长，浙江大学校长",
                "url": "http://baike.baidu.com/view/1860.htm"
            }
        elif name == u"詹姆斯-卡梅隆":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"好莱坞电影导演、编剧，代表作有《终结者》、《泰坦尼克号》、《阿凡达》。2005年，他被英国杂志《Empire》评为“世界最伟大的20位导演之一”，2010年，入选《时代周刊》评出的“全球最具影响力人物”，同年他获得美国视觉效果工会奖终身成就奖。2011年，获得美国制片人工会奖里程碑奖。",
                "url": "http://baike.baidu.com/subview/274765/5799181.htm?fromtitle=%E8%A9%B9%E5%A7%86%E6%96%AF-%E5%8D%A1%E6%A2%85%E9%9A%86&type=syn"
            }
        elif name == u"邓文迪":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"江苏徐州人，原名邓文革，后改名邓文迪。曾是传媒大亨---新闻集团总裁鲁伯特·默多克的第三任妻子，曾任新闻集团亚洲卫星电视业务副主席，有“一个传奇的中国女人”之誉。2013年11月20日，邓文迪与新闻集团老板默多克与正式离婚。",
                "url": "http://baike.baidu.com/view/423033.htm"
            }
        elif name == u"章子怡":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"电影演员，2000年毕业于中央戏剧学院，代表作有《卧虎藏龙》、《艺伎回忆录》、《一代宗师》。曾获“大众电影百花奖、中国电影华表奖、中国电影金鸡奖、香港电影金像奖、台湾电影金马奖、美国电影金球奖、英国电影学院奖、美国演员工会奖影后提名”。自2005年起章子怡担任奥斯卡终身评委，并连续担任第77和78届奥斯卡颁奖嘉宾；2006、2009、2013年三次担任戛纳国际电影节评委。演艺事业外，章子怡担任中国电影推广大使，在海外积极参与推广宣传华语电影",
                "url": "http://baike.baidu.com/view/2793.htm"
            }
        elif name == u"范冰冰":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"电影演员、歌手，毕业于上海师范大学谢晋影视艺术学院。1996年参演电视剧《女强人》。1998年主演电视剧《还珠格格》系列成名，2001年起投身大银幕。2004年凭借电影《手机》获得第27届大众电影百花奖最佳女主角奖。2005年发行首张个人专辑《刚刚开始》；同年主演电影《墨攻》。2007年，参演电影《心中有鬼》获得第44届台湾电影金马奖最佳女配角奖；同年凭借电影《苹果》获得第4届欧亚国际电影节最佳女演员奖。2013、2014、2015连续三年登上福布斯中国名人榜榜首，成为首位蝉联三届福布斯中国名人榜第一名的中国女星。",
                "url": "http://baike.baidu.com/view/9209.htm"
            }
        elif name == u"冯小刚":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国内地电影导演、编剧、演员，作品风格以京味儿喜剧为主，擅长商业片。2013年07月21日，冯小刚被正式任命为2014年中央电视台春节联欢晚会总导演。2015年，冯小刚被法国文化部授予“艺术与文学骑士勋章”，同年凭借《老炮儿》获得第52届台湾电影金马奖最佳男主角奖。",
                "url": "http://baike.baidu.com/view/1678.htm"
            }
        elif name == u"姜文":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国大陆演员、导演、编剧。1984年毕业于中央戏剧学院，24岁即凭借在《芙蓉镇》中的表演获得了1987年大众电影百花奖最佳男演员，之后的一系列作品也都产生了较大的反响，包括获得1988年柏林国际电影节金熊奖的《红高粱》、获得1993年中国电视金鹰奖的《北京人在纽约》等。自编自导的处女作《阳光灿烂的日子》被《时代周刊》评为“九五年度全世界十大最佳电影”之首；抗战题材影片《鬼子来了》在2000年第53届戛纳国际电影节上荣获了评审团大奖；2010年末上映的贺岁电影《让子弹飞》刷新了国产电影的多项票房纪录，并斩获国内大小奖项二十余个。",
                "url": "http://baike.baidu.com/item/%E5%A7%9C%E6%96%87/1168186"
            }
        elif name == u"徐克":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"1950年2月15日生于越南西贡市，祖籍广东省汕尾市海丰县。香港电影导演、编剧、监制、演员。1981年他凭《鬼马智多星》赢得台湾电影金马奖最佳导演。1983年指导拍摄特效武侠片《新蜀山剑侠》。1984年与施南生组建电影工作室，凭电影《英雄本色》等片，开始拍摄香港武侠片。1991年，指导武侠电影《黄飞鸿》获第11届香港电影金像奖最佳导演奖。1997年，徐克走进好莱坞，指导两部动作电影《双重火力》和《迎头痛击》。2009年，徐与华谊兄弟和博纳影业合作，拍摄了《龙门飞甲》等动作片。2010年徐克执导的影片《狄仁杰之通天帝国》获第67届威尼斯国际电影节金狮奖提名。2013年，徐克获第16届上海国际电影节华语电影杰出贡献奖。2015年凭借《智取威虎山》获得第30届中国电影金鸡奖最佳导演奖",
                "url": "http://baike.baidu.com/subview/29215/5665981.htm"
            }
        elif name == u"欧阳中石":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"山东省肥城市人，著名文化学者、书法家、书法教育家。早年拜在京剧大师奚啸伯的门下。现任首都师范大学教授、博士生导师、中国书法文化研究所所长，北京唐风美术馆名誉馆长。同时是全国政协委员、中国书法家协会顾问、中国画研究院院务委员、艺术品中国资深艺术顾问、山东省方志馆名誉馆长。",
                "url": ""
            }
        elif name == u"张雪":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"贵州籍女演员，张雪(丽黛尔)是布依语言中的译音，布依族的象征好花红的意思，但家人和最亲近的朋友更加愿意亲切的叫她雪儿。由于母亲是东北人，而生长在贵州的黛尔既有东北女孩的大气豪爽，又有南方少数民族女孩的特性，能歌善舞。从小就在童声合唱团学习声乐，并多次获奖，就读于重庆大学美视电影学院时就参演了多部电视剧，《离婚女人》中饰梅珍，《相遇》中饰珊珊，更在《猎捕》中饰演女二号沈丹扬。",
                "url": "http://baike.baidu.com/subview/326454/6223375.htm"
            }
        elif name == u"张海":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中国当代著名书法家，现任中国书法家协会主席，郑州大学美术学院院长。全国政协常委，国务院批准有突出贡献的专家。曾任第八、九、十届全国人大代表，河南省文联主席，河南省书法家协会主席，艺术品中国资深顾问，河南省书画院院长等",
                "url": "http://baike.baidu.com/subview/97543/5133757.htm"
            }
        elif name == u"王元军":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"1965年出生于山东省莱西市。中国第一位书法博士后。现为首都师范大学中国书法文化研究院副院长、教授、博士生导师、中国书法家协会理事。发表历史学、书学学术论文60余篇。出版《唐人书法与文化》、《六朝书法与文化》《汉代书刻文化研究》等专著7部。承担有国家社科基金艺术项目等课题。",
                "url": "http://baike.baidu.com/view/643817.htm"
            }
        elif name == u"刘永富":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"中央党校研究生院在职研究生班法学专业毕业，中央党校研究生学历。现任国务院扶贫开发领导小组副组长，国务院扶贫办党组书记、主任。",
                "url": "http://baike.baidu.com/subview/544969/10208412.htm"
            }
        elif name == u"李前光":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"蒙古族，1960年12月生于河南，1976年12月参加工作，1979年6月入党，研究生学历，高级记者。中国文联党组成员、副主席、书记处书记",
                "url": "http://baike.baidu.com/view/2670311.htm"
            }
        elif name == u"夏红民":
            node_data = {
                "name": u"人物-"+ name,
                "description": u"1961年12月生，1981年05月加入中国共产党，1982年08月参加工作，农学学士，高级农艺师。现任甘肃省副省长，省科协主席",
                "url": "http://baike.baidu.com/view/491507.htm"
            }
            
            
            
            
        elif name == u"王东明看望赵实一行并就有关工作交换意见":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年4月7日，中国文联党组书记、副主席赵实率中国文联调研组来川，围绕“加强和改进文联工作，修改完善《中国文联章程》”等内容展开调研，四川省委书记王东明前往驻地看望赵实一行，并就有关工作交换意见。",
                "url": "http://leaders.people.com.cn/n/2015/0408/c58278-26812914.html"
            }
        elif name == u"中国文联专题研讨繁荣发展社会主义文艺意见":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年10月22日，中国文联主席孙家正出席学习研讨班。中宣部副部长景俊海出席研讨班并作专题辅导报告。中国文联党组书记、副主席赵实主持研讨班并作总结讲话。",
                "url": "http://www.cflac.org.cn/xw/bwyc/201510/t20151022_310662.htm"
            }     
        elif name == u"中央第二巡视组巡视中国文联工作动员会召开":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年10月30日上午，中央第二巡视组巡视中国文联工作动员会召开，第十一届全国政协副主席、中国文联主席孙家正出席会议并讲话，中国文联党组书记、副主席赵实主持会议并作动员讲话，中央第二巡视组组长李五四就即将开展的专项巡视工作作了讲话。",
                "url": "http://www.ccdi.gov.cn/yw/201510/t20151031_64266.html"
            }
        elif name == u"引领风气之先 以优秀作品报答人民——孙家正、赵实考察广东文艺工作":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2011年12月3日，全国政协副主席、中国文联主席孙家正，中国文联党组书记、副主席赵实一行近日专程赴广东考察文艺工作。慰问基层群众和文艺工作者。",
                "url": "http://gdphoto.cn/xinxiview-6920.html"
            }
        elif name == u"多出有筋骨、有道德、有温度的文艺作品":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年4月23日，江苏省文学艺术界联合会第九次代表大会、江苏省作家协会第八次代表大会在南京隆重开幕。省委书记罗志军出席并讲话，中国文联党组书记、副主席赵实，中国作协党组书记、副主席钱小芊应邀出席开幕式并讲话。",
                "url": "http://news.sina.com.cn/o/2015-04-24/031931754113.shtml"
            }
        elif name == u"李岚清篆刻书法艺术展在京举行":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2011年5月20日，由中国美术馆和高等教育出版社主办，中国艺术研究院、中国书法家协会、西泠印社协办的“大众篆刻——李岚清篆刻书法艺术展”于5月20日在中国美术馆隆重开幕。李岚清及夫人章素贞来到中国美术馆参加“大众篆刻——李岚清篆刻书法艺术展”开幕式。中共中央政治局委员国务委员刘延东与中国文联党组书记赵实等出席展览开幕式。",
                "url": "http://www.cflac.org.cn/ysb/2011-05/23/content_22829719.htm"
            }
        elif name == u"“百花迎春”文学艺术界2016春节大联欢举行":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2016年1月16日，由中国文联主办，中国文联演艺中心承办的“百花迎春——中国文学艺术界2016春节大联欢”在北京人民大会堂举行。全国政协副主席卢展工，全国政协副主席王家瑞，中国文联主席孙家正，中国文联党组书记、副主席赵实等出席并观看了演出。",
                "url": "http://www.cflac.org.cn/xw/bwyc/201601/t20160118_320870.htm"
             }
        elif name == u"出席国家大剧院演出黄梅戏《徽州往事》":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2015年12月7号晚上，由著名黄梅戏表演艺术家韩再芬领衔主演的大型原创黄梅戏舞台剧《徽州往事》在国家大剧院精彩上演。中共中央政治局委员、中央书记处书记、中宣部部长刘奇葆观看演出。中国文联党组书记、副主席赵实，中宣部副部长景俊海，文化部副部长董伟，北京市委常委、宣传部长李伟，安徽省委常委、宣传部长曹征海、安庆市委书记虞爱华、市委常委、宣传部长陈爱军等一同观看。",
                "url": "http://xinwen.aqbtv.cn/2015-12/08/cms300411article.shtml"
            }
        elif name == u"第二届北京国际电影开幕":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2012年4月23日晚，第二届北京国际电影节《光影流金》开幕式晚会精彩上演。中共中央政治局委员、北京市委书记、北京国际电影节组委会名誉主席刘淇、全国人大常委会副委员长路甬祥、全国政协副主席中国文联主席孙家正、中国文联党组书记副主席赵实等领导人与国内外著名电影人詹姆斯-卡梅隆、邓文迪、章子怡、范冰冰、冯小刚、姜文、徐克等出席开幕式。",
                "url": "http://ent.ifeng.com/movie/special/2012bjiff/content-3/detail_2012_04/23/14096848_0.shtml"
            }
        elif name == u"参观“欧阳中石书中华美德古训展”":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2014年9月27日，中国文联党组书记、副主席赵实在中国国家博物馆，参观了由中国国家博物馆、中国书法家协会和首都师范大学联合主办的“欧阳中石书中华美德古训展”。陪同赵实一起参观的有中国文联荣誉委员、著名学者、著名书法家、博士生导师欧阳中石，首都师范大学党委书记张雪，中国书法家协会主席张海，北京市委组织部副部长张建春，中国书法家协会驻会副主席陈洪武，首都师范大学纪委书记潘亮，中国书法家协会理事、首都师范大学中国书法文化研究院院长王元军等领导。",
                "url": "http://news.163.com/14/0928/17/A78D06JV00014SEH_all.html"
            }
        elif name == u"出席第七届中国牡丹奖颁奖晚会":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2014年9月15日晚，第七届中国牡丹奖颁奖晚会在南京奥体中心体育馆隆重举行，全国政协副主席、中国文联主席孙家正，中国文联党组书记、副主席赵实出席了颁奖晚会。上海著名曲艺理论家、作家吴宗锡荣获终身成就奖；著名滑稽演员顾竹君荣获表演奖，著名评弹演员徐惠新创作的短篇苏州弹词《梁祝·梳妆》荣获文学奖；著名评弹演员范林元创作的中篇苏州评弹《陈云的故事——凌云出岫》荣获文学特别奖。此次评奖活动是对两年来曲艺创作、表演成果的一次总结，也是对广大曲艺工作者两年来艺术实践的一次集中检阅。",
                "url": "http://gov.eastday.com/renda/2012shwl/introduction/node16103/work/case/u1a1794673.html"
            }
        elif name == u"出席甘肃省双联行动精准扶贫精准脱贫主题晚会":
            node_data = {
                "name": u"事件-"+ name,
                "description": u"2016年3月10日，由甘肃省委宣传部、中国曲艺家协会、省文联等单位共同主办的“温暖”——甘肃省双联行动精准扶贫精准脱贫主题晚会在北京民族文化宫大剧院温情上演。国务院扶贫办党组书记、主任刘永富，中国文联党组书记、副主席赵实，中国文联党组成员、副主席李前光，副省长夏红民与部分全国人大代表、全国政协委员、劳模和在京务工人员代表、社区群众一同观看了演出。",
                "url": "http://gansu.gansudaily.com.cn/system/2016/03/11/015940419.shtml"
            }

        return json.dumps(node_data)

@mod.route('/yulun/')
def yulun():
    """返回页面
    """
    topic_name = request.args.get('query', default_topic_name) # 话题名
    module_name=u'社会舆论分析';
    topicid = em.getEventIDByName(topic_name)
    subevent_id = request.args.get('subevent_id', 'global')
    cluster_num = request.args.get('cluster_num', default_cluster_num)
    cluster_eva_min_size = request.args.get('cluster_eva_min_size', default_cluster_eva_min_size)
    vsm = request.args.get('vsm', default_vsm)

    return render_template('index/topic_comment.html', topic=topic_name, topic_id=topicid, module_name=module_name, subevent_id=subevent_id, \
            cluster_num=cluster_num, cluster_eva_min_size=cluster_eva_min_size, \
            vsm=vsm)

# 更新sentiment标签
sentiment_label_up = dict()
f = open(os.path.join(os.getcwd(), "./turkey/hanhan_sentiment_labels.txt"))
for line in f:
    _id, s_label = line.strip().split("\t")
    if s_label == "高兴":
        s_label = 1
    elif s_label == "愤怒":
        s_label = 2
    elif s_label == "悲伤":
        s_label = 3
    else:
        s_label = 0
    sentiment_label_up[_id] = s_label
f.close()

# 更新sentiment标签
sentiment_weibo_label_up = dict()
f = open(os.path.join(os.getcwd(), "./turkey/hanhan_weibo_senti_labels.txt"))
for line in f:
    _id, s_label = line.strip().split("\t")
    if s_label == "高兴":
        s_label = 1
    elif s_label == "愤怒":
        s_label = 2
    elif s_label == "悲伤":
        s_label = 3
    else:
        s_label = 0
    sentiment_weibo_label_up[_id] = s_label
f.close()

@mod.route('/comments_list/')
def comments_list():
    """计算饼图数据，并将饼图数据和去重后的推荐文本写到文件
    """
    topicid = request.args.get('topicid', default_topic_id)
    subeventid = request.args.get('subeventid', 'global')
    cluster_num = request.args.get('cluster_num', default_cluster_num)
    #if cluster_num == default_cluster_num:
    #    cluster_num = -1
    cluster_eva_min_size = request.args.get('cluster_eva_min_size', default_cluster_eva_min_size)
    vsm = request.args.get('vsm', default_vsm)

    ec = EventComments(topicid)
    if subeventid == 'global':
        comments = ec.getAllNewsComments()
    else:
        comments = ec.getCommentsBySubeventid(subeventid)

    if not comments:
        return json.dumps({"status":"fail"})

    cal_results = comments_calculation_v2(comments, cluster_num=int(cluster_num), \
            cluster_eva_min_size=int(cluster_eva_min_size), version=vsm)
    features = cal_results['cluster_infos']['features']
    item_infos = cal_results['item_infos']

    cluster_ratio = dict()
    senti_ratio = dict()
    sentiment_results = dict()
    cluster_results = dict()
    for comment in item_infos:
        if ('clusterid' in comment) and (comment['clusterid'][:8] != 'nonsense') : 
            clusterid = comment['clusterid']

            try:
                cluster_ratio[clusterid] += 1
            except KeyError:
                cluster_ratio[clusterid] = 1
            try:
                cluster_results[clusterid].append(comment)
            except KeyError:
                cluster_results[clusterid] = [comment]

        if ('sentiment' in comment) and (comment['sentiment'] in emotions_vk_v1) and ('clusterid' in comment) \
                and (comment['clusterid'][:8] != 'nonsense'):
            sentiment = comment['sentiment']
            if 'user_comment_url' in comment:
                user_comment_url = comment["user_comment_url"]
                try:
                    sentiment = sentiment_label_up[user_comment_url]
                    #if user_comment_url == "http://www.tianya.cn/9143360":
                    #    print sentiment
                except:
                    pass

            try:
                sentiment = sentiment_weibo_label_up[comment["_id"]]
            except:
                pass
            comment["sentiment"] = sentiment

            try:
                senti_ratio[sentiment] += 1
            except KeyError:
                senti_ratio[sentiment] = 1
            try:
                sentiment_results[sentiment].append(comment)
            except KeyError:
                sentiment_results[sentiment] = [comment]

    ratio_results = dict()
    ratio_total_count = sum(cluster_ratio.values())
    for clusterid, ratio in cluster_ratio.iteritems():
        if clusterid in features:
            feature = features[clusterid]
            if feature and len(feature):
                ratio_results[','.join(feature[:3])] = float(ratio) / float(ratio_total_count)

    sentiratio_results = dict()
    sentiratio_total_count = sum(senti_ratio.values())
    for sentiment, ratio in senti_ratio.iteritems():
        if sentiment in emotions_vk_v1:
            label = emotions_vk_v1[sentiment]
            if label and len(label):
                sentiratio_results[label] = float(ratio) / float(sentiratio_total_count)

    # 情感分类去重
    sentiment_dump_dict = dict()
    for sentiment, contents in sentiment_results.iteritems():
        dump_dict = dict()
        for comment in contents:
            same_from_sentiment = comment["same_from_sentiment"]
            try:
                dump_dict[same_from_sentiment].append(comment)
            except KeyError:
                dump_dict[same_from_sentiment] = [comment]
        sentiment_dump_dict[sentiment] = dump_dict


    # 子观点分类去重
    cluster_dump_dict = dict()
    for clusterid, contents in cluster_results.iteritems():
        if clusterid in features:
            feature = features[clusterid]
            if feature and len(feature):
                dump_dict = dict()
                for comment in contents:
                    same_from_cluster = comment["same_from"]
                    try:
                        dump_dict[same_from_cluster].append(comment)
                    except KeyError:
                        dump_dict[same_from_cluster] = [comment]
                    cluster_dump_dict[clusterid] = dump_dict

    dump_file = open(temp_file, 'w')
    dump_file.write(json.dumps({"features":features, "senti_dump_dict":sentiment_dump_dict,\
            "cluster_dump_dict":cluster_dump_dict}))
    dump_file.close()
    ratio_results = {
        "方韩之争": 14.0 / 33,
        "冯骥才做法不妥": 6.0 / 33, 
        "韩寒真乖文章没了作品不出了": 8.0 / 33,
        "这些人控制中国文坛": 5.0 / 33
    }

    return json.dumps({"ratio":ratio_results, "sentiratio":sentiratio_results,})

@mod.route('/sentiment_comments/')
def sentiment_comments():
    """情感文本推荐
    """
    sort_by = request.args.get('sort', 'weight')
    dump_file = open(temp_file,'r')
    dump_dict = json.loads(dump_file.read())
    sentiment_dump_dict = dump_dict["senti_dump_dict"]
    dump_file.close()
    
    sentiment_comments = dict()
    for sentiment, dump_dict in sentiment_dump_dict.iteritems():
        for same_from in dump_dict:
            dump_dict[same_from].sort(key=lambda c:c[sort_by], reverse=True)
            try:
                sentiment_comments[sentiment].append(dump_dict[same_from][0])
            except KeyError:
                sentiment_comments[sentiment] = [dump_dict[same_from][0]]
        sentiment_comments[sentiment].sort(key=lambda c:c[sort_by], reverse=True)
    return json.dumps(sentiment_comments)

def update_cluster_text():
    cluster_dict = dict()
    f = open(os.path.join(os.getcwd(), "./turkey/hanhan_cluster_labels.txt"))
    for line in f:
        cluster_id, comment_id = line.strip().split(",")
        cluster_dict[comment_id] = cluster_id
    f.close()

    cluster_features = dict()
    f = open(os.path.join(os.getcwd(), "./turkey/hanhan_cluster_features.txt"))
    for line in f:
        cluster_id, features = line.strip().split(",")
        cluster_features[cluster_id] = features
    f.close()

    return cluster_dict, cluster_features

update_cluster_labels, update_cluster_features = update_cluster_text()

@mod.route('/cluster_comments/')
def cluster_comments():
    """观点文本推荐
    """
    sort_by = request.args.get('sort', 'weight')
    dump_file = open(temp_file,'r')
    dump_dict = json.loads(dump_file.read())
    cluster_dump_dict = dump_dict["cluster_dump_dict"]
    features = dump_dict["features"]
    dump_file.close()

    global_comment_list = []

    cluster_comments = dict()
    for clusterid, dump_dict in cluster_dump_dict.iteritems():
        if clusterid in features:
            feature = features[clusterid]
            if feature and len(feature):
                cluster_comments[clusterid] = []
                cluster_comments[clusterid].append(','.join(feature[:5]))
                dump_list = []
                for same_from in dump_dict:
                    dump_dict[same_from].sort(key=lambda c:c[sort_by], reverse=True)
                    dump_list.append(dump_dict[same_from][0])
                dump_list.sort(key=lambda c:c[sort_by], reverse=True)
                cluster_comments[clusterid].append(dump_list)

                global_comment_list.extend(dump_list)

    cluster_comments = dict()
    for comment in global_comment_list:
        clusterid = update_cluster_labels[comment["_id"]]
        if clusterid in cluster_comments:
            cr = cluster_comments[clusterid]
            cr[1].append(comment)
        else:
            cluster_comments[clusterid] = [update_cluster_features[clusterid], [comment]]

    for clusterid, data in cluster_comments.iteritems():
        data[1].sort(key=lambda c:c[sort_by], reverse=True)

    return json.dumps(cluster_comments)


@mod.route('/emergency/')
def emergency():
    """返回话题管理页面
    """
    #topic_name = request.args.get('query', default_topic_name) # 国家名
    return render_template('index/emergency.html')