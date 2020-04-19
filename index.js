window.inactive = false
window.currentMarkers = [];
window.serverUrl = "https://Infinite-Radar-Backend.sabena32if.repl.co/?sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
window.flightPlanUrl = "https://Infinite-Radar-Backend.sabena32if.repl.co/flightPlans.php?sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
window.flightIdPath = "";
window.addedCoords = [];
window.navJSON = []

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


function distanceLatLong(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 0.8684
        return dist;
    }
}

function distanceBetweenWaypoints(waypoints, startingWaypoint) {
    let distance = 0;

    for (var i = 0; i < waypoints.length - 1; i = i + 1) {
        if (i == 0) {
            if (typeof startingWaypoint !== "undefined") {
                var waypoint1 = startingWaypoint
            } else {
                var waypoint1 = navJSON.find(o => o.name === waypoints[i]);
            }
        } else {
            var waypoint1 = findNearestWaypoint(waypoint1, waypoints[i])
        }
        let waypoint2 = findNearestWaypoint(waypoint1, waypoints[i + 1])
        distance = distance + (distanceLatLong(waypoint1["latitude"], waypoint1["longitude"], waypoint2["latitude"], waypoint2["longitude"]))
    }
    return distance;
}

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " hour(s) and " + rminutes + " minute(s).";
}

function getRemainingFlight(waypoints) {
    getJSON("https://infinite-radar-backend.sabena32if.repl.co/flightDetails.php?flightid=" + window.flightIdPath, function (err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            let distance = 0;
            for (var i = 0; i < data.length - 1; i++) {
                distance = distance + distanceLatLong(data[i].Latitude, data[i].Longitude, data[i + 1].Latitude, data[i + 1].Longitude)
            }
            let remainingDistance = Math.round(distanceBetweenWaypoints(waypoints) - distance)
            if (remainingDistance > 0) {
                document.getElementById('remaining-distance').innerText = remainingDistance + "nm"
                getJSON(serverUrl,
                    function (err, data) {
                        if (err !== null) {
                            alert('Something went wrong: ' + err);
                        } else {
                            data.forEach(function (flight) {
                                if (flight.FlightID == window.flightIdPath) {
                                    document.getElementById('remaining-time').innerText = timeConvert((remainingDistance / flight.Speed) * 60)
                                }
                            })
                        }
                    })
            } else {
                document.getElementById('remaining-distance').innerText = "N/A"
                document.getElementById('remaining-time').innerText = "N/A"
            }
        }
    })
}

function createNavData() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "https://raw.githubusercontent.com/InfiniteFlightAirportEditing/Navigation/master/dat/navigation.dat", false);
    xmlHttp.send(null);
    let responseArray = (xmlHttp.responseText).split(/\r?\n/)
    delete responseArray[0];
    delete responseArray[1];
    delete responseArray[2];
    responseArray.forEach((navPoint) => {
        navPoint = navPoint.split(" ")
        navJSON.push({
            "name": navPoint[8].toString(),
            "latitude": navPoint[1].toString(),
            "longitude": navPoint[2].toString()
        })
        navJSON.push({
            "name": navPoint[7].toString(),
            "latitude": navPoint[1].toString(),
            "longitude": navPoint[2].toString()
        })
    })
    getJSON("https://raw.githubusercontent.com/InfiniteFlightAirportEditing/Navigation/master/Fixes.json", function (err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            data.forEach((navPoint) => {
                navJSON.push({
                    "name": navPoint["Name"].toString(),
                    "latitude": navPoint["Latitude"].toString(),
                    "longitude": navPoint["Longitude"].toString()
                })
            })
        }
    })
    getJSON("https://raw.githubusercontent.com/InfiniteFlightAirportEditing/Navigation/master/VOR.json", function (err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            data.forEach((navPoint) => {
                navJSON.push({
                    "name": navPoint["identifier"].toString(),
                    "latitude": navPoint["latitude"].toString(),
                    "longitude": navPoint["longitude"].toString()
                })
            })
        }
    })
    getJSON("https://raw.githubusercontent.com/InfiniteFlightAirportEditing/Navigation/master/Glideslope.json", function (err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            data.forEach((navPoint) => {
                navJSON.push({
                    "name": navPoint["airportICAO"].toString(),
                    "latitude": navPoint["latitude"].toString(),
                    "longitude": navPoint["longitude"].toString()
                })
            })
        }
    })
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

if (document.getElementById('speed-altitude-graph-menu-item').style.display !== "none") {
    document.getElementById('speed-altitude-graph-menu-item').addEventListener('click', () => {
        if (typeof window.flightIdPath !== "undefined")
            getChartData(window.flightIdPath)
    })
}

