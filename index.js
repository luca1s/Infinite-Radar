window.inactive = false
window.currentMarkers = [];
window.serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"

function idleTimer() {
    var t;
    //window.onload = resetTimer;
    window.onmousemove = resetTimer; // catches mouse movements
    window.onmousedown = resetTimer; // catches mouse movements
    window.onclick = resetTimer;     // catches mouse clicks
    window.onscroll = resetTimer;    // catches scrolling
    window.onkeypress = resetTimer;  //catches keyboard actions

    function pauseActivity() {
        inactive = true
        confirm("You've been inactive for a while! Click 'Ok' to continue using Infinite Radar", function (confirmed) {
            if (confirmed) {
                resetTimer()
                inactive = false
            }
        })
    }

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(pauseActivity, 900000);  // time is in milliseconds (1000 is 1 second)
    }
}
idleTimer();


mapboxgl.accessToken = 'pk.eyJ1IjoiaHltZW5vcHVzIiwiYSI6ImNrN21mbDE1NDBoYTMzbG8waHIzODRnZmQifQ.Sm-p5MctdQjaXASfQWejog';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    zoom: '1',
    antialias: true,
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

function changeServer(server) {
    if (server == "casual") {
        serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=5f3fdc11-35b8-4268-832f-42f1c6539ab9"
    } else if (server == "training") {
        serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=6a04ffe8-765a-4925-af26-d88029eeadba"
    } else {
        serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
    }
    loadAircraft()
}

function loadAircraft() {
    if (inactive !== true) {
        if (currentMarkers !== null) {
            for (var i = 0; i < (currentMarkers.length - 1); i++) {
                currentMarkers[i].content.remove();
            }
        }
        getJSON(serverUrl,
            function (err, data) {
                if (err !== null) {
                    alert('Something went wrong: ' + err);
                } else {
                    data.forEach(function (aircraft) {

                        // create a HTML element for each feature
                        var icon = document.createElement('div');
                        icon.className = 'marker';

                        // make a marker for each feature and add to the map
                        let newMarker = new mapboxgl.Marker(icon)
                            .setLngLat([aircraft.Longitude, aircraft.Latitude])
                            .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                                .setHTML('<h5> Callsign: ' + aircraft.CallSign + '</h5><h5> Display Name: ' + aircraft.DisplayName + '</h5><h5> Speed: ' + Math.round(aircraft.Speed) + '</h5><h5> Altitude: ' + Math.round(aircraft.Altitude) + '</h5><h5> Vertical Speed: ' + Math.round(aircraft.VerticalSpeed) + '</h5><h5> Track: ' + Math.round(aircraft.Track) + '</h5>'))
                            .addTo(map);

                        currentMarkers.push(
                            {
                                id: aircraft.FlightID,
                                content: newMarker
                            })
                    })
                }
            })
    }
}

setInterval(loadAircraft, 30000)
loadAircraft()