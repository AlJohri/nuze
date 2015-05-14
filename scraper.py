from flask import Flask, render_template, request, send_file
from instagram.client import InstagramAPI
import tweepy
import os
import json

lat, lng = 42.057796,-87.676634

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
def twitter():

	public_tweets = []
	for handle in twitter_handles[:2]:
		public_tweets += twitter_api.user_timeline(handle)

	results = json.dumps([tweet.text for tweet in public_tweets])
	return results

@app.route('/instagram')
def instagram():
	your_location = instagram_api.media_search(count=100, lat=lat, lng=lng, distance=1500)
	results = json.dumps([media.images['standard_resolution'].url for media in your_location])
	return results

if __name__ == '__main__':
	app.debug = True
	app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
