/* vim: set sts=8 ts=8 sw=8 noet: */

var mod_assert = require('assert-plus');

var lib_common = require('./common');

function
mdata_list(callback)
{
	mod_assert.func(callback, 'callback');

	lib_common.run_command({
		command: lib_common.root_runner(),
		args: [
			'/usr/sbin/mdata-list'
		]
	}, function (err, stdout) {
		if (err) {
			callback(err);
			return;
		}

		var out = [];

		var keys = stdout.trim().split('\n');
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i].trim();
			if (k)
				out.push(k);
		}

		out.sort();

		callback(null, out);
	});
}

module.exports = mdata_list;
