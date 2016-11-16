var defpos = [ 42.31804, 140.97418, "室蘭駅" ];
//var defpos = [ 42.108813, 140.573886, "森町駅" ];
//var defpos = [ 35.943406, 136.188597, "鯖江駅" ];
var viewlen = 20;
var maxlen = 30;
var dllpoi = 0.1;
var dllemr = 0.01;

var gpson = true;
//var gpson = false;

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
		name: "新日鉄の工場です、すごい夜景がきれいですよ！",
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
	
	if (img && img != "noimage" && img.indexOf("https://") == -1) {
		img = null;
	}
	
	if (img) {
		if (img != "noimage") {
			var span2 = create("span");
			span2.className = "icon";
			div.appendChild(span2);
			span2.style.backgroundImage = "url(" + img + ")";
		}
	} else if (icon == "warning") {
		var img = "img/icon_emergency2.png";
		var span2 = create("span");
		span2.className = "icon";
		div.appendChild(span2);
		span2.style.backgroundImage = "url(" + img + ")";
//		span2.style.backgroundSize = "100%";
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
	s += "size=600x300&scale=2&maptype=roadmap&";
	s += "markers=color:blue%7Clabel:P%7C" + lat + "," + lng + "&"
	s += "markers=color:red%7Clabel:D%7C" + lat2 + "," + lng2 + "&";
	s += "sensor=false";
	return "<img width=100% src='" + s + "'>";
};
var getHTMLMap = function(lat, lng, lat2, lng2) {
	var dir = getLinkDirections(lat, lng, lat2, lng2);
	var img = getStaticMap(lat, lng, lat2, lng2);
	return "<a href='" + dir + "' target=_blank>" + img + "</a>";
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
	var typepoi = [
		"http://purl.org/jrrk#CivicPOI",
		"http://odp.jig.jp/odp/1.0#TourSpot"
	];
	var typeemergency = [
		"http://purl.org/jrrk#EmergencyFacility"
	];
	/*
	getNearTypesWithGeoMulti(typeemergency, lat, lng, dllemr, 10, function(emrs) {
	});
	return;
	*/
	getNearTypesWithGeoMulti(typepoi, lat, lng, dllpoi, size, function(pois) {
		getNearTypesWithGeoMulti(typeemergency, lat, lng, dllemr, 10, function(emrs) {
			
//			dump(emrs);
			var data = [];
			for (var i = 0; i < pois.length; i++)
				data.push(pois[i]);
			for (var i = 0; i < emrs.length; i++)
				data.push(emrs[i]);
			callback(data);
		});
	});
};
var getNearTypesWithGeoMulti = function(types, lat, lng, dll, size, callback) {
	getNearTypesWithGeo(types, lat, lng, dll / 10, size * 2, function(d) {
		if (d.length >= size) {
			callback(d);
			return;
		}
//		alert("/10 " + d.length + "<" + size);
		getNearTypesWithGeo(types, lat, lng, dll / 3, size * 2, function(d) {
			if (d.length >= size / 2) {
				callback(d);
				return;
			}
//			alert("/2 " + d.length + "<" + size);
			getNearTypesWithGeo(types, lat, lng, dll, size * 2, function(d) {
				if (d.length > 0) {
					callback(d);
					return;
				}
				getNearTypesWithGeo(types, lat, lng, dll * 10, size, function(d) {
					if (d.length > 0) {
						callback(d);
						return;
					}
					getNearTypesWithGeo(types, lat, lng, dll * 100, size, callback);
				});
			});
		});
	});
};
var getNearTypesWithGeo = function(types, lat, lng, dll, size, callback, order) {
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
		prefix schema: <http://schema.org/>
		select ?s ?name ?desc ?descen ?link ?img ?lat ?lng ?type {
			?s rdf:type ?type;
				rdfs:label ?name;
				geo:lat ?lat;
				geo:long ?lng.
			optional { ?s <http://schema.org/image> ?img }
			optional {
				?s <http://schema.org/description> ?desc.
				filter(lang(?desc)="$LANG$")
			}
			optional {
				?s <http://schema.org/description> ?descen.
				filter(lang(?descen)="en")
			}
			optional { ?s <http://schema.org/url> ?link }
			$FILTER$
			filter(lang(?name)="$LANG$")
			filter(xsd:float(?lat) < $LAT_MAX$ && xsd:float(?lat) > $LAT_MIN$ && xsd:float(?lng) < $LNG_MAX$ && xsd:float(?lng) > $LAT_MIN$)
		} $ORDER$ limit $SIZE$
	*/});
	/*
	filter(?type=<http://odp.jig.jp/odp/1.0#TourSpot>)
	filter(?type=<http://odp.jig.jp/odp/1.0#TourSpot> || ?type=<http://purl.org/jrrk#CivicPOI>)
	
	filter(?type=<http://odp.jig.jp/odp/1.0#TourSpot> || ?type=<http://purl.org/jrrk#CivicPOI> || ?type=<http://purl.org/jrrk#EmergencyFacility>)
	*/
	
	if (!order)
		order = "order by rand()";
//	if (!order)
//		order = "";
	q = q.replace(/\$ORDER\$/g, order);
	q = q.replace(/\$SIZE\$/g, size);
//	q = q.replace(/\$TYPE\$/g, type);
	q = q.replace(/\$LANG\$/g, "ja");
	q = q.replace(/\$LAT_MAX\$/g, latmax);
	q = q.replace(/\$LAT_MIN\$/g, latmin);
	q = q.replace(/\$LNG_MAX\$/g, lngmax);
	q = q.replace(/\$LNG_MIN\$/g, lngmin);
		
	var ts = [];
	for (var i = 0; i < types.length; i++)
		ts[i] = "?type=<" + types[i] + ">";
	var filter = "filter(" + ts.join(" || ") + ")\n";
	q = q.replace(/\$FILTER\$/g, filter);
	
//	prompt(q);
	
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

var ignoreGPS = function() {
	alert("位置が取得できません。\n" + defpos[2] + "にいるとして調べます");
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
	getNearWithGeo(lat, lng, maxlen, function(data) {
		clear("items");
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
		if (n == 0) {
			alert("近くに観光オープンデータがないようです");
		}
		var emergencymode = false;
		var emelink = null;
		get("flip").onclick = function() {
			emergencymode = !emergencymode;
			var cs = get("items").children;
			var n = 0;
			for (var i = 0; i < cs.length; i++) {
				var item = cs[i];
				var d = item.data;
				if (d) {
					var b = d.type == "http://purl.org/jrrk#EmergencyFacility";
					if (b == emergencymode && n < viewlen) {
						n++;
						item.style.display =  "block";
					} else {
						item.style.display =  "none";
					}
				}
			}
			if (n == 0) {
				if (emergencymode) {
					alert("近くに避難所オープンデータがないようです");
				} else {
					alert("近くに観光オープンデータがないようです");
				}
			}
			if (emergencymode) {
				if (!emelink) {
					var link = document.createElement("link");
					link.rel = "stylesheet";
					link.type = "text/css";
					link.href = "css/emcustom.css";
					document.getElementsByTagName("head")[0].appendChild(link);
					emelink = link;
				} else {
					emelink.disabled = false;
				}
			} else {
				emelink.disabled = true;
			}
		};
	});
};
var getImageLink = function(img) {
	if (!img)
		return null;
	return "<a href=" + img + " target=_blank><img width=100% src=" + img + "></a>";
};
var getLink = function(label, url) {
	if (!url)
		return label;
	return "<a href='" + url + "' target=_blank>" + label + "</a>";
};
var addItemSpot = function(d, lat, lng) {
	var icon = null;
	if (d.type == "http://purl.org/jrrk#EmergencyFacility")
		icon = "warning";
	return addItem(d.name/*.substring(0, 6)*/, d.img, [
		getLink(d.name + (d.link ? '<i class="material-icons">home</i>' : ""), d.link),
		getImageLink(d.img),
		d.desc,
		d.descen,
		getHTMLMap(lat, lng, d.lat, d.lng),
		getLink(getDataSrc(d.type), d.s),
	], d.distance, icon);
};

//localStorage.setItem("akijikan-init", "0");
$(function() {
	if ("1" != localStorage.getItem("akijikan-init")) {
		get("splash").style.display = "block";
		get("splash").onclick = function() {
			get("splash").style.display = "none";
			localStorage.setItem("akijikan-init", "1");
		};
	}
	
	var hash = document.location.hash;
	if (hash.length > 1) {
		var pos = hash.substring(1).split(",");
		if (pos && pos.length == 2) {
			showItems(pos[0], pos[1]);
			return;
		}
	}
	if (!gpson) {
		ignoreGPS();
		return;
	}
	
	get("logo-container").onclick = loadItem;
	loadItem();
});
var loadItem = function() {
	clear("items");
	addItem("付近のデータ取得中...", "noimage");
	
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
				ignoreGPS();
			},
			{
				enableHighAccuracy: true,
				timeout: 10000, // タイムアウト10秒
				maximumAge: 0 // nmsec前のデータを使う、0でキャッシュしない
			}
		);
	} else {
		ignoreGPS();
	}
};
