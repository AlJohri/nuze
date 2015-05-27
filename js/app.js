// var app = app || {};
// TODO name space stuff
// made it global so its easier to debug for now

var FeedView = Backbone.View.extend({
    el: "#feed",
    initialize: function(options) {
        var self = this;
        _.bindAll(self, 'detectScroll'); // binds this collection to the detectScroll function
        $(window).unbind('scroll'); // its binding twice for some reason ..
        $(window).scroll(this.detectScroll); // binds the detectScroll functions to the window scroll event
        self.collection.fetchFeeds({
            success: function() {
                self.listenTo(self.collection, 'add', self.render)
                self.render();
                $(".loading-icon").hide();
                $(".feed-wrapper").fadeIn();
            }
        });
        this.collection.on('sort', this.render, this);
    },
    detectScroll: function() {
        var self = this;
        var fromTop = $(window).scrollTop();

        var arrowTop = $("body > div > div > i")[0].getBoundingClientRect().top;
        var arrowBottom = $("body > div > div > i")[0].getBoundingClientRect().bottom;

        _(self.$el.children()).every(function(item){
            // console.log(item.getBoundingClientRect().top, item.getBoundingClientRect().bottom, arrowTop, arrowBottom);
            if (item.getBoundingClientRect().top < arrowTop && item.getBoundingClientRect().bottom > arrowBottom) {

                $(item).parent().children(".active").removeClass("active");
                $(item).addClass("active");

                var cid = item.getAttribute('data-cid');
                var currentModel = feedlist.get(cid);

                var bigitem = new LargeItemView({model: currentModel}).render().$el;

                $("#big_item_spot").html(bigitem);
                return false;
            }
            // $(item).removeClass("active");
            return true;
        })
    },
    createNewFeedItemView: function(item) {
        return new FeedItemView({model:item}).render().$el;
    },
    renderNew: function(item) {
        this.$el.prepend(this.createNewFeedItemView(item));
        return this;
    },
    render: function() {
        var items = [];
        var self = this;
        // _(self.collection.slice(0,25))
        self.collection.each(function(item) {
            items.push(self.createNewFeedItemView(item));
        });
        this.$el.html(items); // omg this is badddd
        return this;
    }
})

var TweetItem = Backbone.Model.extend({
    idAttribute: "id",
    defaults: { source: "Twitter", logo: "img/twitterlogo.png" }
});

var YakItem = Backbone.Model.extend({
    constructor: function() {
        arguments[0].date = new Date(arguments[0].time);
        arguments[0].text = arguments[0].message;
        arguments[0].score = arguments[0].likes;
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
    defaults: { source: "RSS", } // logo from ajax call
});

// var TweetList = Backbone.Collection.extend({ model: TweetItem });
// var InstaList = Backbone.Collection.extend({ model: InstaList });
// var RSSList = Backbone.Collection.extend({ model: RSSItem });

var YakList = Backbone.Firebase.Collection.extend({
    initialize: function() {
        this.name = "YakItem";
    },
    url: new Firebase('https://aljohri-nutopyak.firebaseio.com/yaks').limitToLast(10),
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
        if (this._order_by == 'newest'){
            return -m.get('date').getTime();
        }
        else if (this._order_by == 'top'){
            return -m.get('score');
        }
    },
    order_by_newest: function(){
        this._order_by = 'newest';
        this.sort();
        console.log("order by newest");

    },
    order_by_top: function(){
        this._order_by = 'top';
        this.sort();
        console.log("order by top");
    },
    _order_by: 'newest',

    fetchFeeds: function(options) {

        this.trigger("fetchFeeds:started");

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

        var deferreds = [];

        _.each(feeds, function(feed, name) {
            var deferred = $.ajax({
                url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=6",
                dataType: "jsonp",
                data: {
                    q: feed
                },
                success: function(data) {
                    _(data.responseData.feed.entries).each(function(entry) {

                        if (name == "North By Northwestern") {
                            entry.link = "http://northbynorthwestern.com" + entry.link;
                        }

                        // console.log(entry.title);
                        var m = new RSSItem({
                            rssfeed:name,
                            logo:logos[name],
                            text:entry.title,
                            desc:entry.content,
                            url: entry.link,
                            date: new Date(entry.publishedDate),
                            score: 0
                        });
                        feedlist.add(m);
                    });
                }

            });
            deferreds.push(deferred);
        })

        console.log("fetching instagram...");

        var deferred = $.ajax({
            url: "https://nuze.herokuapp.com/instagram",
            dataType: "json",
            success: function(data) {
                _(data).each(function(pic) {
                    var m = new InstaItem({
                        id: pic.id,
                        name: pic.name,
                        username: pic.username,
                        text: pic.caption,
                        picurl: pic.url,
                        date: new Date(pic.created_time),
                        score: pic.num_likes
                    });
                    feedlist.add(m);
                }
            )}
        });

        deferreds.push(deferred);

        console.log("fetching tweets...");

        var deferred = $.ajax({
            url: "https://nuze.herokuapp.com/twitter",
            dataType: "json",
            success: function(data) {
                _(data).each(function(tweet) {
                    var m = new TweetItem({
                        id: tweet.id,
                        name: tweet.name,
                        username: tweet.username,
                        text: tweet.text,
                        date: new Date(tweet.created_at),
                        score: tweet.retweet_count + tweet.favorite_count
                    });
                    feedlist.add(m);
                }
            )}
        });

        deferreds.push(deferred);

        console.log(deferreds);

        $.when.apply($, deferreds).done(function() {
            if (options.success) {
                console.log("all done??!");
                options.success();
            }
        })

    }
});

var genericRender = function() {
    var variables = _.extend({cid:this.model.cid}, this.model.toJSON());
    var template = _.template(this.template, variables);
    this.setElement(template); // this.$el = template;
    return this;
};

var FeedItemView = Backbone.View.extend({
    events: {"click": "scrollIntoView"},
    template: $("#feed_item").html(),
    render: genericRender,
    scrollIntoView: function() {
        var self = this;

        var arrowTop = $("body > div > div > i")[0].getBoundingClientRect().top;
        var arrowBottom = $("body > div > div > i")[0].getBoundingClientRect().bottom;

        var arrowMidPoint = arrowTop + ((arrowBottom - arrowTop) / 2);

        var offset = self.$el.offset();

        offset.top -= arrowMidPoint - (self.$el.height() / 2);

        $('html, body').animate({
            scrollTop: offset.top,
        });

    }
});

var LargeItemView = Backbone.View.extend({
    template: $("#big_feed_item").html(),
    render: genericRender
})

// Populate Models

var feedlist = new FeedList();

var yaklist = new YakList();
yaklist.on('add', function(yak) {
    if (yak.attributes.message != "") {
        feedlist.add(yak);
    }
});

var feedview =  new FeedView({collection: feedlist});

$("#newbtn").click(function() {
    feedlist.order_by_newest();
    $("#popularbtn").removeClass("disabled");
    $("#newbtn").addClass("disabled");
});

$("#popularbtn").click(function() {
    feedlist.order_by_top();
    $("#newbtn").removeClass("disabled");
    $("#popularbtn").addClass("disabled");
});