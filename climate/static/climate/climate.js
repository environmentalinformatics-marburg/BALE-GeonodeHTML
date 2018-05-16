"use strict";
document.addEventListener('DOMContentLoaded', function() {
    init();
}, false);

function init() {
	
	//var sourceProj = ol.proj.get("EPSG:4326"); // WGS 84 lat lon
	//var targetProj = ol.proj.get("EPSG:3857"); // WGS84 Web Mercator (Auxiliary Sphere)
	
	var vectorSource = new ol.source.Vector({
		url: '/static/climate/poi.geojson',
		format: new ol.format.GeoJSON()
	});
	
	var clusterSource = new ol.source.Cluster({
        source: vectorSource,
		distance: 50,
    });
	
	var vectorLayer = new ol.layer.Vector({
		source: clusterSource,
		style: pointStyleFunction,
	});
	
	var dragBox = new ol.interaction.DragBox({
		condition: ol.events.condition.platformModifierKeyOnly
    });

	dragBox.on('boxend', function() {
		var extent = dragBox.getGeometry().getExtent();
		var selectedFeatures = [];
		vectorSource.forEachFeatureIntersectingExtent(extent, function(feature) {
          selectedFeatures.push(feature);
        });
		if(selectedFeatures.length>0) {
			if(selectedFeatures.length==1) {
				onFeatureSelect(selectedFeatures[0]);
			} else {
				onFeaturesSelect(selectedFeatures);
			}
		}
	});	
	
	var map = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
		  vectorLayer
        ],
        target: 'map',

        view: new ol.View({
		  projection: "EPSG:3857", // WGS84 Web Mercator (Auxiliary Sphere)
          center: [1159396, 6684387],
          zoom: 6
        }),
		
		controls: ol.control.defaults({attributionOptions:{collapsible:false}}).extend([
			new ol.control.ScaleLine(),
			new ol.control.FullScreen(),
			new ol.control.ZoomSlider(),
		]),
		
		interactions: ol.interaction.defaults({}).extend([
			dragBox
		]),
		
      });
}

function createButton(text, func){
		var button = document.createElement("input");
		button.type = "button";
		button.value = text;
		button.onclick = func;
		return button;
	}

function onFeaturesSelect(selectedFeatures) {
	var root = document.createElement('div');	
	
	var tbl  = document.createElement('table');
	selectedFeatures.forEach(function(feature) {
		var name = feature.get('name');
		var tr = tbl.insertRow();
		var func = function() {
			onFeatureSelect(feature);
		};
		tr.insertCell().appendChild(createButton(name, func));
		//tr.insertCell().appendChild(document.createTextNode(feature.get('poi_type')));
	});
	
	root.appendChild(tbl);	
	
	//root.innerHTML = "Hello World "+selectedFeatures.length;
	$(root).dialog({
		resizable: false,
		width: 400,
		height: 400,
		modal: true,
		title: "selected plots ("+selectedFeatures.length+")",
    });
}

function onFeatureSelect(feature) {
	console.log(feature);
	var ext = feature.getGeometry().getExtent();
	var pos = ol.proj.toLonLat([ext[0], ext[1]]);
	var root = document.createElement('div');
	//root.innerHTML = "cool";
	root.innerHTML = "";
	root.innerHTML = "<b>position</b> WGS84 lon lat  "+pos[0].toFixed(4)+" "+pos[1].toFixed(4);
	root.innerHTML += '<br><b>link</b>: <u><a target="_blank" href="'+feature.get('href')+'">target</a></u>';
	root.innerHTML += '<br><br><b>description</b><br>'+feature.get('description');
	
	$(root).dialog({
		resizable: false,
		width: 640,
		height: 480,
		modal: true,
		title: feature.get('name'),
    });
}


function createTextStyle(feature) {
	var features = feature.get('features');
	var isPOI = features.length<2;
	var text = isPOI?features[0].get('name'):""+features.length+"";

	console.log(feature.get('name'));
	//console.log(feature);
	return new ol.style.Text({
		text: text,
		//textAlign: align,
		//textBaseline: baseline,
		font: '15px sans-serif',
		//text: getText(feature, resolution, dom),
		fill: isPOI?new ol.style.Fill({color: '#ffffff'}):new ol.style.Fill({color: '#bbb'}),
		//stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
		//offsetX: offsetX,
		//offsetY: offsetY,
		//rotation: rotation
	});
}

 function pointStyleFunction(feature, resolution) {
		var features = feature.get('features');  
		var isPOI = features.length<2;
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 30,
            fill: new ol.style.Fill({color: 'rgba(20, 0, 0, 0.5)'}),
            stroke: new ol.style.Stroke({color: (isPOI?'rgba(250, 20, 20, 0.9)':'rgba(200, 10, 10, 0.85)'), width: 2})
          }),
          text: createTextStyle(feature)
        });
      }