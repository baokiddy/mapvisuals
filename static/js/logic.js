// Link to GeoJSON
var APILink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

var geojson;

// Perform a GET request to the query URL
d3.json(APILink, function(eqData) { 
  // Perform a GET request to the query URL
  d3.json(tectonicLink, function(tData) {
  // Print out the earthquake data features
  console.log(eqData.features);

  // Print out the tectonic data features
  console.log(tData.features);

  // Once we get a response, send the data.features object to the createEQFeatures function
  var eq = createEQFeatures(eqData.features);

  // Once we get a response, send the data.features object to the createTFeatures function
  var tec = createTFeatures(tData.features);

  createMap(eq, tec);
  });  
});

function createEQFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")};

  function getColor(magnitude) {
    return magnitude > 5  ? '#BD0026' :
            magnitude > 4  ? '#f03b20' :
            magnitude > 3  ? '#fd8d3c' :
            magnitude > 2   ? '#fecc5c' :
            magnitude > 1   ? '#ffffb2' :
            magnitude > 0   ? '#f0f9e8' :
            '               #FFFFFF';
  }

  function style (feature, latlng) {
    return L.circleMarker(latlng, {
                    radius: feature.properties.mag*2.5,
                    fillColor: getColor(feature.properties.mag),
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: style
  });


  // Sending our earthquakes layer to the createMap function
  return earthquakes;
}

function createTFeatures(tectonicData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")};

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array 
  var tectonic = L.geoJSON(tectonicData, {
    onEachFeature: onEachFeature,
  });

  // Sending our earthquakes layer to the createMap function
  return tectonic;
}


function createMap(earthquakes, tectonic) {

  // Define lightmap, streetmap and darkmap layers
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Light Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Faultlines: tectonic
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [38.5025, -122.2654],
    zoom: 5, // 0 to 24
    maxZoom: 20,
    layers: [streetmap, earthquakes, tectonic]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {
    
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    function getColor(magnitude) {
      return magnitude > 5  ? '#BD0026' :
              magnitude > 4  ? '#f03b20' :
              magnitude > 3  ? '#fd8d3c' :
              magnitude > 2   ? '#fecc5c' :
              magnitude > 1   ? '#ffffb2' :
              magnitude > 0   ? '#f0f9e8' :
              '               #FFFFFF';
    }


    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

};
