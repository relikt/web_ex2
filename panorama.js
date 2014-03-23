$(function() {

	var walking = true;

	var $main = $('#panorama-main');
	var $thumb = $('#panorama-thumb');
	var $thumbImg = $thumb.children('img');



	//Init draggable Div
	var $drag = $('<div id="panorama-draggable" style="position: absolute; top:0; border:2px solid black; background:transparent; cursor:pointer; border-radius:10px; "></div>');

	$drag.appendTo($thumb);	

	//Assign Update functions
	$thumbImg.load(function(){ update(); });
	$(window).resize(function(){ update(); });



	//MouseEvents on $drag: drag
	var isMouseDown = false;
	var x0 = 0;
	var actualX = parseInt($drag.css('left'));

	$drag.on('mousedown', function(e) {
		isMouseDown = true; walking=false;
		x0 = e.pageX;
		actualX = parseInt($drag.css('left'));

	}).on('mouseup', function(e){
		isMouseDown = false;

	}).mouseleave(function(e) {
		isMouseDown=false;

	}).on('mousemove', function(e){
		if(isMouseDown) {
			var maxLeft = $thumb.width() - $drag.width() - 3;
			var dx = e.pageX - x0;			
			var newleft = actualX + dx;
			$drag.css({'left':Math.max(0, Math.min(maxLeft, newleft))});
			update();
		}	
	});


	//MouseEvents on $drag: click
	$thumbImg.mousedown(function(e){
		walking = false;
		var x = e.pageX - $thumbImg.offset().left;	
		var w = $thumbImg.width() - $drag.width();	
		var maxLeft = $thumb.width() - $drag.width() - 3;
		var newleft = x / parseFloat(w) * maxLeft - $drag.width()/2;
		$drag.css({'left':Math.max(0, Math.min(maxLeft, newleft))});
		update();
	});


	//MouseEvents on $main: iTouchDrag
	$main.on('mousedown', function(e) {
		isMouseDown = true; walking=false;
		x0 = e.pageX;
		actualX = parseInt($drag.css('left'));	

	}).on('mouseup', function(e){
		isMouseDown = false;

	}).mouseleave(function(e) {
		isMouseDown=false;

	}).on('mousemove', function(e){
		if(isMouseDown) {
			var maxLeft = $thumb.width() - $drag.width() - 3;
			var dx = e.pageX - x0;			
			var newleft = actualX - 0.22 * dx;
			$drag.css({'left':Math.max(0, Math.min(maxLeft, newleft))});
			update();
		}	
	});


	//KeyboardEvents
	$(document).keydown(function(e){
		var dx = 0;
		//Left Arrow
		if (e.keyCode == 37) { 
			dx = 15; walking=false;
		//Right Arrow
		} else if (e.keyCode == 39) { 
			dx = -15; walking=false;
		}
		var maxLeft = $thumb.width() - $drag.width() - 3;
		var actualX = parseInt($drag.css('left'));
		var newleft = actualX - dx;
		$drag.css({'left':Math.max(0, Math.min(maxLeft, newleft))});
		update();
	});
	
	
	//Walker
	walkDirection = 1;
	delayTime = 60;
	setInterval(function() {
	
		if(walking==true) {

			var actualX = parseInt($drag.css('left'));
			var newleft = actualX + walkDirection * 1;
			var maxLeft = $thumb.width() - $drag.width() - 3;
	
			console.log(walkDirection, newleft, maxLeft);

			if(newleft < 0 || maxLeft < newleft) {
				walkDirection *= -1;
			}
			console.log(walkDirection);

			$drag.css({'left':Math.max(0, Math.min(maxLeft, newleft))});
			update();		
		}
	
	}, delayTime);
});


//Update function
function update() {

	var $main = $('#panorama-main');
	var $thumb = $('#panorama-thumb');
	var $drag = $('#panorama-draggable');


	//Update Ratio
	var ratio = $main.width() / parseFloat($main.height());

	$drag.css({
		'height' : $thumb.height() - 7,
		'width' : $thumb.height() * ratio,
	});


	//drag postion -> main background offset
	var left = parseInt( $drag.css('left') );
	var hundertprozent = $thumb.width() - $drag.width() - 3;
	var offset = left / parseFloat(hundertprozent) * 100;
	
	$main.css({'background-position' : offset + "% 0"});
}
