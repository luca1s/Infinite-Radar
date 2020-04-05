window.inactive = false
window.currentMarkers = [];
window.serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
window.flightPlanUrl = "http://infinite-flight-public-api.cloudapp.net/v1/GetFlightPlans.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
window.flightIdPath = "";
window.addedCoords = [];


window.addEventListener("orientationchange", function () {
    if (isMobile.any() && document.getElementById('flight-info-panel').style.display !== "none") {
        document.getElementById('flight-info-panel').style.width = "100%";
        document.getElementById('flight-info-panel').style.height = "100%";
    } else if (isMobile.any() && document.getElementById('small-flight-info-mobile').style.display !== "none") {
        document.getElementById('small-flight-info-mobile').style.width = "100%";
    }
});


document.getElementById('search-results').addEventListener('focusout', () => {
    document.getElementById('search-results').style.display = "none";
})

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

if (isMobile.any()) {
    document.getElementById('switch-map-style').className = "switch-map-style-mobile"
} else {
    document.getElementById('switch-map-style').className = "switch-map-style-desktop"
}

let developerDisplayNames = ["IFC - Qantas094", "IFYT HymenopusC", "IPP IFSims", "IFC - Ondrejj", "IPP TSATC Sashaz55"]

function closeInfo() {
    if (isMobile.any()) {
        document.getElementById('switch-map-style').style.display = "block";
        document.getElementById('map').style.visibility = "visible"
        document.getElementById('switch-map-style').style.display = "block"
    }
    document.getElementById('flight-info-panel').style.display = "none";
}

var styleList = document.getElementById('switch-map-style');
var styleInputs = styleList.getElementsByTagName('input');

for (var i = 0; i < styleInputs.length; i++) {
    styleInputs[i].onclick = setStyle;
}

function setStyle(style) {
    var styleId = style.target.value;
    map.setStyle('mapbox://styles/mapbox/' + styleId);
}

function populateInfo(info, aircraft) {
    document.getElementById('flight-info-panel').style.display = "block";
    document.getElementById('callsign').innerText = info.CallSign
    document.getElementById('displayName').innerText = info.DisplayName
    document.getElementById('speed').innerText = Math.round(info.Speed)
    document.getElementById('altitude').innerText = Math.round(info.Altitude)
    document.getElementById('verticalspeed').innerText = Math.round(info.VerticalSpeed)
    document.getElementById('heading').innerText = Math.round(info.Heading)
    document.getElementById('aircraft').innerText = aircraft
    document.getElementById('flight-plan').style.width = document.getElementById('flight-info-panel').offsetWidth + 'px'
    document.getElementById('speed-altitude-graph').style.width = document.getElementById('flight-info-panel').offsetWidth + 'px'
}

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
    style: 'mapbox://styles/mapbox/streets-v11',
    zoom: '1',
    antialias: true,
});
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

document.getElementById('map').style.height = "100%"

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
    if (document.getElementById('flight-info-panel').style.display !== "none") {
        closeInfo()
    }
    window.flightIdPath = "";
    if (map.getLayer('aircraftPath')) map.removeLayer('aircraftPath');
    if (map.getSource('aircraftPath')) map.removeSource('aircraftPath');
    if (server == "casual") {
        document.getElementById('flight-info-data-menu-item').click()
        document.getElementById('speed-altitude-graph-menu-item').style.display = "none";
        serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=5f3fdc11-35b8-4268-832f-42f1c6539ab9"
        flightPlanUrl = "http://infinite-flight-public-api.cloudapp.net/v1/GetFlightPlans.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=5f3fdc11-35b8-4268-832f-42f1c6539ab9"
    } else if (server == "training") {
        document.getElementById('speed-altitude-graph-menu-item').style.display = "block";
        serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=6a04ffe8-765a-4925-af26-d88029eeadba"
        flightPlanUrl = "http://infinite-flight-public-api.cloudapp.net/v1/GetFlightPlans.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=6a04ffe8-765a-4925-af26-d88029eeadba"
    } else {
        document.getElementById('speed-altitude-graph-menu-item').style.display = "block";
        serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
        flightPlanUrl = "http://infinite-flight-public-api.cloudapp.net/v1/GetFlightPlans.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
    }
    loadAircraft()
}

