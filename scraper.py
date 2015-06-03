from flask import Flask, render_template, request, send_file, jsonify, make_response
from flask.ext.cors import cross_origin
from instagram.client import InstagramAPI
import tweepy
import pyak
import os
import json
import copy
import logging
import requests
from dateutil import tz
logging.basicConfig()

requests.packages.urllib3.disable_warnings()

def yak_to_dict(yak):
    yak_dict = copy.deepcopy(dict(yak.__dict__))
    yak_dict['client'] = yak.client.__dict__
    yak_dict['client']['location'] = yak_dict['client']['location'].__dict__ if type(yak_dict['client']['location']) != dict else yak_dict['client']['location']
    yak_dict['time'] = yak_dict['time'].strftime("%c")
    yak_dict['gmt'] = yak_dict['gmt'].strftime("%c")
    return yak_dict

from_zone_est = tz.gettz('America/New York')
from_zone_gmt = tz.gettz('GMT')
to_zone = tz.gettz('America/Chicago')

lat, lng = 42.057796,-87.676634

ENV_VARS = ["TWITTER_CONSUMER_KEY", "TWITTER_CONSUMER_SECRET", "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_SECRET", "INSTAGRAM_CLIENT_ID", "INSTAGRAM_CLIENT_SECRET"]
for env in ENV_VARS:
    if not os.getenv(env):
        raise Exception("Please source .secret file. Variable %s was missing." % env)

auth = tweepy.OAuthHandler(os.getenv("TWITTER_CONSUMER_KEY"), os.getenv("TWITTER_CONSUMER_SECRET"))
auth.set_access_token(os.getenv("TWITTER_ACCESS_TOKEN"), os.getenv("TWITTER_ACCESS_SECRET"))
twitter_api = tweepy.API(auth)

instagram_api = InstagramAPI(client_id=os.getenv("INSTAGRAM_CLIENT_ID"), client_secret=os.getenv("INSTAGRAM_CLIENT_SECRET"))

app = Flask(__name__)

@app.route('/twitter')
@cross_origin()
def twitter():

    public_tweets = twitter_api.list_timeline(slug='northwestern-university', owner_screen_name='@aljohri')

    results = json.dumps([{
        "id": tweet.id,
        "name": tweet.user.name,
        "username": tweet.user.screen_name,
        "text": tweet.text,
        "favorite_count": tweet.favorite_count,
        "retweet_count": tweet.retweet_count,
        "created_at": tweet.created_at.replace(tzinfo=from_zone_gmt).astimezone(to_zone).strftime("%c")
    } for tweet in public_tweets])

    return results

@app.route('/instagram')
@cross_origin()
def instagram():
    your_location = instagram_api.media_search(count=100, lat=lat, lng=lng, distance=1000)

    results = json.dumps([{
        "id": media.id,
        "name": media.user.full_name,
        "username": media.user.username,
        "caption": media.caption.text if media.caption else "",
        "num_likes": media.like_count,
        "created_time": media.created_time.replace(tzinfo=from_zone_gmt).astimezone(to_zone).strftime("%c"),
        "url": media.images['standard_resolution'].url
    } for media in your_location])
    return results

@app.route('/yikyak')
@cross_origin()
def yikyak():
    results = []
    yakker = pyak.Yakker()
    print "New yakker registered with ID: %s" % yakker.id
    locations = { "tech": pyak.Location(42.057796,-87.676634) }
    yakker.update_location(locations['tech'])
    yaks = yakker.get_area_tops()
    print "Found %d yaks" % len(yaks)
    for yak in yaks: yak.message_id = yak.message_id.replace("R/", "")
    results = json.dumps([yak_to_dict(yak) for yak in yaks])
    return results

if __name__ == '__main__':
    app.debug = True
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
