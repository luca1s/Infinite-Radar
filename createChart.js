function fileTimeToDate(fileTime) {
    return new Date(fileTime / 10000 - 11644473600000);
}


let getChartData = function (flightId) {
    getJSON("http://infinite-flight-public-api.cloudapp.net/v1/FlightDetails.aspx?apikey=35f43e73-c592-4ed6-8849-0965db7e2df7&flightid=" + flightId, function (err, data) {
        if (err !== null) {
            alert('Something went wrong: ' + err);
        } else {
            if (typeof window.chart !== "undefined") {
                window.chart.destroy()
            }
            let altitude = [];
            let speed = [];
            let labels = []
            data.forEach(function (value) {
                labels.push(fileTimeToDate(value.Time).toLocaleTimeString())
                altitude.push(value.Altitude)
                speed.push(value.Speed)
            })
            document.getElementById('speed-altitude-graph').style.width = document.getElementById('flight-info-panel').offsetWidth + 'px'
            createChart(altitude, speed, labels)
        }
    })
}

let createChart = function (altitude, speed, timestamps) {
    var ctx = document.getElementById('canvas').getContext('2d');
    window.chart = Chart.Line(ctx, {
        data: {
            labels: timestamps,
            datasets: [{
                label: 'Speed',
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgb(255, 99, 132)',
                fill: false,
                data: speed,
                yAxisID: 'speed',
            }, {
                label: 'Altitude',
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgb(54, 162, 235)',
                fill: false,
                data: altitude,
                yAxisID: 'altitude'
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    id: 'speed',
                }, {
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'right',
                    id: 'altitude',
                }],
                xAxes: [{
                    display: false //this will remove only the label
                }]
            }
        }
    });
};
