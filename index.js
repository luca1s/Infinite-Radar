mapboxgl.accessToken = 'pk.eyJ1IjoiaHltZW5vcHVzIiwiYSI6ImNrN21mbDE1NDBoYTMzbG8waHIzODRnZmQifQ.Sm-p5MctdQjaXASfQWejog';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    antialias: true
});

map.on('load', function () {
    // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    map.addLayer(
        {
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',

                // use an 'interpolate' expression to add a smooth transition effect to the
                // buildings as the user zooms in
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        },
        labelLayerId
    );
});

var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

getJSON('http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856',
    function (err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            data.forEach(function(aircraft) {

                // create a HTML element for each feature
                var icon = document.createElement('div');
                icon.className = 'marker';
              
                // make a marker for each feature and add to the map
                new mapboxgl.Marker(icon)
                  .setLngLat([aircraft.Longitude, aircraft.Latitude])
                  .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                  .setHTML('<h3> Callsign: ' + aircraft.CallSign + '</h3><h3> Display Name: ' + aircraft.DisplayName + '</h3><h3> Speed: ' + Math.round(aircraft.Speed) + '</h3><h3> Altitude: ' + Math.round(aircraft.Altitude) + '</h3><h3> Vertical Speed: ' + Math.round(aircraft.VerticalSpeed) + '</h3><h3> Track: ' + Math.round(aircraft.Track) + '</h3>'))
                  .addTo(map);
              })
        }
    })