# -*- coding: utf-8 -*-

from flask import Flask
from flask_debugtoolbar import DebugToolbarExtension
from turkey.news.views import mod as newsModule
from turkey.extensions import mongo

def create_app():
    app = Flask(__name__)
    app.config.from_object('config')

    # Create modules
    app.register_blueprint(newsModule)

    # Enable the toolbar?
    app.config['DEBUG_TB_ENABLED'] = app.debug
    # Should intercept redirects?
    app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
    # Enable the profiler on all requests, default to false
    app.config['DEBUG_TB_PROFILER_ENABLED'] = True
    # Enable the template editor, default to false
    app.config['DEBUG_TB_TEMPLATE_EDITOR_ENABLED'] = True
    # debug toolbar
    # toolbar = DebugToolbarExtension(app)

    # the debug toolbar is only enabled in debug mode
    app.config['DEBUG'] = True

    app.config['ADMINS'] = frozenset(['youremail@yourdomain.com'])
    app.config['SECRET_KEY'] = 'SecretKeyForSessionSigning'
    app.config['THREADS_PER_PAGE'] = 8

    app.config['CSRF_ENABLED'] = True
    app.config['CSRF_SESSION_KEY'] = 'somethingimpossibletoguess'

    app.config["MONGO_DBNAME"] = "news"
    app.config["MONGO_HOST"] = "219.224.134.212"
    app.config["MONGO_PORT"] = 27017

    mongo.init_app(app)

    return app

