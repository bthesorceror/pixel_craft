$(function() {
  var List = {}, list, view;

  List.Model = Backbone.Model.extend({
    url: "/list.json",
    parse: function(json) {
      return json.items;
    }
  });

  List.View = Backbone.View.extend({
    el: $("#index")[0],
    template: Handlebars.compile($("#item").html()),
    render: function() {
      var self = this,
          model = self.model.toJSON();
      $.each(model, function() {
        self.$el.append(self.template(this));
      });
    },
    initialize: function() {
      this.model.fetch();
      this.model.bind("change", this.render, this);
    }
  });

  view = new List.View({ model: new List.Model });
});
