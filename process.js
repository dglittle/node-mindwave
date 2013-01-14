
require('fibers')
var _ = require('underscore')
require('./nodeutil')
var fs = require('fs')
var net = require('net')

_.run(function () {
	eval(_.wget('https://raw.github.com/dglittle/myutil/master/myutil2.js'))

	var template = "" + fs.readFileSync('./display_template.html')
	var data = []
	var files = fs.readdirSync('./recordings')
	files = _.sortBy(_.filter(files, function (f) { return f.match(/^time_/) }), function (f) { return 1 * f.match(/\d+/)[0] })
	_.each(files, function (f) {
		var s = "" + fs.readFileSync('./recordings/' + f)
		var t = null
		var note = null
		var startTime = null
		var amSamples = []
		var eegPowerMeans = {}
		_.each(_.lines(s), function (line) {
			try {
				var j = _.unJson(line)
				if (j.note) {
					note = j.note
				} else if (j.time) {
					if (amSamples.length == 0) startTime = j.time
					t = j.time - startTime
				} else if (j.eSense) {
					amSamples.push([t, j.eSense.attention, j.eSense.meditation])
					_.each(j.eegPower, function (v, k) {
						eegPowerMeans[k] = _.ensure(eegPowerMeans, k, 0) + j.eegPower[k]
					})
				}
			} catch (e) {
				if (line.match(/\S/)) {
					console.log("couldn't parse: " + line)
				}
			}
		})
		_.each(eegPowerMeans, function (v, k) {
			eegPowerMeans[k] /= amSamples.length
		})
		data.push({
			note : note,
			time : startTime,
			amSamples : amSamples,
			eegPowerMeans : eegPowerMeans
		})
	})
	template = template.replace(/\/\/ XXX-SET-DATA-XXX/, 'var data = ' + _.json(data, true))
	fs.writeFileSync('./display_generated.html', template)
})