function changeServer(server) {
    if (document.getElementById('flight-info-panel').style.display !== "none") {
        closeInfo()
    }
    window.flightIdPath = "";
    if (map.getLayer('aircraftPath')) map.removeLayer('aircraftPath');
    if (map.getSource('aircraftPath')) map.removeSource('aircraftPath');
    if (map.getLayer('aircraftFpl')) map.removeLayer('aircraftFpl');
    if (map.getSource('aircraftFpl')) map.removeSource('aircraftFpl');
    if (server == "casual") {
        document.getElementById('flight-info-data-menu-item').click()
        document.getElementById('speed-altitude-graph-menu-item').style.display = "none";
        serverUrl = "https://Infinite-Radar-Backend.sabena32if.repl.co/?sessionid=5f3fdc11-35b8-4268-832f-42f1c6539ab9"
        flightPlanUrl = "https://Infinite-Radar-Backend.sabena32if.repl.co/flightPlans.php?sessionid=5f3fdc11-35b8-4268-832f-42f1c6539ab9"
    } else if (server == "training") {
        document.getElementById('speed-altitude-graph-menu-item').style.display = "block";
        serverUrl = "https://Infinite-Radar-Backend.sabena32if.repl.co/?sessionid=6a04ffe8-765a-4925-af26-d88029eeadba"
        flightPlanUrl = "https://Infinite-Radar-Backend.sabena32if.repl.co/flightPlans.php?sessionid=6a04ffe8-765a-4925-af26-d88029eeadba"
    } else {
        document.getElementById('speed-altitude-graph-menu-item').style.display = "block";
        serverUrl = "https://Infinite-Radar-Backend.sabena32if.repl.co/?sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
        flightPlanUrl = "https://Infinite-Radar-Backend.sabena32if.repl.co/flightPlans.php?sessionid=7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856"
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
                        document.getElementById('flight-plan').style.width = document.getElementById('flight-info-panel').offsetWidth + 'px'
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
                            let distanceWaypoints = []
                            for (var i = 1; i < fpl.waypoints.length; i++) {
                                if (typeof navJSON.find(wpt => wpt.name === fpl.waypoints[i]) !== "undefined") {
                                    distanceWaypoints.push(fpl.waypoints[i])
                                }
                            }
                            let coordinatesFpl = []
                            for (var i = 0; i < distanceWaypoints.length; i++) {
                                if (typeof navJSON.find(wpt => wpt.name === distanceWaypoints[i]) !== "undefined") {
                                    if (i == 0) {
                                        var previousWaypoint = navJSON.find(wpt => wpt.name === distanceWaypoints[i])
                                        coordinatesFpl.push([navJSON.find(wpt => wpt.name === distanceWaypoints[i]).longitude, navJSON.find(wpt => wpt.name === distanceWaypoints[i]).latitude])
                                    } else {
                                        var previousWaypoint = findNearestWaypoint(previousWaypoint, distanceWaypoints[i])
                                        coordinatesFpl.push([findNearestWaypoint(previousWaypoint, distanceWaypoints[i]).longitude, findNearestWaypoint(previousWaypoint, distanceWaypoints[i]).latitude])
                                    }
                                }
                            }
                            drawAircraftFpl(coordinatesFpl)
                            document.getElementById('total-distance').innerText = Math.round(distanceBetweenWaypoints(distanceWaypoints)) + "nm"
                            getRemainingFlight(distanceWaypoints)
                        }
                    }
                })
            }
        })
}

function findNearestWaypoint(pastWaypoint, name) {
    let matchingWaypoints = navJSON.filter(wpt => wpt.name == name);
    let closestWaypointDist = Infinity;
    let closestWaypoint = {}
    for (var i = 0; i < matchingWaypoints.length; i++) {
        if (distanceLatLong(pastWaypoint["latitude"], pastWaypoint["longitude"], matchingWaypoints[i]["latitude"], matchingWaypoints[i]["longitude"]) < closestWaypointDist) {
            closestWaypointDist = distanceLatLong(pastWaypoint.latitude, pastWaypoint.longitude, matchingWaypoints[i].latitude, matchingWaypoints[i].longitude);
            closestWaypoint = matchingWaypoints[i]
        }
    }
    return closestWaypoint
}

