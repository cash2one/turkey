#-*-coding=utf-8-*-
"""将mongodb中的weibo数据导出到jl文件，加上news_content字段
   usage: 
   python etl_weibo2jl.py comment_54c5b301d8b487851c2434f9 apec_weibo.jl
   python etl_weibo2jl.py comment_54cb0a32f712cc19a1b02300 edu_weibo.jl
"""

import os
import sys
import json
from utils import _default_mongo
from load_settings import load_settings

settings = load_settings()
MONGOD_HOST = settings.get("MONGOD_HOST")
MONGOD_PORT = settings.get("MONGOD_PORT")
MONGO_DB_NAME = settings.get("MONGO_DB_NAME")

mongo = _default_mongo(host=MONGOD_HOST, port=MONGOD_PORT, \
        usedb=MONGO_DB_NAME)

collection_name = sys.argv[1]
results = mongo[collection_name].find()

jl_file = sys.argv[2]
fw = open(jl_file, 'w')
for r in results:
    r['news_content'] = None
    fw.write('%s\n' % json.dumps(r))
fw.close()

