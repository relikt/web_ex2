(function ($) {
    function Panorama(placeholder, options_) {
        // Parse options
        var options = {
            'image': "http://placekitten.com/2000/" + placeholder.height(),
            'factor': 1,
            'navigator': {
                'height': 50
            },
            'start': {
                'x': 0,
                'y': 0
            }
        };

        $.extend(true, options, options_, {
            'image': placeholder.data("src"),
            'factor': placeholder.data("factor"),
            'navigator': {
                'height': placeholder.data("navigator-height")
            },
            'start': {
                'x': placeholder.data("start-x"),
                'y': placeholder.data("start-y")
            }
        });

        // Load image
        var image = new Image();
        image.src = options.image;

        image.onload = function() {
            var image_width = options.factor * image.width,
                image_height = options.factor * image.height,
                pos = {
                    'x': options.start.x,
                    'y': options.start.y
                };

            // Create DOM elements
            mask = $("<div class=\"panorama-viewport-mask\">");
            placeholder.append(mask);

            viewport = $("<img class=\"panorama-viewport\" src=\"" + options.image + "\">").css({
                'width': image_width,
                'height': image_height
            });
            mask.append(viewport);

            nav = $("<nav class=\"panorama-navigator\">").css({
                'background-image': "url(" + options.image + ")"
            });
            placeholder.append(nav);

            indicator = $("<div class=\"panorama-indicator draggable\">");
            nav.append(indicator);

            placeholder.addClass("panorama-container");

            function redraw() {
                mask.css({
                    height: viewport_height()
                });
                nav.css({
                    height: navigator_height(),
                    width: navigator_width()
                });
                indicator.css({
                    left: pos.x * navigator_factor(),
                    top: pos.y * navigator_factor(),
                    width: indicator_width(),
                    height: indicator_height()
                });
                viewport.css({
                    left: -pos.x,
                    top: -pos.y
                });
            }

            function navigator_factor() {
                return navigator_height() / image_height;
            }

            function navigator_height() {
                var height = options.navigator.height;
                if (height / image_height * image_width > mask.width()) {
                    height = mask.width() / image_width * image_height;
                }
                return height;
            }

            function viewport_height() {
                return total_height() - navigator_height();
            }

            function total_height() {
                return placeholder.height();
            }

            function navigator_width() {
                return navigator_height() / image_height * image_width;
            }

            function indicator_width() {
                return mask.width() * navigator_width() / image_width;
            }

            function indicator_height() {
                return viewport_height() * navigator_height() / image_height;
            }

            function max_x() {
                return image_width - mask.width();
            }

            function max_y() {
                return image_height - viewport_height();
            }

            function adjust_pos() {
                if (pos.x < 0) {
                    pos.x = 0;
                } else if (pos.x > max_x()) {
                    pos.x = max_x();
                }
                if (pos.y < 0) {
                    pos.y = 0;
                } else if (pos.y > max_y()) {
                    pos.y = max_y();
                }
            }

            function bounce(v) {
                v = v || {
                    'x': 0,
                    'y': 0
                };
                var our_of_bounds = false;
                if (pos.x < 0) {
                    pos.x = 0;
                    v.x = -v.x;
                    our_of_bounds = true;
                } else if (pos.x > max_x()) {
                    pos.x = max_x();
                    v.x = -v.x;
                    our_of_bounds = true;
                }
                if (pos.y < 0) {
                    pos.y = 0;
                    v.y = -v.y;
                    our_of_bounds = true;
                } else if (pos.y > max_y()) {
                    pos.y = max_y();
                    v.y = -v.y;
                    our_of_bounds = true;
                }
                return our_of_bounds;
            }

            // Automatic panning
            var dir = {
                    'x': 2,
                    'y': 0
                },
                scroll = window.setInterval(function() {
                    pos.x += dir.x;
                    pos.y += dir.y;
                    
                    bounce(dir);

                    redraw();
                }, 20);

            // Manual panning
            var origin_x,
                origin_y,
                origin_pos_x,
                origin_pos_y,
                last_move = 0,
                v = {
                    'x': 0,
                    'y': 0
                },
                mask_mouse_down = false,
                navigator_mouse_down = false;

            function mousedown(e) {
                e = e.originalEvent;
                origin_x = e.pageX;
                origin_y = e.pageY;
                origin_pos_x = pos.x;
                origin_pos_y = pos.y;
                window.clearInterval(scroll);
                e.preventDefault();
            }

            mask.on("mousedown touchstart", function(e) {
                mousedown(e);
                mask_mouse_down = true;
            });

            indicator.on("mousedown touchstart", function(e) {
                mousedown(e);
                navigator_mouse_down = true;
            });

            nav.on("mouseleave touchleave", function(e) {
                if (navigator_mouse_down) {
                    start_momentum();
                }
                navigator_mouse_down = false;
            }).click(function(e) {
                if (new Date() - last_move > 100) {
                    window.clearInterval(scroll);
                    pos.x = (e.pageX - nav.offset().left - indicator_width() / 2) / navigator_factor();
                    pos.y = (e.pageY - nav.offset().top - indicator_height() / 2) / navigator_factor();
                    bounce();
                    redraw();
                }
            });

            $(document).on("mouseup touchend", function() {
                if (mask_mouse_down || navigator_mouse_down) {
                    start_momentum();
                }
                mask_mouse_down = false;
                navigator_mouse_down = false;
            }).on("mousemove touchmove", function(e) {
                e = e.originalEvent;
                if (navigator_mouse_down || mask_mouse_down) {
                    e.preventDefault();

                    var f = navigator_mouse_down ? -navigator_factor() : 1,
                        dx = origin_pos_x - pos.x + (origin_x - e.pageX) / f;
                    pos.x += dx;
                    v.x = (v.x * 1 + dx) / 2;

                    var dy = origin_pos_y - pos.y + (origin_y - e.pageY) / f;
                    pos.y += dy;
                    v.y = (v.y * 1 + dy) / 2;

                    bounce(v);
                    redraw();

                    last_move = +new Date();
                }
            });

            function start_momentum() {
                if (new Date() - last_move < 100) {
                    scroll = window.setInterval(function() {
                        pos.x += v.x;
                        pos.y += v.y;
                        bounce(v);
                        redraw();

                        v.x *= 0.95;
                        v.y *= 0.95;

                        if (v.x < 0.001 && v.x > -0.001 && v.y < 0.001 && v.y > -0.001) {
                            window.clearInterval(scroll);
                        }
                    }, 20);
                }
            }

            // Resizing
            $(window).resize(redraw);

            redraw();
        };
    }

    $.fn.panorama = function (options) {
        return this.each(function () {
            new Panorama($(this), options);
        });
    };
})(jQuery);