function findNearestWaypointToLatLng(lat, long, name) {
    let matchingWaypoints = navJSON.filter(wpt => wpt.name == name);
    let closestWaypointDist = Infinity;
    let closestWaypoint = {}
    for (var i = 0; i < matchingWaypoints.length; i++) {
        if (distanceLatLong(lat, long, matchingWaypoints[i]["latitude"], matchingWaypoints[i]["longitude"]) < closestWaypointDist) {
            closestWaypointDist = distanceLatLong(lat, long, matchingWaypoints[i].latitude, matchingWaypoints[i].longitude);
            closestWaypoint = matchingWaypoints[i]
        }
    }
    return closestWaypoint
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

                            currentMarkers[i].content.setRotation(heading - 45);
                        }
                    }
                    data.forEach(function (aircraft) {
                        if (typeof window.focusedAircraft !== "undefined" && window.focusedAircraft == aircraft.FlightID) {
                            focusAircraft(aircraft)
                        }
                        if (document.getElementById('flight-info-panel').style.display !== "none") {
                            if (aircraft.FlightID == window.flightIdPath && document.getElementById('flight-info-panel').style.display !== "none") {
                                if (typeof aircraftList.find(object => object.AircraftId === aircraft.AircraftID) !== "undefined") {
                                    var aircraftName = aircraftList.find(object => object.AircraftId === aircraft.AircraftID).AircraftName
                                } else {
                                    var aircraftName = "Unknown"
                                }
                                if (typeof aircraftList.find(object => object.LiveryId === aircraft.LiveryID) !== "undefined") {
                                    var aircraftLivery = aircraftList.find(object => object.LiveryId === aircraft.LiveryID).LiveryName
                                } else {
                                    var aircraftLivery = "Unknown"
                                }
                                populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                                if (typeof window.focusedAircraft !== "undefined" && window.focusedAircraft == aircraft.FlightID) {
                                    focusAircraft(aircraft)
                                }
                            }
                        }
                    })
                }
            })
    }
}

function updateGraph() {
    if (typeof window.flightIdPath !== "undefined" && inactive !== true) {
        getChartData(window.flightIdPath)
    }
}

function updateFpl() {
    if (typeof window.flightIdPath !== "undefined" && inactive !== true) {
        getFlightPlan();
    }
}

function toggleFocus(flight) {
    if (typeof window.focusedAircraft !== "undefined") {
        unfocusAircraft()
    } else {
        focusAircraft(flight)
    }
}

function focusAircraft(aircraft) {
    window.focusedAircraft = aircraft.FlightID;
    map.flyTo({
        center: [
            aircraft.Longitude,
            aircraft.Latitude
        ],
        essential: true
    });
    map["dragPan"].disable();
    map["keyboard"].disable();
}

