$(function ($) {
    $.fn.panel = function (id) {
        id = id ? id : (this.attr("data-id") || Math.floor((Math.random() * 1000000)));
        $("html").css("overflow", "hidden");
        var $ontab = $("<section />").attr({'class': 'ontab', 'id': id}).appendTo("body");

        var css = {
            "z-index": 1,
            "padding": this.attr("data-padding") || 0,
            "top": this.attr("data-top") || 50,
            "left": this.attr("data-left") || 100,
            "width": this.attr("data-width") || 800,
            "height": this.attr("data-height") || 500,
            "min-width": this.attr("data-min-width") || 190,
            "max-width": this.attr("data-max-width") || 1920,
            "min-height": this.attr("data-min-height") || 30,
            "max-height": this.attr("data-max-height") || 1080
        };

        var attr = {
            "data-resize": this.attr("data-resize") || 1,
            "data-drag": this.attr("data-drag") || 1,
            "data-minimize": this.attr("data-minimize") || 0,
            "data-maximize": this.attr("data-maximize") || 0,
            "data-top": css.top,
            "data-left": css.left,
            "data-width": css.width,
            "data-height": css.height
        };

        $ontab.attr(attr).css(css);

        $close = $("<button />").addClass("btn close").attr("title", "fechar").text("x");
        $mini = $("<button />").addClass("btn btnmini").attr("title", "minimizar").text("-");
        $maxi = $("<button />").addClass("btn btnmaxi").attr("title", "maximizar").html("<span class='maxi'></span>");
        $title = $("<span />").addClass("title").text(this.attr("data-title") || "teste");
        $drag = $("<header />");

        var funcao = {
            M: {},
            E: 0,
            drag: function (v, M) {
                if (M.k === 'd') {
                    var left = M.X + v.pageX - M.pX;
                    var top = M.Y + v.pageY - M.pY;
                    left = left < 0 ? 0 : left;
                    top = top < -1 ? -1 : top;

                    if (left !== 0 || top > -1) {
                        M.o.attr("data-left", left);
                        M.o.attr("data-top", top);
                    }

                    return {left: left, top: top};
                } else {
                    var width = Math.max(v.pageX - M.pX + M.W, 0);
                    var height = Math.max(v.pageY - M.pY + M.H, 0);

                    M.o.attr("data-width", ($("html").width() < parseInt(M.o.attr("data-left")) + width ? parseInt($("html").width()) - parseInt(M.o.attr("data-left")) : width));
                    M.o.attr("data-height", ($(window).height() < (parseInt(M.o.attr("data-top")) + height + 3) ? parseInt($(window).height()) - parseInt(M.o.attr("data-top")) - 3 : height));

                    return {width: M.o.attr("data-width"), height: M.o.attr("data-height")};
                }
            },
            stop: function (event, M) {
                $(document).off('mousemove mouseup');
                return funcao.drag(event, M);
            },
            dragResize: function ($ontab, $resize, key) {
                $resize.on('mousedown', {e: $ontab, k: key}, function (v) {
                    var d = v.data, p = {};
                    var windowsTab = d.e;
                    if (windowsTab.css('position') !== 'relative') {
                        try {
                            windowsTab.position(p);
                        } catch (e) {
                        }
                    }
                    M = {
                        h: $resize,
                        X: p.left || funcao.getInt(windowsTab, 'left') || 0,
                        Y: p.top || funcao.getInt(windowsTab, 'top') || 0,
                        W: funcao.getInt(windowsTab, 'width') || windowsTab[0].scrollWidth || 0,
                        H: funcao.getInt(windowsTab, 'height') || windowsTab[0].scrollHeight || 0,
                        pX: v.pageX,
                        pY: v.pageY,
                        k: d.k,
                        o: windowsTab
                    };

                    $(document).mousemove(function (event) {
                        windowsTab.css(funcao.drag(event, M));
                    }).mouseup(function (event) {
                        windowsTab.css(funcao.stop(event, M));
                    });

                    return false;
                });
            },
            getInt: function (E, k) {
                return parseInt(E.css(k)) || false;
            }
        };

        var panel = {
            drag: function ($ontab, $drag) {
                funcao.dragResize($ontab, $drag, 'd');
            },
            resize: function ($ontab, $resize) {
                funcao.dragResize($ontab, $resize, 'r');
            },
            reazusteMinimalize: function () {
                var i = 0;
                $(".ontab").each(function () {
                    if($(this).attr("data-minimize") === "1") {
                        $(this).css("left", i * parseInt($(this).css("min-width")));
                        i++;
                    }
                });
            },
            minimize: function ($panel) {
                if ($panel.attr("data-minimize") === "1") {
                    $panel.find("header").off("click");
                    $panel.attr("data-minimize", 0);

                    if ($panel.attr("data-maximize") === "1") {
                        $panel.attr("data-maximize", 0);
                        panel.maximize($panel);

                    } else {
                        $panel.css({
                            "top": $panel.attr("data-top") + "px",
                            "left": $panel.attr("data-left") + "px",
                            "width": $panel.attr("data-width") + "px",
                            "height": $panel.attr("data-height") + "px"
                        });
                    }

                    if ($panel.attr("data-drag") === "1") {
                        funcao.dragResize($panel, $panel.find("header"), 'd');
                    }

                    panel.reazusteMinimalize();

                    setTimeout(function () {
                        $panel.css("transition-duration", "0s");
                    }, 300);

                } else {
                    if ($panel.attr("data-maximize") === "0") {
                        $panel.attr({
                            "data-width": $panel.width(),
                            "data-height": $panel.height(),
                            "data-top": $panel.offset().top,
                            "data-left": $panel.offset().left
                        });
                    }

                    var left = 0;
                    $(".ontab").each(function () {
                        if($(this).attr("data-minimize") === "1") {
                            left += parseInt($(this).css("min-width"));
                        }
                    });
                    $panel.attr("data-minimize", 1).css({
                        "transition-duration": "0.3s",
                        "top": parseInt($(window).height()) - 30 + "px",
                        "left": left,
                        "width": 0,
                        "height": 0
                    });

                    setTimeout(function () {
                        $panel.find("header").off("mousedown").on("click", function () {
                            panel.minimize($panel);
                        });
                    }, 300);
                }
            },
            maximize: function ($panel) {
                if ($panel.attr("data-maximize") === "1") {
                    $panel.attr("data-maximize", 0)
                        .css({
                            'width': $panel.attr("data-width") + 'px',
                            'height': $panel.attr("data-height") + 'px',
                            'top': $panel.attr("data-top"),
                            'left': $panel.attr("data-left")
                        });
                    setTimeout(function() {
                        $panel.css("transition-duration", "0s");
                    },300);

                } else {
                    if($panel.attr("data-minimize") === "1") {
                        $panel.attr({
                            "data-width": $panel.width(),
                            "data-height": $panel.height(),
                            "data-top": $panel.offset().top,
                            "data-left": $panel.offset().left
                        });
                    }
                    $panel.attr("data-maximize", 1).css({
                        "transition-duration": "0.3s",
                        'width': $("html").width() + 'px',
                        'height': '100%',
                        'top': '-1px',
                        'left': '0'
                    });
                }
            },
            close: function ($panel) {
                if($panel.attr("data-minimize") === "1") {
                    $panel.attr("data-minimize", 0);
                    panel.reazusteMinimalize();
                }
                $panel.remove();
            },
            open: function () {

            },
            loadContent: function () {

            },
            getLastIndex: function ($tab) {
                var zindex = parseInt($tab.css("z-index"));
                $(".ontab").each(function () {
                    if($(this).attr("data-minimize") === "0" && $(this).attr("id") !== $tab.attr("id")) {
                        zindex = (parseInt($(this).css("z-index")) >= zindex ? parseInt($(this).css("z-index")) + 1 : zindex);
                    }
                });

                return zindex;
            }
        };

        $drag.append($close).append($maxi).append($mini).append($title).prependTo($ontab);

        $close.on("click", function () {
            panel.close($ontab);
        });
        $mini.on("click", function () {
            panel.minimize($ontab);
        });
        $maxi.on("click", function () {
            panel.maximize($ontab);
        });

        if ($ontab.attr("data-drag") === "1") {
            $drag.addClass("jDrag");
            panel.drag($ontab, $drag);
        }
        if ($ontab.attr("data-resize") === "1") {
            $resize = $("<div />").addClass("jResize").appendTo($ontab);
            panel.resize($ontab, $resize);
        }

        $ontab.css("z-index", panel.getLastIndex($ontab)).on("click", function () {
            $(this).css("z-index", panel.getLastIndex($(this)));
        });
    };
}(jQuery));

$("#btnt").on("click", function () {
    $(document).panel();
});