window.inactive = false
window.currentMarkers = [];
window.serverUrl = "http://infinite-flight-public-api.cloudapp.net/v1/Flights.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
window.flightPlanUrl = "http://infinite-flight-public-api.cloudapp.net/v1/GetFlightPlans.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
window.flightIdPath = "";
window.flightPlan = {};
window.addedCoords = [];

let developerDisplayNames = ["IFC - Qantas094", "IFYT HymenopusC", "IPP IFSims", "IFC - Ondrejj", "IPP TSATC Sashaz55"]

function closeInfo() {
    document.getElementById('flight-info-panel').style.display = "none";
}

function populateInfo(info, aircraft, fpl) {
    document.getElementById('flight-info-panel').style.display = "block";
    document.getElementById('callsign').innerText = info.CallSign
    document.getElementById('displayName').innerText = info.DisplayName
    document.getElementById('speed').innerText = Math.round(info.Speed)
    document.getElementById('altitude').innerText = Math.round(info.Altitude)
    document.getElementById('verticalspeed').innerText = Math.round(info.VerticalSpeed)
    document.getElementById('heading').innerText = Math.round(info.Heading)
    document.getElementById('aircraft').innerText = aircraft
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
    document.getElementById('flight-plan').style.width = document.getElementById('flight-info-panel').offsetWidth + 'px'
    document.getElementById('speed-altitude-graph').style.width = document.getElementById('flight-info-panel').offsetWidth + 'px'
    window.flightPlan = {};
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
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    zoom: '1',
    antialias: true,
});
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

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

function getFlightPlan(flightId) {
    getJSON(flightPlanUrl,
        function (err, data) {
            if (err !== null) {
                alert('Something went wrong: ' + err);
            } else {
                data.forEach(function (flightPlan) {
                    if (flightPlan.FlightID == flightId) {
                        window.flightPlan = {
                            "departure": flightPlan.Waypoints[1],
                            "arrival": flightPlan.DestinationAirportCode,
                            "waypoints": flightPlan.Waypoints
                        };
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

                            let lat = data.find(item => item.FlightID === currentMarkers[i].id).Latitude;
                            let long = data.find(item => item.FlightID === currentMarkers[i].id).Longitude;

                            if (window.flightIdPath !== [] && window.flightIdPath == currentMarkers[i].id) {
                                window.addedCoords = [long, lat]
                            }
                            currentMarkers[i].content
                                .setLngLat([long, lat])
                        }
                    }
                    if (document.getElementById('flight-info-panel').style.display !== "none") {
                        data.forEach(function (aircraft) {
                            if (aircraft.FlightID == window.flightIdPath) {
                                let aircraftName = aircraftList.find(object => object.AircraftId === aircraft.AircraftID).AircraftName
                                let aircraftLivery = aircraftList.find(object => object.LiveryId === aircraft.LiveryID).LiveryName
                                getFlightPlan(window.flightIdPath);
                                populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')', window.flightPlan)
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
                            getFlightPlan(aircraft.FlightID);
                            populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')', window.flightPlan)
                            window.flightIdPath = aircraft.FlightID
                            getChartData(window.flightIdPath)
                            window.addedCoords = [];
                            loadAircraftPath()
                            document.getElementById('waypoints').innerHTML = "<h5>Loading...</h5>"
                            document.getElementById('departure').innerText = "Loading..."
                            document.getElementById('arrival').innerText = "Loading..."
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
