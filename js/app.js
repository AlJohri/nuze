// var app = app || {};
// TODO name space stuff
// made it global so its easier to debug for now

var FeedView = Backbone.View.extend({
    el: "#feed",
    initialize: function(options) {
        _.bindAll(this, 'detectScroll'); // binds this collection to the detectScroll function
        $(window).unbind('scroll'); // its binding twice for some reason ..
        $(window).scroll(this.detectScroll); // binds the detectScroll functions to the window scroll event
        this.listenTo(this.collection, 'add', this.render);
    },
    detectScroll: function() {
        console.log('detected');
        var self = this;
        var fromTop = $(window).scrollTop();

        var arrowTop = $("body > div > div > i")[0].getBoundingClientRect().top;
        var arrowBottom = $("body > div > div > i")[0].getBoundingClientRect().bottom;

        _(self.$el.children()).every(function(item){
            console.log(item.getBoundingClientRect().top, item.getBoundingClientRect().bottom, arrowTop, arrowBottom);
            if (item.getBoundingClientRect().top < arrowTop && item.getBoundingClientRect().bottom > arrowBottom) {
                $(".enlarge-wrapper").html(item.innerHTML);
                return false;
            }
            return true;
        })
    },
    renderItem: function(item) {
        // HOW TO RENDER IN RIGHT PLACE???
        switch (item.get('source')) {
            case 'Twitter':
                var $iv = new TweetItemView({model:item}).render().$el;
                break;
            case 'Yik Yak':
                var $iv = new YakItemView({model:item}).render().$el;
                break;
            case 'Instagram':
                var $iv = new InstaItemView({model:item}).render().$el;
                break;
            default:
                var $iv = new RSSItemView({model:item}).render().$el;
                break;
        }
        return $iv;
        // this.$el.append($iv);
    },
    render: function() {
        var items = [];
        var self = this;
        _(self.collection.slice(0,25)).each(function(item) {
            items.push(self.renderItem(item));
        });
        this.$el.html(items); // omg this is badddd
    }
})

var TweetItem = Backbone.Model.extend({
    idAttribute: "id",
    defaults: { source: "Twitter", logo: "img/twitterlogo.png" }
});
var YakItem = Backbone.Model.extend({
    constructor: function() {
        arguments[0].date = new Date(arguments[0].time);
        Backbone.Model.apply(this, arguments);
    },
    idAttribute: "id",
    defaults: { source: "Yik Yak", logo: "img/yikyaklogo.png", message: "" }
});
var InstaItem = Backbone.Model.extend({
    idAttribute: "id",
    defaults: { source: "Instagram", logo: "img/instagramlogo.gif" }
});
var RSSItem = Backbone.Model.extend({
    idAttribute: "url",
    defaults: { } // source and logo set during ajax call
});

// var TweetList = Backbone.Collection.extend({ model: TweetItem });
// var InstaList = Backbone.Collection.extend({ model: InstaList });
// var RSSList = Backbone.Collection.extend({ model: RSSItem });

var YakList = Backbone.Firebase.Collection.extend({
    initialize: function() {
        this.name = "YakItem";
    },
    url: new Firebase('https://aljohri-nuyak.firebaseio.com/yaks').limitToLast(10),
    model: YakItem,
    autoSync: true
});

var FeedList = Backbone.Collection.extend({
    model: function(attrs, options) {
        switch (attrs.source) {
            case 'Twitter':
                return new TweetItem(attrs, options);
            case 'Yik Yak':
                return new YakItem(attrs, options);
            case 'Instagram':
                return new InstaItem(attrs, options);
            default:
                return new RSSItem(attrs, options);
        }
        console.log("new model yahoo");
    },
    comparator: function(m) {
        return -m.get('date').getTime();
    }
});

var genericRender = function() {
    var variables = _.extend({cid:this.model.cid}, this.model.toJSON());
    var template = _.template(this.template, variables);
    this.$el.html(template);
    return this;
};

// var FeedItemView = Backbone.View.extend({ render: genericRender });

var TweetItemView = Backbone.View.extend({ template: $("#tweet_item").html(), render: genericRender });
var InstaItemView = Backbone.View.extend({ template: $("#insta_item").html(), render: genericRender });
var YakItemView = Backbone.View.extend({ template: $('#yak_item').html(), render: genericRender });
var RSSItemView = Backbone.View.extend({ template: $("#story_item").html(), render: genericRender });

// Populate Models

var feedlist = new FeedList();
var feedview = new FeedView({collection: feedlist});

var yaklist = new YakList();
yaklist.on('add', function(yak) {
    if (yak.attributes.message != "") {
        feedlist.add(yak);
    }
});

var feeds = {
    "Daily Northwestern": "http://dailynorthwestern.com/feed/",
    "Northwestern News": "http://www.northwestern.edu/newscenter/feeds/all-stories.xml",
    "North By Northwestern": "http://www.northbynorthwestern.com/feed/rss/",
    "NNN": "http://nnn.medill.northwestern.edu/feed/",
    "Sherman Ave": "http://sherman-ave.com/feed/"
}

var logos = {
    "Daily Northwestern": "img/dailylogo.jpeg",
    "Northwestern News": "img/nulogo.jpg",
    "North By Northwestern": "img/nbnlogo1.png",
    "NNN": "img/nnnlogo.jpg",
    "Sherman Ave": "img/shermanlogo2.jpeg",
    "Yik Yak": "img/yikyaklogo.png",
    "Instagram": "img/instagramlogo.gif",
    "Twitter": "img/twitterlogo.png",
}

console.log("fetching feeds...");

_.each(feeds, function(feed, name) {
    $.ajax({
        url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=6",
        dataType: "jsonp",
        data: {
            q: feed
        },
        success: function(data) {
            _(data.responseData.feed.entries).each(function(entry) {
                // console.log(entry.title);
                var m = new RSSItem({
                    source:name,
                    logo:logos[name],
                    title:entry.title,
                    desc:entry.content,
                    url: entry.link,
                    date: new Date(entry.publishedDate)
                });
                feedlist.add(m);
            });
        }

    });
})

var isValidFeed = function(url) {
    return true;
};

console.log("fetching instagram...");

$.ajax({
    url: "http://nuze.herokuapp.com/instagram",
    dataType: "json",
    success: function(data) {
        _(data).each(function(pic) {
            var m = new InstaItem({
                id: pic.id,
                username: pic.username,
                caption: pic.caption,
                url: pic.url,
                date: new Date(pic.created_time)
            });
            feedlist.add(m);
        }
    )}
});

console.log("fetching tweets...");

$.ajax({
    url: "http://nuze.herokuapp.com/twitter",
    dataType: "json",
    success: function(data) {
        _(data).each(function(tweet) {
            var m = new TweetItem({
                id: tweet.id,
                username: tweet.username,
                message: tweet.text,
                date: new Date(tweet.created_at)
            });
            feedlist.add(m);
        }
    )}
});
