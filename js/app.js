$(function(){

    // YikYak Views

    var YakListView = Backbone.View.extend({
        limit: 10,
        el: "#yak_list",
        render: function() {
            var self = this;
            this.collection.each(function(story) {
                var $iv = new YakItemView({model:story}).render().$el;
                self.$el.prepend($iv);
            });
        }
    })

    var YakItemView = Backbone.View.extend({
        template: $('#yak_item').html(),
        initialize: function() {
            this.listenTo(this.model, "change", this.render);
        },
        render: function() {
            var variables = _.extend({cid:this.model.cid}, this.model.toJSON());
            var template = _.template(this.template, variables);
            this.$el.html(template);
            return this;
        }
    })

    // RSS Views

    var RSSListView = Backbone.View.extend({
        el: "#rss_list",
        render: function() {
            var self = this;
            this.collection.each(function(story) {
                var $iv = new RSSItemView({model:story}).render().$el;
                self.$el.prepend($iv);
            });
        }
    });

    var RSSItemView = Backbone.View.extend({
        events: { "click a.story": "clickedStory" },
        template: $('#story_item').html(),
        render: function() {
            var variables = _.extend({cid:this.model.cid}, this.model.toJSON());
            var template = _.template(this.template, variables);
            this.$el.html(template);
            return this;
        }
    });

    // RSS Models / Collections

    var RSSItem = Backbone.Model.extend({ idAttribute: "url" });
    var RSSList = Backbone.Collection.extend({ model: RSSItem });

    // Yik Yak Models / Collections

    var YakItem = Backbone.Model.extend({ });
    var YakList = Backbone.Firebase.Collection.extend({
      url: new Firebase('https://aljohri-nuyak.firebaseio.com/yaks').limitToLast(10),
      model: YakItem,
      autoSync: true
    });

    // Populate Models

    var yaks = new YakList();
    yaks.on('sync', function(collection) {
      console.log('yaks are loaded', collection);
      list2.render();
    });

    var list2 = new YakListView({collection:yaks});

    // yaks.on('all', function(event) {
    //   // if autoSync is true this will log remove and sync
    //   // if autoSync is false this will only log remove
    //   console.log(event);
    // });

    // Application
    var coll = new RSSList();
    var feed = "http://dailynorthwestern.com/feed/"
    console.log("fetching feed...");
    var list = new RSSListView({collection:coll});

    $.ajax({
        url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=6",
        dataType: "jsonp",
        data: {
            q: feed
        },
        success: function(data) {

            _(data.responseData.feed.entries).each(function(entry){
                console.log(entry.title);
                var m = new RSSItem({title:entry.title, desc:entry.content, url: entry.link});
                coll.add(m);
            });

            list.render();

        }

    });

    var isValidFeed = function(url) {
        return true;
    };

    // console.log(yaks.first());

});