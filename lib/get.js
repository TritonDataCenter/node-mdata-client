/* vim: set sts=8 ts=8 sw=8 noet: */

var mod_assert = require('assert-plus');

var lib_common = require('./common');

function
mdata_get(key, callback)
{
	mod_assert.string(key, 'key');
	mod_assert.func(callback, 'callback');

	lib_common.run_command({
		command: lib_common.root_runner(),
		args: [
			'/usr/sbin/mdata-get',
			key
		]
	}, function (err, stdout) {
		if (err) {
			if (err.exit_status === 1) {
				/*
				 * mdata-get(1M) exits with a status of 1 when
				 * the key could not be found.  Other failure
				 * conditions produce different status codes.
				 */
				err.code = 'ENOENT';
				err.not_found = true;
			}
			callback(err);
			return;
		}

		callback(null, stdout);
	});
}

module.exports = mdata_get;
