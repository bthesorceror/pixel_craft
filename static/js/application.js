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
  img.src = "/images/wool.png";

  for (var r = 0; r < rows; r++) {
    matrix.push([]);
    for (var c = 0; c < cols; c++) {
      matrix[r].push(-1);
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
      ctx.drawImage(img, color * b, 0, b, b, r, c, b, b);
      matrix[offset.top][offset.left] = color;
    },
    unbindFill: function() {
      $c.off("mousemove.fill");
    },
    release: function(e) {
      color < 0 ? canvas_actions.erase(e) : canvas_actions.fill(e);
      canvas_actions.unbindFill();
    },
    erase: function(e) {
      var offset = getCursorOffset(e),
          b = block_size,
          r = offset.left * b,
          c = offset.top * b;
      ctx.clearRect(r, c, b, b);
      matrix[offset.top][offset.left] = -1;
    },
    download: function(json) {
      var $a = $("<a />", {
            href: "data:text/plain," + JSON.stringify(json),
            text: "Download!",
            "class": "button",
            target: "_blank"
          });
      $a.insertAfter($("form").find("[type=submit]"));
    }
  };

  function run() {
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

    $("form").on("submit", function(e) {
      e.preventDefault();
      var $f = $(this),
          json = {
            name: $f.find("#name").val(),
            data: matrix
          };
      if (!json.name) {
        $f.find(".error").show();
        return;
      }
      $f.find(".error").hide();
      canvas_actions.download(json);
    });

    $c.on({
      mousedown: canvas_actions.press,
      mouseup: canvas_actions.release,
      mouseleave: canvas_actions.unbindFill
    });

    var on_off = new BinaryObject("off", "on");

    $("#grid").on("click", function(e) {
      e.preventDefault();
      $(this).text("Grid " + on_off.val($c.hasClass("grid")));
      $c.toggleClass("grid");
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
