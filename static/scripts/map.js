// Custom icon
var toiletIcon = L.icon({
    iconUrl: 'images/toilet.png',
    shadowUrl: 'images/toilet-shadow.png',
    iconSize:     [39, 50],
    shadowSize:   [33, 25],
    iconAnchor:   [19, 50],
    shadowAnchor: [0, 25],
    popupAnchor:  [-5, -40]
});

// Helper functions
var createAccessibilityString = function (properties) {
    var tokens = [];
    if (properties.AccessibleMale && properties.AccessibleMale == 'True') tokens.push('Male');
    if (properties.AccessibleFemale && properties.AccessibleFemale == 'True') tokens.push('Female');
    if (properties.AccessibleUnisex && properties.AccessibleUnisex == 'True') tokens.push('Unisex');
    return tokens.length == 0 ? 'None' : tokens.join(', ');
};

var splitCamelCase = function (str) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2')
              .replace(/^./, function(str){ return str.toUpperCase(); });
};

var createOpeningHoursString = function (properties) {
    if (properties.IsOpen == 'Variable') {
        if (properties.OpeningHoursSchedule) return properties.OpeningHoursSchedule;
        if (properties.OpeningHoursNote) return properties.OpeningHoursNote;
        return 'Variable'; 
    }
    return splitCamelCase(properties.IsOpen);
};

var getPins = function (e){
    bounds = map.getBounds();
    url = "toilets/within?lat1=" + bounds.getNorthEast().lat + "&lon1=" + bounds.getNorthEast().lng + "&lat2=" + bounds.getSouthWest().lat + "&lon2=" + bounds.getSouthWest().lng;
    $.get(url, pinTheMap, "json");
};

var pinTheMap = function (data){
    // Clear current pins
    map.removeLayer(markerCluster);
    markerCluster = new L.MarkerClusterGroup();
    var res = data.results;

    // Add new pins
    for (var i = 0; i < res.length; i++){
        var toilet = res[i];
        var info = '<div class="name">' + toilet.properties.Name + '</div>' +
                   '<div class="hours">Open: ' + createOpeningHoursString(toilet.properties) + '</div>' +
                   '<div class="disabled">Accessible Facilities: ' + createAccessibilityString(toilet.properties) + '</div>';
        var m = L.marker([toilet.geometry.coordinates[1], toilet.geometry.coordinates[0]]).bindPopup(info);
        // Add point with custom icon
        // var m = L.marker([toilet.geometry.coordinates[1], toilet.geometry.coordinates[0]], {icon: toiletIcon}).bindPopup(info);
        markerCluster.addLayer(m);
    }
    map.addLayer(markerCluster);
};

// Center the map and set the zoom level
var map = L.map('map').setView([-27.75, 153.18], 10);

// Create cluster group to hold the pins
var markerCluster = new L.MarkerClusterGroup();

// Initialise the map with a tile layer and set max zoom and attribution
var tileLayer = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://openstreetmap.org">OpenStreetMap</a>. Data by <a href="http://data.gov.au/dataset/national-public-toilet-map">Australian Department of Health and Ageing</a>, under <a href="http://creativecommons.org/licenses/by/3.0/au">CC BY 3.0 AU</a>.',
  maxZoom: 18 });

map.addLayer(tileLayer);

map.on('dragend', getPins);
map.on('zoomend', getPins);
map.whenReady(getPins);
