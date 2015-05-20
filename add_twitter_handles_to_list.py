import time
import requests
import tweepy
import os

requests.packages.urllib3.disable_warnings()

ENV_VARS = ["TWITTER_CONSUMER_KEY", "TWITTER_CONSUMER_SECRET", "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_SECRET"]
for env in ENV_VARS:
	if not os.getenv(env):
		raise Exception("Please source .secret file. Variable %s was missing." % env)

auth = tweepy.OAuthHandler(os.getenv("TWITTER_CONSUMER_KEY"), os.getenv("TWITTER_CONSUMER_SECRET"))
auth.set_access_token(os.getenv("TWITTER_ACCESS_TOKEN"), os.getenv("TWITTER_ACCESS_SECRET"))
twitter_api = tweepy.API(auth)

with open("twitter_handles.txt") as f:
	for handle in f.read().strip().splitlines():
		print "Adding %s to list" % handle
		try:
			twitter_api.add_list_member(screen_name=handle, slug='northwestern-university', owner_screen_name='@aljohri')
		except tweepy.error.TweepError:
			print "Failed to add %s to list" % handle
			print "Sleeping for 5 seconds..."
			time.sleep(5)
			twitter_api.add_list_member(screen_name=handle, slug='northwestern-university', owner_screen_name='@aljohri')