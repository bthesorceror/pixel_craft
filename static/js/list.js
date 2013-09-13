$(function() {
  var List = {}, list, view;

  List.Model = Backbone.Model.extend();

  List.Collection = Backbone.Collection.extend({
    url: "/list.json",
    model: List.Model,
    parse: function(json) {
      return json.items;
    },
    initialize: function() {
    }
  });

  List.View = Backbone.View.extend({
    el: $("#index")[0],
    template: Handlebars.compile($("#item").html()),
    render: function() {
      var self = this;
      $.each(list.models, function() {
        var model = this.toJSON();
        self.$el.append(self.template(model));
      });
    },
    initialize: function() {
      this.listenTo(this.collection, "add", this.render);
    }
  });

  list = new List.Collection();
  view = new List.View({ collection: list });
  list.fetch();
});
