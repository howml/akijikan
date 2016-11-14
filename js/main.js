
var addItem = function(s, img, list) {
	/*
	<li id="day0"><div class="collapsible-header"><span class="days"></span><span class="gcal"></span></div></li>
	*/
	var li = create("li");
	var div = create("div");
	div.className = "collapsible-header";
	li.appendChild(div);
	var span = create("span");
	span.className = "days";
	div.appendChild(span);
	var span2 = create("span");
	span2.className = "gcal";
	div.appendChild(span2);
	get("items").appendChild(li);
	
	span.textContent = s;
	
	if (img) {
		/*
		var img = new Image();
		img.src = "img/image.png";
		img.style = "width: 5rem; height: 5rem;";
		span2.appendChild(img);
		*/
		span2.style = "text-align: center; line-height: 10rem; display: block; float: right; margin-top: 2.5rem; width: 5rem; height: 5rem;";
		span2.style.backgroundImage = "url(img/image.png)";
		span2.style.backgroundSize = "5rem auto";
		span2.style.backgroundPosition = "center center";
	} else {
		span2.innerHTML = "<i class=material-icons>broken_image</i>";
	}
	
	var div2 = create("div");
	div2.className = "collapsible-body";
	li.appendChild(div2);
	for (var i = 0; i < list.length; i++) {
		var d = create("div");
		d.textContent = list[i];
		div2.appendChild(d);
	}
};

$(function() {
	addItem("あいう", null, [ "a", "b" ]);
	addItem("がぞうあり", true, [ "a", "b" ]);
});
