
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
		//		span2.style.backgroundImage = "url(img/image.png)";
		span2.style.backgroundImage = "url(" + img + ")";
		span2.style.backgroundSize = "auto 5rem";
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

var getCulturalPropertyWithGeo = function(size, callback) {
	var q = f2s(function() {/*
		prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
		prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		select ?name ?desc ?url ?img ?lat ?lng {
			?s <http://schema.org/image> ?img;
				rdfs:label ?name;
				geo:lat ?lat;
				geo:long ?lng.
			optional { ?s <http://schema.org/description> ?desc }
			optional { ?s <http://schema.org/url> ?link }
		} order by rand() limit $SIZE$
	*/});
	q = q.replace(/\$SIZE\$/g, size);
	
	var baseurl = "https://sparql.odp.jig.jp/data/sparql";
	querySPARQL(baseurl, q, function(data) {
		callback(toList(data));
	});
};
var toList = function(data) {
	var items = data.results.bindings;
	var list = [];
	for (var uri in items) {
		var it = items[uri];
		var d = {};
		for (var v in it) {
			d[v] = it[v].value;
		}
		list.push(d);
	}
	return list;
};

$(function() {
	getCulturalPropertyWithGeo(12, function(data) {
		//		dump(data);
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			addItem(d.name.substring(0, 6), d.img, [ d.name, d.desc, d.lat + "," + d.lng ]);
		}
	});
});
