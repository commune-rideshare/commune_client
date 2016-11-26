'use strict'

window.jQuery = global.$ = require('jquery')

// var mapboxgl = require('mapbox-gl')
require('mapbox.js')
var Vue = require('vue')
var Chart = require('chart.js')
// var howler = require('howler')
// var moment = require('moment')
// var ping = new Howl({urls: ['snd/ping.mp3']})
var socket = require('socket.io-client')('http://127.0.0.1:8080')

const config = require('./config')

$(function () {

  // Initialize Vue components

  var driverBox = new Vue({
    el: '#drivers',
    data: {
      driver: {name: '', rides: 0, shares: 0, percentage: 0, guid: ''},
      drivers: []
    },
    methods: {
      counter: function () {
        return this.drivers.length
     }
   }
  })

  var passengerBox = new Vue({
    el: '#passengers',
    data: {
      passenger: {name: '', rides: 0, shares: 0, percentage: 0, guid: ''},
      passengers: []
    }, methods: {
      counter: function () {
        return this.passengers.length
     }
   }
  })

  var ridesBox = new Vue({
    el: '#rides',
    data: {
      ride: {guid: '', distance: 0, shares: 0},
      rides: []
    }, methods: {
      counter: function () {
        return this.rides.length
     }
   }
  })

  var stats = new Vue({
    el: '#stats',
    data: {
      state: {}
    }
  })

  var ctx = $("#ownershipChart")
  var ownershipChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ["Drivers", "Passengers", "Investors"],
      datasets: [{
          data: [12, 19, 3,],
          backgroundColor: [
              '#FDAFD1',
              '#FEDC58',
              '#fff'
          ],
          borderWidth: 0
      }]
    },
    options: {
      legend: {
        display: false,
      }
    }
})


  // Initialize mapbox

  L.mapbox.accessToken = config.key
  var map = L.mapbox.map('map', 'mapbox.light', {})
  var markerGroup = L.layerGroup().addTo(map)


  // Socket event listeners

  socket.on('initMap', function (data) {
    console.log('initMap', data)
    // markerGroup.clearLayers()
    map.setView([data.center[1], data.center[0]], data.zoom)
  })

  socket.on('setState', function (data) {
    driverBox.drivers = data.drivers
    passengerBox.passengers = data.riders
    ridesBox.rides = data.rides
    console.log('setState', data)
  })

  socket.on('updateRides', function (data) {
    ridesBox.rides = data
    console.log('updateRides', data)
  })

  socket.on('updateDrivers', function (data) {
    driverBox.drivers = data
    console.log('updateRides', data)
  })

  socket.on('updatePassengers', function (data) {
    passengerBox.passengers = data
    console.log('updatePassengers', data)
  })

  socket.on('updateStats', function (data) {
    stats.state = data
    console.log(ownershipChart)
    ownershipChart.data.datasets[0].data[0] = data.driverShares
    ownershipChart.data.datasets[0].data[1] = data.passengerShares
    ownershipChart.data.datasets[0].data[2] = data.investorShares
    ownershipChart.update()
    console.log('updateStats', data)
  })

  socket.on('addDriver', function (data) {

    var newLayer = L.mapbox.featureLayer().addTo(markerGroup)

    console.log('addDriver', data)
    console.log(data.guid)
    data.location.point.properties = {
      icon: {
        className: 'map-marker driver-marker ' + data.guid, // class name to style
        iconSize: null // size of icon, use null to set the size in CSS
      }
    }
    console.log(data.location.point)

    newLayer.on('layeradd', function(e) {
      var marker = e.layer,
      feature = marker.feature;
      marker.setIcon(L.divIcon(feature.properties.icon))
    });

    newLayer.setGeoJSON(data.location.point)

  })

  socket.on('addPassenger', function (data) {

    var newLayer = L.mapbox.featureLayer().addTo(markerGroup)

    console.log('addPassenger', data)
    console.log(data.location.point)
    data.location.point.properties = {
      icon: {
        className: 'map-marker passenger-marker ' + data.guid, // class name to style
        iconSize: null // size of icon, use null to set the size in CSS
      }
    }
    console.log(data.location.point)

    newLayer.on('layeradd', function(e) {
      var marker = e.layer,
      feature = marker.feature;
      marker.setIcon(L.divIcon(feature.properties.icon))
    });

    newLayer.setGeoJSON(data.location.point)

  })

  socket.on('requestRide', function (data) {
    console.log('requestRide', data.guid)
    $('.' + data.guid).addClass('active')
  })

  socket.on('acceptRide', function (data) {
    console.log('acceptRide', data)
    $('.' + data.guid).addClass('en-route')
  })

  socket.on('pickUp', function (data) {

    // Add this generated geojson object to the map.
    L.geoJson(data.route.geometry).addTo(map);

    // Create a counter with a value of 0.
    var j = 0;

    // Create a marker and add it to the map.
    var marker = L.marker([0, 0], {
      icon: L.mapbox.marker.icon({
        'marker-color': '#f86767'
      })
    }).addTo(map);

    tick();
    function tick() {
        // Set the marker to be at the same point as one
        // of the segments or the line.
        marker.setLatLng(L.latLng(
            data.route.geometry.coordinates[j][1],
            data.route.geometry.coordinates[j][0]));

        // Move to the next point of the line
        // until `j` reaches the length of the array.
        if (++j < data.route.geometry.coordinates.length) setTimeout(tick, 100);
    }

    console.log('pickUp', data)

  })

  socket.on('dropOff', function (data) {
    console.log('dropOff', data)
  })

})
