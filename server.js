
require('fibers')
var _ = require('underscore')
require('./nodeutil')
var fs = require('fs')
var net = require('net')

_.run(function () {
	eval(_.wget('https://raw.github.com/dglittle/myutil/master/myutil2.js'))

	var app = require('express')()
	var server = require('http').createServer(app)
	var io = require('socket.io').listen(server)
	io.set('log level', 1)

	server.listen(3000)

	app.get('/', function (req, res) {
		res.sendfile('./server.html')
	});

	var onData = function (d) {
		console.log(d)
	}

	io.sockets.on('connection', function (socket) {
		onData = function (d) {
			socket.emit('msg', d)
		}
	})

	var s = new net.Socket()
	s.connect(13854)
	var goodSignal = false
	s.on('data', function (d) {
		d = "" + d

		if (d[0] != '{') {
			s.write(_.json({
				enableRawOutput : true,
				format : "Json"
			}) + "\n")
			return
		}

		var m = d.match(/"poorSignalLevel":(\d+)/)
		if (m) {
			var signal = parseInt(m[1])
			if (signal == 0) goodSignal = true
			if (signal > 50) goodSignal = false
		}
		if (!goodSignal) return

		onData(d)
	})
})
