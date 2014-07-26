/* vim: set sts=8 ts=8 sw=8 noet: */

var mod_child = require('child_process');
var mod_util = require('util');

var mod_assert = require('assert-plus');
var mod_verror = require('verror');

/*
 * Execution helper function:
 */

function
read_to_end(stream, callback)
{
	var cb = false;
	var data = '';
	stream.on('readable', function () {
		for (;;) {
			var ch = stream.read();
			if (!ch)
				return;
			data += ch.toString();
		}
	});
	stream.on('error', function (err) {
		if (cb)
			return;
		cb = true;
		callback(err);
	});
	stream.on('end', function () {
		if (cb)
			return;
		cb = true;
		callback(null, data);
	});
}


function
run_command(options, callback)
{
	mod_assert.object(options, 'options');
	mod_assert.func(callback, 'callback');

	mod_assert.string(options.command, 'options.command');
	mod_assert.optionalString(options.stdin, 'options.stdin');
	mod_assert.optionalArrayOfString(options.args, 'options.args');
	mod_assert.optionalNumber(options.timeout, 'options.timeout');

	var timeo;
	var finished = false;
	var code;
	var signal;
	var stdout;
	var stderr;
	var done = {
		command: false,
		stdout: false,
		stderr: false
	};

	var format_err = function (errstr, err) {
		if (err)
			err = new mod_verror.VError(err, errstr);
		else
			err = new mod_verror.VError(errstr);

		err.command = options.command;
		err.args = options.args;
		err.exit_status = code;
		err.signal = signal;
		err.stderr = stderr;

		return (err);
	};

	var donecb = function (err, name) {
		if (finished)
			return;

		if (err) {
			finished = true;
			callback(format_err('execution failed', err));
			return;
		}

		done[name] = true;
		if (!done.command || !done.stdout || !done.stderr)
			return;

		finished = true;
		if (timeo)
			clearTimeout(timeo);

		if (code !== 0) {
			var errstr;
			if (signal) {
				errstr = mod_util.format('command exited due ' +
					'to signal %s', signal);
			} else {
				errstr = mod_util.format('command exited non-' +
					'zero (%d): %s', code, stderr);
			}

			callback(format_err(errstr));
			return;
		}

		callback(null, stdout);
	};

	var proc = mod_child.spawn(options.command, options.args || [], {});

	read_to_end(proc.stdout, function (err, data) {
		stdout = data;
		if (err)
			err = format_err('could not read stdout', err);
		donecb(err, 'stdout');
	});
	read_to_end(proc.stderr, function (err, data) {
		stderr = data;
		if (err)
			err = format_err('could not read stderr', err);
		donecb(err, 'stderr');
	});

	proc.on('error', donecb);
	proc.on('exit', function (_code, _signal) {
		code = _code;
		signal = _signal;
		donecb(null, 'command');
	});

	if (options.timeout) {
		timeo = setTimeout(function () {
			try {
				proc.kill();
			} catch (ex) {
			}
			donecb(format_err('command execution timed out'));
		}, options.timeout);
	}

	if (options.stdin)
		proc.stdin.write(options.stdin);

	proc.stdin.end();
}

function
root_runner()
{
	if (process.getuid() === 0) {
		return ('/usr/bin/env');
	} else if (process.platform === 'sunos') {
		return ('/usr/bin/pfexec');
	} else {
		return ('sudo');
	}
}

module.exports = {
	run_command: run_command,
	root_runner: root_runner
};