function getFlightPlan() {
    getJSON(flightPlanUrl,
        function (err, data) {
            if (err !== null) {
                alert('Something went wrong: ' + err);
            } else {
                data.forEach(function (flightPlan) {
                    if (flightPlan.FlightID == window.flightIdPath) {
                        let fpl = {
                            "departure": flightPlan.Waypoints[1],
                            "arrival": flightPlan.DestinationAirportCode,
                            "waypoints": flightPlan.Waypoints
                        };
                        if (typeof fpl.departure !== "undefined" && typeof fpl.arrival !== "undefined" && typeof fpl.waypoints !== "undefined") {
                            document.getElementById('departure').innerText = fpl.departure
                            document.getElementById('arrival').innerText = fpl.arrival
                            document.getElementById('waypoints').innerHTML = ""
                            for (var i = 0; i < fpl.waypoints.length; i++) {
                                let waypointText = document.createElement('h5')
                                if (i !== 0) {
                                    if (i == 1) {
                                        waypointText.innerText = (fpl.waypoints[i] + ' (Departure)')
                                    } else if (i == fpl.waypoints.length - 1) {
                                        waypointText.innerText = (fpl.waypoints[i] + ' (Arrival)')
                                    } else {
                                        waypointText.innerText = (fpl.waypoints[i])
                                    }
                                }
                                document.getElementById('waypoints').appendChild(waypointText)
                            }
                        }
                    }
                })
            }
        })
}

function updateAircraft() {
    if (inactive !== true) {
        getJSON(serverUrl,
            function (err, data) {
                if (err !== null) {
                    alert('Something went wrong: ' + err);
                } else {
                    for (var i = 0; i < (currentMarkers.length - 1); i++) {
                        if (typeof data.find(item => item.FlightID === currentMarkers[i].id) !== undefined && data.find(item => item.FlightID === currentMarkers[i].id) !== undefined) {

                            let heading = data.find(item => item.FlightID === currentMarkers[i].id).Heading;
                            let lat = data.find(item => item.FlightID === currentMarkers[i].id).Latitude;
                            let long = data.find(item => item.FlightID === currentMarkers[i].id).Longitude;

                            if (window.flightIdPath !== [] && window.flightIdPath == currentMarkers[i].id) {
                                window.addedCoords = [long, lat]
                            }
                            currentMarkers[i].content
                                .setLngLat([long, lat])

                            currentMarkers[i].content.setRotation(heading - 90);
                        }
                    }
                    if (document.getElementById('flight-info-panel').style.display !== "none") {
                        data.forEach(function (aircraft) {
                            if (aircraft.FlightID == window.flightIdPath && document.getElementById('flight-info-panel').style.display !== "none") {
                                let aircraftName = aircraftList.find(object => object.AircraftId === aircraft.AircraftID).AircraftName
                                let aircraftLivery = aircraftList.find(object => object.LiveryId === aircraft.LiveryID).LiveryName
                                getFlightPlan();
                                populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                            }
                        })
                        if (typeof window.flightIdPath !== "undefined") {
                            getChartData(window.flightIdPath)
                        }
                    }
                }
            })
    }
}

