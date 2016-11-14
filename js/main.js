var localdebug = true;
var localdebug = false;
var dummy = [
	{
		name: "むろらん雪まつり",
		img: "http://www.kujiran.net/danpara/danparapark10.gif",
		lat: 42.4116113,
		lng: 140.9988941,
		desc: "だんパラスキー場を会場に、市民スキー大会、スノーボード、スキー教室の他、ご家族そろって楽しめる多彩な催しが満載です。"
	},
	{
		name: "白鳥大橋ビューポイント",
		img: "http://www.city.muroran.lg.jp/main/org6400/images/yakei-hakutyouwan.jpg",
		lat: 42.362751,
		lng: 141.000106,
		desc: "白鳥大橋のビューポイント。橋を西に望む住宅街にある小さな展望広場。夕日が美しく、大黒島が橋の桁下中央に入る景観美。"
	},
	{
		name: "中島公園",
		lat: 42.353396,
		lng: 141.024955,
		img: null,
		desc: "駅近くの公園です",
	},
	{
		name: "新日鉄",
		lat: 42.344137,
		lng: 141.005935,
		img: null,
		desc: "製鉄工場です",
	},
];

var addItem = function(s, img, list) {
	/*
	<li id="day0"><div class="collapsible-header"><span class="days"></span><span class="gcal"></span></div></li>
	*/
	var li = create("li");
	var div = create("div");
	div.className = "collapsible-header";
	li.appendChild(div);
	var span2 = create("span");
	span2.className = "icon";
	div.appendChild(span2);
	var span = create("span");
	span.className = "days";
	div.appendChild(span);
	get("items").appendChild(li);
	
	span.textContent = s;
	
	if (img) {
		if (img != "noimage") {
			/*
			var img = new Image();
			img.src = "img/image.png";
			img.style = "width: 5rem; height: 5rem;";
			span2.appendChild(img);
			*/
			span2.style.backgroundImage = "url(" + img + ")";
		}
	} else {
		span2.innerHTML = "<i class=material-icons>broken_image</i>";
	}
	
	if (list) {
		var div2 = create("div");
		div2.className = "collapsible-body";
		li.appendChild(div2);
		for (var i = 0; i < list.length; i++) {
			if (list[i]) {
				var d = create("div");
				d.innerHTML = list[i];
				div2.appendChild(d);
			}
		}
	}
};
var getLinkDirections = function(lat1, lng1, lat2, lng2) {
	return "https://www.google.com/maps/dir/" + lat1 + "," + lng1 + "/" + lat2 + "," + lng2;
};

var getStaticMap = function(lat, lng, lat2, lng2) {
	var s = "https://maps.googleapis.com/maps/api/staticmap?";
	s +="size=600x300&maptype=roadmap&";
	s += "markers=color:red%7Clabel:P%7C" + lat + "," + lng + "&"
	s += "markers=color:blue%7Clabel:D%7C" + lat2 + "," + lng2 + "&";
	s += "sensor=false";
	return "<img width=100% src='" + s + "'>";
};
var getHTMLMap = function(lat, lng, lat2, lng2) {
	var dir = getLinkDirections(lat, lng, lat2, lng2);
	var img = getStaticMap(lat, lng, lat2, lng2);
	return "<a href='" + dir + "' target=_blank>" + img + "</a>";
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
var getNearCulturalPropertyWithGeo = function(lat, lng, size, callback) {
	var dll = 0.1;
	var latmin = lat - dll;
	var latmax = lat + dll;
	var lngmin = lng - dll;
	var lngmax = lng + dll;

	var q = f2s(function() {/*
		prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
		prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		prefix xsd: <http://www.w3.org/2001/XMLSchema#>
		select ?name ?desc ?url ?img ?lat ?lng {
			?s <http://schema.org/image> ?img;
				rdfs:label ?name;
				geo:lat ?lat;
				geo:long ?lng.
			optional { ?s <http://schema.org/description> ?desc }
			optional { ?s <http://schema.org/url> ?link }
			filter(lang(?name)="$LANG$")
			filter(xsd:float(?lat) < $LAT_MAX$ && xsd:float(?lat) > $LAT_MIN$ && xsd:float(?lng) < $LNG_MAX$ && xsd:float(?lng) > $LAT_MIN$)
		} order by rand() limit $SIZE$
	*/});
	q = q.replace(/\$SIZE\$/g, size);
	q = q.replace(/\$LANG\$/g, "ja");
	q = q.replace(/\$LAT_MAX\$/g, latmax);
	q = q.replace(/\$LAT_MIN\$/g, latmin);
	q = q.replace(/\$LNG_MAX\$/g, lngmax);
	q = q.replace(/\$LNG_MIN\$/g, lngmin);
		
	if (localdebug) {
		callback(dummy);
	} else {
//		prompt(q);
		var baseurl = "https://sparql.odp.jig.jp/data/sparql";
		querySPARQL(baseurl, q, function(data) {
			callback(toList(data));
		});
	}
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

var defpos = [ 42.31804, 140.97418 ];
var cantPos = function() {
	alert("位置情報が取得できないので、現在位置を室蘭駅と仮定します");
	showItems(defpos[0], defpos[1]);
};

var showItems = function(lat, lng) {
	clear("items");
	getNearCulturalPropertyWithGeo(lat, lng, 12, function(data) {
		//		dump(data);
		var getDistance = function(d) {
			var dlat = lat - d.lat;
			var dlng = lng - d.lng;
			return Math.sqrt(dlat * dlat + dlng * dlng);
		};
		data.sort(function(a, b) {
			return getDistance(a) - getDistance(b);
		});
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			addItemSpot(d, lat, lng);
		}
	});
};
var getImageLink = function(img) {
	if (!img)
		return null;
	return "<a href=" + img + " target=_blank><img width=100% src=" + img + "></a>";
};
var addItemSpot = function(d, lat, lng) {
	addItem(d.name.substring(0, 6), d.img, [
		d.name,
		getImageLink(d.img),
		d.desc,
		getHTMLMap(lat, lng, d.lat, d.lng)
	], lat, lng);
};


$(function() {
	addItem("現在位置取得中...", "noimage");
	
	/*
	addItemSpot({
		name: "西山公園",
		lat: 35,
		lng: 135,
		desc: "せつめい"
	}, defpos[0], defpos[1]);
	return;
	*/
	
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			function(pos) {
				var lat = pos.coords.latitude;
				var lng = pos.coords.longitude;
				showItems(lat, lng);
			},
			function(err) {
				var errmes = [ "", "許可されてません", "判定できません", "タイムアウト" ];
				console.log(errmes[err]);
				cantPos();
			},
			{
				enableHighAccuracy: true,
				timeout: 10000, // 10sec
				maximumAge: 600000
			}
		);
	} else {
		cantPos();
	}
});
