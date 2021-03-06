BinaryObject = function(a, b) {
  var o = {
    0: a,
    1: b,
    val: function(bool) { return bool ? this[1] : this[0]; }
  };
  return o;
};

$(function() {
  var block_size = 48,
      $c = $("canvas"),
      img = document.createElement("img"),
      ctx = $c[0].getContext("2d"),
      color = 0,
      rows = ctx.canvas.width / block_size,
      cols = ctx.canvas.height / block_size,
      matrix = [];

  img.onload = run;
  img.src = "/static/images/wool.png";

  for (var c = 0; c < cols; c++) {
    matrix.push([]);
    matrix[c].push([]);
    matrix[c][0] = [];
    for (var r = 0; r < rows; r++) {
      matrix[c][0].push(-1);
    }
  }

  var canvas_actions = {
    press: function(e) {
      $c.on("mousemove.fill", color < 0 ? canvas_actions.erase : canvas_actions.fill);
    },
    fill: function(e) {
      var offset = getCursorOffset(e),
          b = block_size,
          r = offset.left * b,
          c = offset.top * b;
      canvas_actions.draw({
        sx: color * b,
        dx: r,
        dy: c,
      });
      matrix[offset.left][0][rows - offset.top - 1] = color;
    },
    unbindFill: function() {
      $c.off("mousemove.fill");
    },
    release: function(e) {
      color < 0 ? canvas_actions.erase(e) : canvas_actions.fill(e);
      canvas_actions.unbindFill();
    },
    render: function(json) {
      $.each(json.blocks, function(idx) {
        canvas_actions.drawCol(this[0].reverse(), idx);
      });
    },
    drawCol: function(col, idx) {
      var b = block_size;
      $.each(col, function(row) {
        if (this === -1) { return; }
        canvas_actions.draw({
          sx: this * b,
          dx: idx * b,
          dy: row * b
        });
      });
    },
    draw: function(opts) {
      var b = block_size;
      ctx.drawImage(img, opts.sx, 0, b, b, opts.dx, opts.dy, b, b);
    },
    erase: function(e) {
      var offset = getCursorOffset(e),
          b = block_size,
          r = offset.left * b,
          c = offset.top * b;
      ctx.clearRect(r, c, b, b);
      matrix[offset.left][0][rows - offset.top - 1] = -1;
    },
    download: function(json) {
      var $a = $("<a />", {
            href: "data:text/plain," + JSON.stringify(json),
            text: "Download!",
            "class": "button",
            target: "_blank"
          });
      creation.$f.find("a.button").remove();
      $a.insertAfter(creation.$f.find("[type=submit]"));
    }
  };

  var creation = {
    $f: $("form"),
    $error: null,
    compileJSON: function() {
      var data = [];
      this.json = {
        name: this.$f.find("#name").val(),
        blocks: matrix,
        dataURL: ctx.canvas.toDataURL()
      };
      return this.json;
    },
    save: function(e) {
      e.preventDefault();
      this.$success.hide();
      this.compileJSON();
      if (!this.json.name) {
        this.$error.text("Name cannot be blank").show();
        return;
      }
      if (/[^\w\d]/.test(this.json.name)) {
        this.$error.text("Name can only be alphanumeric").show();
        return;
      }
      this.send();
    },
    load: function() {
      var args = window.location.pathname.replace(/^\//, "").split("/");
      if (args.length === 1) { return; }
      $.ajax({
        url: "/item/" + args.pop() + ".json",
        type: "get",
        success: canvas_actions.render
      });
    },
    send: function() {
      var self = this;
      $.ajax({
        url: self.$f.attr("action"),
        type: self.$f.attr("method"),
        data: JSON.stringify(self.json),
        success: function(data) {
          self.$error.hide();
          self.$success.show();
          canvas_actions.download(self.json);
        },
        error: function(xhr) {
          var message = xhr.status == 409 ? "Name is already taken" : "Failed to save";
          self.$error.text(message).show();
        }
      });
    },
    init: function() {
      this.$error = this.$f.find(".error");
      this.$success = this.$f.find(".success");
      this.$f.on("submit", $.proxy(this.save, this));
      this.load();
    }
  };

  function run() {
    creation.init();

    $("#wool").on("click", "a", function(e) {
      e.preventDefault();
      var $li = $(e.target).closest("li").addClass("active");
      $li.closest("ul").find("li").not($li).removeClass("active");
      $("#erase").removeClass("active");
      color = $li.index();
    });

    $("#erase").on("click", function(e) {
      e.preventDefault();
      $(this).addClass("active");
      $("#wool .active").removeClass("active");
      color = -1;
    });

    $c.on({
      mousedown: canvas_actions.press,
      mouseup: canvas_actions.release,
      mouseleave: canvas_actions.unbindFill
    });

    var on_off = new BinaryObject("off", "on"),
        arrows = new BinaryObject("\273", "\253");

    $("#grid").on("click", function(e) {
      e.preventDefault();
      $(this).text("Grid " + on_off.val($c.hasClass("grid")));
      $c.toggleClass("grid");
    });

    $("a.handle").on("click", function(e) {
      e.preventDefault();
      var $s = $("#sidebar");
      $(this).text(arrows.val($s.hasClass("opened")));
      $s.toggleClass("opened");
    });
  }

  function getCursorOffset(e) {
    var offset = {
      left: ~~((e.pageX - $c.offset().left) / block_size),
      top: ~~((e.pageY - $c.offset().top) / block_size)
    };
    return offset;
  }
});
