$(function() {
  var List = {}, list, view;

  function Success(msg) {
    var $msg;
    this.$msg = $msg = $("<div />", {
      "class": "notice",
      text: msg
    }).prependTo(document.body);
    $msg.css({
      marginLeft: -$msg.outerWidth() / 2
    });
    $msg.delay(5000).animate({
      top: -$msg.outerHeight()
    }, 200, function() {
      $msg.remove();
    });
  }

  List.Model = Backbone.Model.extend({
    url: "/list.json",
    parse: function(json) {
      return json.items;
    }
  });

  List.View = Backbone.View.extend({
    el: $("#items")[0],
    events: {
      "click a.delete": "destroy"
    },
    destroy: function(e) {
      e.preventDefault();
      var $e = $(e.target),
          nevermind = !confirm("Do you really want to delete this awesome design?");
      if (nevermind) { return; }
      $.ajax({
        url: $e.attr("href"),
        type: "delete",
        success: function() {
          $e.closest("article").remove();
          new Success($e.text() + " deleted successfully");
        }
      });
    },
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
