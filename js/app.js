$(function(){

    var FeedView = Backbone.View.extend({
        el: "#feed",
        initialize: function(options) {
            this.collections = options.collections;
            // this.listenTo(this.collections.YakList, 'add', this.renderOne);
        },
        renderOneYak: function(yak) {
            var $iv = new YakItemView({model:yak}).render().$el;
            this.$el.prepend($iv);
        },
        renderOneRSSItem: function(story) {
            var $iv = new RSSItemView({model:story}).render().$el;
            this.$el.prepend($iv);
        },
        renderOneInstaItem: function(pic) {
            var $iv = new RSSItemView({model:pic}).render().$el;
            this.$el.prepend($iv);
        }
        // render: function() {
        //     var self = this;
        //     _.each(this.collections, function(collection, key) {
        //         collection.each(function(story) {
        //             if(collection.name == "RSSItem") {
        //                 var $iv = new RSSItemView({model:story}).render().$el;
        //             }
        //             else {
        //                 var $iv = new YakItemView({model:story}).render().$el;
        //             }
        //             self.$el.prepend($iv);
        //         });
        //     });
        // }
    })

    var InstaItemView = Backbone.View.extend({
        template: $("#insta_item").html(),
        render: function() {
            var variables = _.extend({cid:this.model.cid}, this.model.toJSON());
            var template = _.template(this.template, variables);
            this.$el.html(template);
            return this;
        }
    })

    var YakItemView = Backbone.View.extend({
        template: $('#yak_item').html(),
        // initialize: function() {
        //     this.listenTo(this.model, "change", this.render);
        // },
        render: function() {
            var variables = _.extend({cid:this.model.cid}, this.model.toJSON());
            var template = _.template(this.template, variables);
            this.$el.html(template);
            return this;
        }
    })

    var RSSItemView = Backbone.View.extend({
        events: { "click a.story": "clickedStory" },
        template: $('#story_item').html(),
        // initialize: function() {
        //     this.listenTo(this.model, "change", this.render);
        // },
        render: function() {
            var variables = _.extend({cid:this.model.cid}, this.model.toJSON());
            var template = _.template(this.template, variables);
            this.$el.html(template);
            return this;
        }
    });

    var InstaItem = Backbone.Model.extend({ idAttribute: "url" });
    var InstaList = Backbone.Collection.extend({
        initialize: function() {
            this.name = "InstaItem";
        },
        model: InstaList,
    })

    // RSS Models / Collections

    var RSSItem = Backbone.Model.extend({ idAttribute: "url" });
    var RSSList = Backbone.Collection.extend({
        initialize: function() {
            this.name = "RSSItem";
        },
        model: RSSItem,
    });

    // Yik Yak Models / Collections

    var YakItem = Backbone.Model.extend({
        defaults: { logo: "img/yikyaklogo.png" }
    });
    var YakList = Backbone.Firebase.Collection.extend({
        initialize: function() {
            this.name = "YakItem";
        },
        url: new Firebase('https://aljohri-nuyak.firebaseio.com/yaks').limitToLast(10),
        model: YakItem,
        autoSync: true
    });

    // Populate Models

    var feedview = new FeedView({ collections: {
        RSSList : new RSSList(),
        YakList : new YakList(),
        InstaList : new InstaList(),
    }});

    feedview.collections.YakList.on('sync', function(collection) {
      // console.log('yaks are loaded', collection);
    });

    feedview.collections.YakList.on('add', function(yak) {
      // console.log('new yak', yak);
      feedview.renderOneYak(yak);
    });

    var feeds = {
        "Daily Northwestern": "http://dailynorthwestern.com/feed/",
        "Northwestern News": "http://www.northwestern.edu/newscenter/feeds/all-stories.xml",
        "North By Northwestern": "http://www.northbynorthwestern.com/feed/rss/",
        "NNN": "http://nnn.medill.northwestern.edu/feed/",
        "Sherman Ave": "http://sherman-ave.com/feed/"
    }
    console.log("fetching feeds...");

    var logos = {
        "Daily Northwestern": "img/dailylogo.jpeg",
        "Northwestern News": "img/nulogo.jpg",
        "North By Northwestern": "img/nbnlogo1.png",
        "NNN": "img/nnnlogo.jpg",
        "Sherman Ave": "img/shermanlogo2.jpeg",
        "Yik Yak": "img/yikyaklogo.png"
    }

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
                        url: entry.link
                    });
                    feedview.collections.RSSList.add(m);
                    feedview.renderOneRSSItem(m);
                });
            }

        });
    })

    $.ajax({
        url: "http://nuze.herokuapp.com/instagram",
        dataType: "json",
        success: function(data) {
            _(data).each(function(pic) {
                var m = new InstaItem({
                    url: pic
                });
                feedview.collections.InstaList.add(m);
                feedview.renderOneInstaItem(m);
            }
        )}
    });

    var isValidFeed = function(url) {
        return true;
    };

});