function searchCallsign(callsign) {
    getJSON(serverUrl,
        function (err, data) {
            if (err !== null) {
                alert('Something went wrong: ' + err);
            } else {
                let results = [];
                for (var i = 0; i < data.length - 1; i++) {
                    if (data[i].CallSign.includes(callsign)) {
                        results.push(data[i])
                    }
                }
                document.getElementById('search-results').style.display = "block"
                document.getElementById('search-results').innerHTML = ""
                results.forEach((aircraft) => {
                    let br = document.createElement('br')
                    let button = document.createElement('button')
                    button.classList.add("mdl-button")
                    button.classList.add("mdl-js-button")
                    button.classList.add("mdl-js-ripple-effect")
                    button.classList.add("mdl-button--primary")
                    button.innerText = aircraft.CallSign
                    button.addEventListener('click', () => {
                        let aircraftName = aircraftList.find(object => object.AircraftId === aircraft.AircraftID).AircraftName
                        let aircraftLivery = aircraftList.find(object => object.LiveryId === aircraft.LiveryID).LiveryName

                        if (isMobile.any()) {
                            document.getElementById('switch-map-style').style.display = "none";
                            document.getElementById('small-flight-info-mobile').style.display = "block";
                            document.getElementById('callsign-and-display-name-mobile').innerText = aircraft.CallSign + " (" + aircraft.DisplayName + ")"
                            document.getElementById('mobile-aircraft-type').innerText = aircraftName + ' (' + aircraftLivery + ')'
                            window.flightIdPath = aircraft.FlightID
                            window.addedCoords = [];
                            loadAircraftPath()
                            document.getElementById('small-flight-info-mobile').addEventListener('click', () => {
                                document.getElementById('small-flight-info-mobile').style.display = "none";
                                document.getElementById('map').style.visibility = "none"
                                document.getElementById('switch-map-style').style.display = "none"
                                document.getElementById('flight-info-panel').className = "flight-info-mobile"
                                document.getElementById('waypoints').innerHTML = "<h5>Loading...</h5>"
                                document.getElementById('departure').innerText = "Loading..."
                                document.getElementById('arrival').innerText = "Loading..."
                                getFlightPlan();
                                populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                                getChartData(window.flightIdPath)
                            })
                        } else {
                            document.getElementById('flight-info-panel').className = "flight-info-desktop"
                            document.getElementById('waypoints').innerHTML = "<h5>Loading...</h5>"
                            document.getElementById('departure').innerText = "Loading..."
                            document.getElementById('arrival').innerText = "Loading..."
                            getFlightPlan();
                            populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                            window.flightIdPath = aircraft.FlightID
                            getChartData(window.flightIdPath)
                            window.addedCoords = [];
                            loadAircraftPath()
                        }
                        map.flyTo({
                            center: [
                                aircraft.Longitude,
                                aircraft.Latitude
                            ],
                            essential: true
                        });
                    })
                    document.getElementById('search-results').appendChild(button)
                    document.getElementById('search-results').appendChild(br)
                })

            }
        })
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
                        let aircraftName = aircraftList.find(object => object.AircraftId === aircraft.AircraftID).AircraftName
                        let aircraftLivery = aircraftList.find(object => object.LiveryId === aircraft.LiveryID).LiveryName
                        // create a HTML element for each feature
                        var icon = document.createElement('div');
                        if (developerDisplayNames.includes(aircraft.DisplayName)) {
                            icon.className = 'marker-developer';
                        } else {
                            icon.className = 'marker';
                        }

                        icon.addEventListener('click', () => {
                            if (isMobile.any()) {
                                document.getElementById('switch-map-style').style.display = "none";
                                document.getElementById('small-flight-info-mobile').style.display = "block";
                                document.getElementById('callsign-and-display-name-mobile').innerText = aircraft.CallSign + " (" + aircraft.DisplayName + ")"
                                document.getElementById('mobile-aircraft-type').innerText = aircraftName + ' (' + aircraftLivery + ')'
                                window.flightIdPath = aircraft.FlightID
                                window.addedCoords = [];
                                loadAircraftPath()
                                document.getElementById('small-flight-info-mobile').addEventListener('click', () => {
                                    document.getElementById('small-flight-info-mobile').style.display = "none";
                                    document.getElementById('map').style.visibility = "none"
                                    document.getElementById('switch-map-style').style.display = "none"
                                    document.getElementById('flight-info-panel').className = "flight-info-mobile"
                                    document.getElementById('waypoints').innerHTML = "<h5>Loading...</h5>"
                                    document.getElementById('departure').innerText = "Loading..."
                                    document.getElementById('arrival').innerText = "Loading..."
                                    getFlightPlan();
                                    populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                                    getChartData(window.flightIdPath)
                                })
                            } else {
                                document.getElementById('flight-info-panel').className = "flight-info-desktop"
                                document.getElementById('waypoints').innerHTML = "<h5>Loading...</h5>"
                                document.getElementById('departure').innerText = "Loading..."
                                document.getElementById('arrival').innerText = "Loading..."
                                getFlightPlan();
                                populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                                window.flightIdPath = aircraft.FlightID
                                getChartData(window.flightIdPath)
                                window.addedCoords = [];
                                loadAircraftPath()
                            }
                        })

                        // make a marker for each feature and add to the map
                        let newMarker = new mapboxgl.Marker(icon)
                            .setLngLat([aircraft.Longitude, aircraft.Latitude])
                            .addTo(map);
                        newMarker.setRotation(aircraft.Heading - 90);
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

function loadAircraftPath() {
    if (inactive !== true) {
        getJSON("http://infinite-flight-public-api.cloudapp.net/v1/FlightDetails.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&flightid=" + window.flightIdPath, function (err, data) {
            if (err !== null) {
                alert('Something went wrong: ' + err);
            } else {
                let coordinates = [];
                data.forEach((step) => {
                    coordinates.push([step.Longitude, step.Latitude])
                })
                coordinates.push(window.addedCoords)
                drawAircraftPath(coordinates)
            }
        })
    }

}

function getUserDetails(userId) {
    var data = JSON.stringify({ "UserIDs": [userId] });

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            return this.response;
        }
    });

    xhr.open("POST", "http://infinite-flight-public-api.cloudapp.net/v1/UserDetails.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data);
}

function drawAircraftPath(coords) {
    if (map.getLayer('aircraftPath')) map.removeLayer('aircraftPath');
    if (map.getSource('aircraftPath')) map.removeSource('aircraftPath');
    map.addSource('aircraftPath', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': coords
            }
        }
    });
    map.addLayer({
        'id': 'aircraftPath',
        'type': 'line',
        'source': 'aircraftPath',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'red',
            'line-width': 2
        }
    });
}


setInterval(updateAircraft, 10000)
setInterval(loadAircraftPath, 11000)
loadAircraft()