function unfocusAircraft() {
    map["dragPan"].enable();
    map["keyboard"].enable();
    delete window.focusedAircraft;
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


                        if (map.getLayer('aircraftPath')) map.removeLayer('aircraftPath');
                        if (map.getSource('aircraftPath')) map.removeSource('aircraftPath');
                        if (map.getLayer('aircraftFpl')) map.removeLayer('aircraftFpl');
                        if (map.getSource('aircraftFpl')) map.removeSource('aircraftFpl');
                        window.flightIdPath = ""

                        if (typeof window.focusedAircraft !== "undefined") {
                            focusAircraft(aircraft)
                        }
                        if (typeof aircraftList.find(object => object.AircraftId === aircraft.AircraftID) !== "undefined") {
                            var aircraftName = aircraftList.find(object => object.AircraftId === aircraft.AircraftID).AircraftName
                        } else {
                            var aircraftName = "Unknown"
                        }
                        if (typeof aircraftList.find(object => object.LiveryId === aircraft.LiveryID) !== "undefined") {
                            var aircraftLivery = aircraftList.find(object => object.LiveryId === aircraft.LiveryID).LiveryName
                        } else {
                            var aircraftLivery = "Unknown"
                        }

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
                                document.getElementById('total-distance').innerText = "Loading..."
                                document.getElementById('remaining-distance').innerText = "Loading..."
                                document.getElementById('remaining-time').innerText = "Loading..."
                                populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                                getUserDetails(aircraft.UserID)
                                getChartData(window.flightIdPath)
                                getFlightPlan();
                                document.getElementById('focus-aircraft').onclick = function () {
                                    toggleFocus(aircraft)
                                }
                            })
                        } else {
                            loadAircraftPath()
                            document.getElementById('flight-info-panel').className = "flight-info-desktop"
                            document.getElementById('waypoints').innerHTML = "<h5>Loading...</h5>"
                            document.getElementById('departure').innerText = "Loading..."
                            document.getElementById('arrival').innerText = "Loading..."
                            document.getElementById('total-distance').innerText = "Loading..."
                            document.getElementById('remaining-distance').innerText = "Loading..."
                            document.getElementById('remaining-time').innerText = "Loading..."
                            populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                            getUserDetails(aircraft.UserID)
                            window.flightIdPath = aircraft.FlightID
                            getChartData(window.flightIdPath)
                            getFlightPlan();
                            window.addedCoords = [];
                            document.getElementById('focus-aircraft').onclick = function () {
                                toggleFocus(aircraft)
                            }
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
                        // create a HTML element for each feature
                        var icon = document.createElement('div');
                        if (developerDisplayNames.includes(aircraft.DisplayName)) {
                            icon.className = 'marker-developer';
                        } else {
                            icon.className = 'marker';
                        }

                        icon.addEventListener('click', () => {
                            if (map.getLayer('aircraftPath')) map.removeLayer('aircraftPath');
                            if (map.getSource('aircraftPath')) map.removeSource('aircraftPath');
                            if (map.getLayer('aircraftFpl')) map.removeLayer('aircraftFpl');
                            if (map.getSource('aircraftFpl')) map.removeSource('aircraftFpl');
                            window.flightIdPath = ""

                            if (typeof aircraftList.find(object => object.AircraftId === aircraft.AircraftID) !== "undefined") {
                                var aircraftName = aircraftList.find(object => object.AircraftId === aircraft.AircraftID).AircraftName
                            } else {
                                var aircraftName = "Unknown"
                            }
                            if (typeof aircraftList.find(object => object.LiveryId === aircraft.LiveryID) !== "undefined") {
                                var aircraftLivery = aircraftList.find(object => object.LiveryId === aircraft.LiveryID).LiveryName
                            } else {
                                var aircraftLivery = "Unknown"
                            }
                            if (typeof window.focusedAircraft !== "undefined") {
                                focusAircraft(aircraft)
                            }
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
                                    populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                                    getUserDetails(aircraft.UserID)
                                    getChartData(window.flightIdPath)
                                    getFlightPlan();
                                    document.getElementById('focus-aircraft').onclick = function () {
                                        toggleFocus(aircraft)
                                    }
                                })
                            } else {
                                loadAircraftPath()
                                document.getElementById('flight-info-panel').className = "flight-info-desktop"
                                document.getElementById('waypoints').innerHTML = "<h5>Loading...</h5>"
                                document.getElementById('departure').innerText = "Loading..."
                                document.getElementById('arrival').innerText = "Loading..."
                                document.getElementById('total-distance').innerText = "Loading..."
                                document.getElementById('remaining-distance').innerText = "Loading..."
                                document.getElementById('remaining-time').innerText = "Loading..."
                                populateInfo(aircraft, aircraftName + ' (' + aircraftLivery + ')')
                                getUserDetails(aircraft.UserID)
                                window.flightIdPath = aircraft.FlightID
                                getChartData(window.flightIdPath)
                                getFlightPlan();
                                window.addedCoords = [];
                                document.getElementById('focus-aircraft').onclick = function () {
                                    toggleFocus(aircraft)
                                }
                            }
                        })

                        // make a marker for each feature and add to the map
                        let newMarker = new mapboxgl.Marker(icon)
                            .setLngLat([aircraft.Longitude, aircraft.Latitude])
                            .addTo(map);
                        newMarker.setRotation(aircraft.Heading - 45);
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
        getJSON("https://infinite-radar-backend.sabena32if.repl.co/flightDetails.php?flightid=" + window.flightIdPath, function (err, data) {
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
    getJSON("https://infinite-radar-user-details.sabena32if.repl.co/?userId=" + userId, function (err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            let userDetails = {
                "grade": data[0]["PilotStats"]["GradeName"],
                "onlineFlights": data[0]["OnlineFlights"],
                "flightTime": data[0]["PilotStats"]["TotalFlightTime"],
                "violations": data[0]["PilotStats"]["TotalViolations"],
                "landings": data[0]["PilotStats"]["TotalLandings"],
                "xp": data[0]["PilotStats"]["TotalXP"],
                "ghostings": data[0]["PilotStats"]["TotalATCGhostings"],
                "ATCOps": data[0]["ATCActions"]

            }
            document.getElementById('grade').innerText = userDetails["grade"]
            document.getElementById('onlineFlights').innerText = userDetails["onlineFlights"]
            document.getElementById('flightTime').innerText = userDetails["flightTime"]
            document.getElementById('violations').innerText = userDetails["violations"]
            document.getElementById('landings').innerText = userDetails["landings"]
            document.getElementById('xp').innerText = userDetails["xp"]
            document.getElementById('ghostings').innerText = userDetails["ghostings"]
            document.getElementById('ATCOps').innerText = userDetails["ATCOps"]

        }
    })
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

function drawAircraftFpl(coords) {
    if (map.getLayer('aircraftFpl')) map.removeLayer('aircraftFpl');
    if (map.getSource('aircraftFpl')) map.removeSource('aircraftFpl');
    map.addSource('aircraftFpl', {
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
        'id': 'aircraftFpl',
        'type': 'line',
        'source': 'aircraftFpl',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'blue',
            'line-width': 1
        }
    });
}

setInterval(updateAircraft, 10000)
setInterval(updateGraph, 60000)
setInterval(loadAircraftPath, 11000)
setInterval(updateFpl, 30000)
loadAircraft()
createNavData()