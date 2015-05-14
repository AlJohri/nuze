$(function(){

    var FeedView = Backbone.View.extend({
        el: "#feed",
        initialize: function(options) {
            this.collections = options.collections;
            // this.listenTo(this.collections.YakList, 'add', this.renderOne);
        },
        renderOneYak: function(yak) {
            var self = this;
            var $iv = new YakItemView({model:yak}).render().$el;
            self.$el.prepend($iv);
        },
        render: function() {
            var self = this;
            _.each(_.values(this.collections), function(collection) {
                collection.each(function(story) {
                    // debugger;
                    if(collection.name == "RSSItem") {
                        var $iv = new RSSItemView({model:story}).render().$el;
                    }
                    else {
                        var $iv = new YakItemView({model:story}).render().$el;
                    }
                    self.$el.prepend($iv);
                });
            });
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

    // RSS Models / Collections

    var RSSItem = Backbone.Model.extend({ idAttribute: "url" });
    var RSSList = Backbone.Collection.extend({
        initialize: function() {
            this.name = "RSSItem";
        },
        model: RSSItem,
    });

    // Yik Yak Models / Collections

    var YakItem = Backbone.Model.extend({ });
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
        YakList : new YakList()
    }});

    feedview.collections.YakList.on('sync', function(collection) {
      console.log('yaks are loaded', collection);
    });

    feedview.collections.YakList.on('add', function(yak) {
      console.log('new yak', yak);
      feedview.renderOneYak(yak);
    });

    var feed = "http://dailynorthwestern.com/feed/"
    console.log("fetching feed...");

    $.ajax({
        url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=6",
        dataType: "jsonp",
        data: {
            q: feed
        },
        success: function(data) {
            _(data.responseData.feed.entries).each(function(entry) {
                console.log(entry.title);
                var m = new RSSItem({title:entry.title, desc:entry.content, url: entry.link});
                feedview.collections.RSSList.add(m);
            });
            feedview.render();
        }

    });

    var isValidFeed = function(url) {
        return true;
    };

});