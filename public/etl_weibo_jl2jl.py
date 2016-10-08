#-*-coding=utf-8-*-
"""将陈柯数据解析出的jl文件转换成需要的格式
"""

import sys
import json
from utils import ts2datetime, ts2date

input_file = sys.argv[1]
output_file = sys.argv[2]

def transform(item):
    result = dict()
    result['reposts_count'] = item['reposts_count']
    result['user_comment_url'] = item['weibourl']
    result['comment_source'] = item['weibourl']
    result['first_in'] = None
    result['last_modify'] = None
    result['timestamp'] = item['timestamp']
    result['content168'] = item['text']
    result['datetime'] = ts2datetime(item['timestamp'])
    result['news_id'] = 'weibo'
    result['attitudes_count'] = item['attitudes_count']
    result['news_content'] = None
    result['comments_count'] = item['comments_count']
    result['location'] = item['geo']
    result['date'] = ts2date(item['timestamp'])
    result['_id'] = item['_id']
    result['id'] = item['_id']
    result['user_name'] = item['name']
    return result

f = open('./jl_package_data/%s' % input_file)
fw = open('./jl_package_data/%s' % output_file, 'w')

for line in f:
    item = json.loads(line.strip())
    item = transform(item)
    fw.write('%s\n' % json.dumps(item))

f.close()
fw.close()
