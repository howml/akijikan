var viewlen = 20;
var maxlen = 50;

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

var addItem = function(s, img, list, distance, icon) {
	/*
	<li id="day0"><div class="collapsible-header"><span class="days"></span><span class="gcal"></span></div></li>
	*/
	var li = create("li");
	var div = create("div");
	div.className = "collapsible-header";
	li.appendChild(div);
	
	if (img) {
		if (img != "noimage") {
			var span2 = create("span");
			span2.className = "icon";
			div.appendChild(span2);
			/*
			var img = new Image();
			img.src = "img/image.png";
			img.style = "width: 5rem; height: 5rem;";
			span2.appendChild(img);
			*/
			span2.style.backgroundImage = "url(" + img + ")";
		}
	} else {
		var span2 = create("span");
		span2.className = "icon";
		div.appendChild(span2);
		span2.className = "materialicon";
		if (!icon)
			icon = "broken_image";// warning
		//		span2.innerHTML = "<i class=material-icons>broken_image</i>";
		span2.innerHTML = "<i class=material-icons>" + icon + "</i>";
	}
	var span = create("span");
	span.className = "days";
	div.appendChild(span);
	span.textContent = s;
	
	if (distance) {
		var span3 = create("span");
		span3.className = "distance";
		span.appendChild(span3);
		span3.textContent = fixfloat(distance, 2) + "km";
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
	get("items").appendChild(li);
	return li;
};
var getLinkDirections = function(lat1, lng1, lat2, lng2) {
	return "https://www.google.com/maps/dir/" + lat1 + "," + lng1 + "/" + lat2 + "," + lng2;
};

var getStaticMap = function(lat, lng, lat2, lng2) {
	var APIKEY = "AIzaSyCQZtmjVkn8wWuojY1PL96W5yg7u4uMs0k";
	var s = "https://maps.googleapis.com/maps/api/staticmap?";
	s += "key=" + APIKEY + "&";
	s += "size=600x300&maptype=roadmap&";
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
var getDataSrc = function(type) {
	if (type == "http://purl.org/jrrk#CivicPOI")
		return "観光オープンデータ";
	if (type == "http://odp.jig.jp/odp/1.0#TourSpot")
		return "公共クラウド観光データ";
	if (type == "http://purl.org/jrrk#EmergencyFacility")
		return "避難所";
	return type;
};
var getNearWithGeo = function(lat, lng, size, callback) {
	// type
	// http://purl.org/jrrk#CivicPOI
	// http://odp.jig.jp/odp/1.0#TourSpot
	// http://purl.org/jrrk#EmergencyFacility
	var dll = 0.1;
	lat = parseFloat(lat);
	lng = parseFloat(lng);
	var latmin = lat - dll;
	var latmax = lat + dll;
	var lngmin = lng - dll;
	var lngmax = lng + dll;

	var q = f2s(function() {/*
		prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
		prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		prefix xsd: <http://www.w3.org/2001/XMLSchema#>
		select ?name ?desc ?url ?img ?lat ?lng ?type {
			?s rdf:type ?type;
				rdfs:label ?name;
				geo:lat ?lat;
				geo:long ?lng.
			optional { ?s <http://schema.org/image> ?img }
			optional { ?s <http://schema.org/description> ?desc }
			optional { ?s <http://schema.org/url> ?link }
			filter(?type=<http://odp.jig.jp/odp/1.0#TourSpot> || ?type=<http://purl.org/jrrk#CivicPOI> || ?type=<http://purl.org/jrrk#EmergencyFacility>)
			filter(lang(?name)="$LANG$")
			filter(lang(?desc)="$LANG$")
			filter(xsd:float(?lat) < $LAT_MAX$ && xsd:float(?lat) > $LAT_MIN$ && xsd:float(?lng) < $LNG_MAX$ && xsd:float(?lng) > $LAT_MIN$)
		} order by rand() limit $SIZE$
	*/});
	/*
	filter(?type=<http://odp.jig.jp/odp/1.0#TourSpot>)
	filter(?type=<http://odp.jig.jp/odp/1.0#TourSpot> || ?type=<http://purl.org/jrrk#CivicPOI>)
	
	filter(?type=<http://odp.jig.jp/odp/1.0#TourSpot> || ?type=<http://purl.org/jrrk#CivicPOI> || ?type=<http://purl.org/jrrk#EmergencyFacility>)
	*/
	q = q.replace(/\$SIZE\$/g, size);
//	q = q.replace(/\$TYPE\$/g, type);
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
var getDistance = function(lat1, lng1, lat2, lng2) {
	var dlat = (lat2 - lat1) * Math.PI / 180;
	var dlng = (lng2 - lng1) * Math.PI / 180;
	var a = Math.sin(dlat / 2) * Math.sin(dlat / 2)
		+ Math.cos(lat1 * Math.PI / 180)
		* Math.cos(lat2 * Math.PI / 180)
		* Math.sin(dlng / 2) * Math.sin(dlng / 2);
	return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 6371; // 6371 = R of the Earth in km
};
// material icon
// report, new_releases, explicit, error, error_outline, warning, announcement
var showItems = function(lat, lng) {
	clear("items");
	getNearWithGeo(lat, lng, maxlen, function(data) {
		//		dump(data);
		var names = {};
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			var name = d.name; //.trim();
			var dp = names[name];
			if (dp) {
				if (dp.img == null && d.img) {
					names[name] = d;
				}
			} else {
				names[name] = d;
			}
		}
		data = [];
		for (var n in names) {
			data.push(names[n]);
		}
		
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			d.distance = getDistance(lat, lng, d.lat, d.lng);
		}
		data.sort(function(a, b) {
			return a.distance - b.distance;
		});
		var n = 0;
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			var item = addItemSpot(d, lat, lng);
			item.data = d;
			if (d.type == "http://purl.org/jrrk#EmergencyFacility" || n >= viewlen) {
				item.style.display = "none";
			} else {
				n++;
			}
		}
		var emergencymode = false;
		get("flip").onclick = function() {
			emergencymode = !emergencymode;
			var cs = get("items").children;
			var n = 0;
			for (var i = 0; i < cs.length; i++) {
				var item = cs[i];
				var d = item.data;
				var b = d.type == "http://purl.org/jrrk#EmergencyFacility";
				if (b == emergencymode && n < viewlen) {
					n++;
					item.style.display =  "block";
				} else {
					item.style.display =  "none";
				}
			}
		};
	});
};
var getImageLink = function(img) {
	if (!img)
		return null;
	return "<a href=" + img + " target=_blank><img width=100% src=" + img + "></a>";
};
var addItemSpot = function(d, lat, lng) {
	var icon = null;
	if (d.type == "http://purl.org/jrrk#EmergencyFacility")
		icon = "warning";
	return addItem(d.name.substring(0, 6), d.img, [
		d.name,
		getImageLink(d.img),
		d.desc,
		getHTMLMap(lat, lng, d.lat, d.lng),
		getDataSrc(d.type),
	], d.distance, icon);
};

$(function() {
	var hash = document.location.hash;
	if (hash.length > 1) {
		var pos = hash.substring(1).split(",");
		showItems(pos[0], pos[1]);
		return;
	}
	
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
