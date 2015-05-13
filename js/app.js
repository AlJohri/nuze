$(function(){
    var ListView = Backbone.View.extend({
        el: "#story_list",
        render: function() {
            var self = this;
            this.collection.each(function(story) {
                var $iv = new ItemView({model:story}).render().$el;
                self.$el.append($iv);
            });
        }
    });
    
    var ItemView = Backbone.View.extend({
        events: {
            "click a.story": "clickedStory"
        },
        template: $('#story_item').html(),
        render: function() {
            this.$el.html(_.template(this.template, _.extend({cid:this.model.cid}, this.model.toJSON())));
            return this;
        }
    });
    
  
    
    var Item = Backbone.Model.extend({
        idAttribute: "url"
    });
    
    var List = Backbone.Collection.extend({
        model: Item
    });
    
    // Application
    var coll = new List();
    var feed = "http://dailynorthwestern.com/feed/"
        console.log("fetching feed...");



    var list = new ListView({collection:coll});
    $.ajax({
        url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=6",
        dataType: "jsonp",
        data: {
            q: feed
        },
        success: function(data) {
          
            _(data.responseData.feed.entries).each(function(entry){
                console.log(entry.title);
                var m = new Item({title:entry.title, desc:entry.content, url: entry.link});
                coll.add(m);
            });
            
            list.render();  
                       
        }

    });

    
    var isValidFeed = function(url) {
        return true;
    };
});