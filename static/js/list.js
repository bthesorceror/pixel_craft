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
    prepareModal: function() {
      var $i = this.$el.find("img")
      $i.css({
        height: $(window).height() - 40
      });
      this.$el.show().css({
        width: $i.width()
      });
      $i.on("click", $.proxy(this.close, this));
      this.position();
    },
    render: function() {
      var self = this,
          model = self.model.toJSON();
      $.each(model, function() {
        var $el = $(self.template(this));
        self.$el.append($el);
        $el.find("figure a").modal({
          beforeShow: self.prepareModal
        });
      });
    },
    initialize: function() {
      this.model.fetch();
      this.model.bind("change", this.render, this);
    }
  });

  view = new List.View({ model: new List.Model });
});
