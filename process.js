
require('fibers')
var _ = require('underscore')
require('./nodeutil')
var fs = require('fs')
var net = require('net')

_.run(function () {
	eval(_.wget('https://raw.github.com/dglittle/myutil/master/myutil2.js'))

	var samples = _.unJson(fs.readFileSync('./output.txt'))

	var os = []
	_.each(samples, function (s) {
		if (s.json.match(/eSense/)) {
			var o = {
				time : s.time
			}
			s.json.replace(/"(\w+)":(\d+)[,|\}]/g, function (_0, key, val) {
				o[key] = val
			})
			os.push(o)
		}
	})

	fs.writeFileSync('./output2.txt', _.json(os, true))

	function extractFeature(os, feature) {
		var startTime = os[0].time
		fs.writeFileSync('./' + feature + '.txt', _.map(_.filter(os, function (o) {
			return o[feature]
		}), function (o) {
			return (o.time - startTime) / 1000 + '\t' + o[feature]
		}).join('\n'))
	}
	extractFeature(os, 'attention')
	extractFeature(os, 'meditation')
})
