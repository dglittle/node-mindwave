
require('fibers')
var _ = require('underscore')
require('./nodeutil')
var fs = require('fs')
var net = require('net')

_.run(function () {
	eval(_.wget('https://raw.github.com/dglittle/myutil/master/myutil2.js'))

	var samples = []

	var s = new net.Socket()
	s.connect(13854)
	s.on('connect', function (e, d) {
		console.log("got: " + e + " " + d)
	})
	s.on('data', function (d) {
		samples.push({
			time : _.time(),
			json : "" + d
		})
	})
	var startTime = _.time()
	setInterval(function () {
		console.log("time till end: " + (60 - (_.time() - startTime) / 1000))
	}, 1000)
	setTimeout(function () {
		fs.writeFileSync('output.txt', _.json(samples))
		console.log("done!!!!!!!!!!")
	}, 60 * 1000)
})
