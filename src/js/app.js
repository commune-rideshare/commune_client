'use strict'

window.jQuery = global.$ = require('jquery')

// var mapboxgl = require('mapbox-gl')
require('mapbox.js')
var Vue = require('vue')
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
      drivers: []}
  })

  var riderBox = new Vue({
    el: '#riders',
    data: {
      rider: {name: '', rides: 0, shares: 0, percentage: 0, guid: ''},
      riders: []}
  })

  var ridesBox = new Vue({
    el: '#rides',
    data: {
      ride: {guid: '', distance: 0, shares: 0},
      rides: []}
  })

  // Initialize mapbox

  L.mapbox.accessToken = config.key
  var map = L.mapbox.map('map', 'mapbox.light', {})

  // Socket event listeners

  socket.on('initMap', function (data) {
    console.log('initMap', data)
    map.setView([data.center[1], data.center[0]], data.zoom)
  })

  socket.on('setState', function (data) {
    driverBox.drivers = data.drivers
    riderBox.riders = data.riders
    ridesBox.rides = data.rides
    console.log('setState', data)
  })

  socket.on('addAgent', function (data) {
    console.log('addAgent', data)
  })

  socket.on('moveAgent', function (data) {
    console.log('moveAgen', data)
  })

  socket.on('requestRide', function (data) {
    console.log('requestRide', data)
  })

  socket.on('acceptRide', function (data) {
    console.log('acceptRide', data)
  })

  socket.on('pickUp', function (data) {
    console.log('pickUp', data)
  })

  socket.on('dropOff', function (data) {
    console.log('dropOff', data)
  })

})
