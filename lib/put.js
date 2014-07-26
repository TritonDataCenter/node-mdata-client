/* vim: set sts=8 ts=8 sw=8 noet: */

var mod_assert = require('assert-plus');

var lib_common = require('./common');

function
mdata_put(key, value, callback)
{
	mod_assert.string(key, 'key');
	mod_assert.string(value, 'value');
	mod_assert.func(callback, 'callback');

	lib_common.run_command({
		command: lib_common.root_runner(),
		args: [
			'/usr/sbin/mdata-put',
			key
		],
		stdin: value
	}, function (err, stdout) {
		if (err) {
			callback(err);
			return;
		}

		callback(null);
	});
}

module.exports = mdata_put;
