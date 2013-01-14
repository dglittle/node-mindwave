
require('fibers')
var _ = require('underscore')
require('./nodeutil')
var fs = require('fs')
var net = require('net')

_.run(function () {
	eval(_.wget('https://raw.github.com/dglittle/myutil/master/myutil2.js'))

	var s = new net.Socket()
	s.connect(13854)

	var ready = false
	var data = null
	s.on('data', function (d) {
		d = "" + d

		if (d[0] != '{') {
			s.write(_.json({
				enableRawOutput : true,
				format : "Json"
			}) + "\n")
		}

		var m = d.match(/"poorSignalLevel":(\d+)/)
		if (!ready) {
			if (m) {
				var strength = _.lerp(0, 100, 200, 0, 1 * m[1])
				console.log("signal strength: " + strength)
			}
		} else if (data && d.match(/^\{/)) {
			if (m) {
				var strength = _.lerp(0, 100, 200, 0, 1 * m[1])
				if (strength < 99) {
					console.log("signal strength: " + strength)
				}
				if (strength < 75) {
					console.log("signal faded - bad recording")
					process.exit(1)
				}
			}

			data.push(_.json({ time : _.time() }) + "\n")
			data.push(d)
		}
	})

	console.log("press enter to start recording for 1 minute (wait until signal strength is good)")
	var stdin = process.openStdin();
	stdin.on('data', function(chunk) {
		ready = true
		data = []
		console.log("recording...")
		var count = 0
		setInterval(function () {
			count++
			console.log("seconds so far: " + count)
		}, 1000)
		setTimeout(function () {
			console.log("writing file")
			fs.writeFileSync('./recordings/time_' + _.time() + '.txt', data.join(''))
			process.exit(1);
		}, 60 * 1000)
	});
})
