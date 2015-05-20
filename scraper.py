from flask import Flask, render_template, request, send_file, jsonify, make_response
from flask.ext.cors import cross_origin
from instagram.client import InstagramAPI
import tweepy
import os
import json

from dateutil import tz

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

twitter_handles = [
	"NorthwesternU",
	"NULax",
	"Northwesternmag",
	"NU_LIBRARY",
	"thedailynu",
	"NU_NUIT",
	"NorthwesternSPS",
	"NorthwesternPHA",
	"NUQatar",
	"NUcrew",
	"NorthwesternRO",
	"sesp_nu",
	"NUIFC",
	"HCNorthwestern",
	"NorthwesternDZ",
	"phipsinu",
	"nuequipstaff",
	"NUOnBTN",
	"NU_FIJI",
	"DFANorthwestern",
	"NUbands",
	"SLGTauAlpha",
	"NorthwesternRCB",
	"NorthwesternUP",
	"NUpikes",
	"NorthwesternSAA",
	"coach_collins",
	"NU_RHA",
	"NorthwesternGOP",
	"NUStuCo",
	"NorthwesternCFS",
	"ZeeBeeTweets",
	"nuNPHC",
	"NorthwesternLaw",
	"NorthwesternASG",
	"NUSkating",
	"CoreLibraryNU",
	"NUArchives",
	"njtip",
	"nuHPaW",
	"eswnu",
	"NorthwesternMSA",
	"IINanoNU",
	"NUHoopsFan",
	"NU_SailingTeam",
	"JStreetU_NU",
	"NM_News",
	"MSSatNU",
	"NU_Sports",
	"OccupyNU",
	"nugradwriting",
	"NUseniorClass",
	"ASB_NU",
	"ISANorthwestern",
	"NUWomensCenterS YOU",
	"NorthwesternETG",
	"SSDPNU",
	"AIESECNU",
	"stitchmag",
	"NorthwesternTFA",
	"NorthwesternMT",
	"NUSafeRide",
	"NUFHCats",
	"NUTrombones",
	"nwciowa",
	"NUsolar",
	"patgossnugolf",
	"MrNorthwesternU",
	"TOCNorthwestern",
	"NERCenergy",
	"NUJIHR",
	"85BroadsNU",
	"COPE_NU"
]

@app.route('/twitter')
@cross_origin()
def twitter():

	public_tweets = []
	for handle in twitter_handles[:2]:
		public_tweets += twitter_api.user_timeline(handle)

	results = json.dumps([{
		"id": tweet.id,
		"name": tweet.user.name,
		"username": tweet.user.screen_name,
		"text": tweet.text,
		"created_at": tweet.created_at.strftime("%c")
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
		"created_time": media.created_time.replace(tzinfo=from_zone_gmt).astimezone(to_zone).strftime("%c"),
		"url": media.images['standard_resolution'].url
	} for media in your_location])
	return results

if __name__ == '__main__':
	app.debug = True
	app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
