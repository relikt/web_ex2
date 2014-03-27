$(function() {
    $.touch.preventDefault = true;
    $.touch.triggerMouseEvents = true;

    $("#weekly-panorama").panorama();

    var pages = ["index.html", "panoramic.html", "reviewers.html"];
    var current = pages.indexOf(document.location.pathname.substring(1));

    $("h1").swipe({
        "speed": "medium",
        "distance": "short",
        "direction": "left"
    }, function() {
        window.location = pages[(current + 1) % 3];
    });

    $("h1").swipe({
        "speed": "medium",
        "distance": "short",
        "direction": "right"
    }, function() {
        window.location = pages[(current - 1 + 3) % 3];
    });
});
