# mdata-client

A Node.js wrapper around the [mdata-client][1] tools shipped inside Joyent
instances.  Can be used to _get_, _list_, _put_ and _delete_ keys from the
per-instance metadata store.

Generally, the metadata client tools must be run as the `root` user to function
correctly.  The library makes a basic attempt to ensure this by using `pfexec`
on SmartOS/illumos systems, or `sudo` on other systems.  Configuration of these
escalation mechanisms is beyond the scope of this document.

## Usage

### list(callback)

This function wraps `mdata-list`.  It accepts a callback function with
arguments `(err, keys)`.  If the list of available metadata keys could not be
obtained, the callback is called with `err` set to an `Error` object.
Otherwise, the (possibly empty) list of available metadata keys is passed as
`keys`: an array of strings.

```javascript
var mod_mdata = require('mdata');

mod_mdata.list(function (err, keys) {
  if (err) {
    console.error('ERROR: %s', err);
    process.exit(1);
  }

  console.log('keys: %s', keys.join(', '));
});
```

### get(key, callback)

This function wraps `mdata-get`.  It accepts a string, `key`, identifying the
metadata key to fetch from the store.  It also accepts a callback function with
arguments `(err, value)`.  If the requested metadata key could not be fetched,
the callback is called with `err` set to an `Error` object.  In the special
case that the request was successful, but the key was not found, the `Error`
will have its `not_found` property set to `true`.

If the metadata value was returned successfully, it will be passed as a string
in the `value` callback argument.

```javascript
var mod_mdata = require('mdata');

mod_mdata.get('user-script', function (err, value) {
  if (err) {
    if (err.not_found) {
      console.error('key was not found');
    } else {
      console.error('ERROR: %s', err);
    }
    process.exit(1);
  }

  console.log('The user-script is:\n\n%s\n', value);
});
```

### put(key, value, callback)

This function wraps `mdata-put`.  It accepts a string, `key`, identifying the
metadata key to set in the store.  It accepts a second string, `value`, with
the value for `key`.  Finally, it accepts a callback function with the argument
`(err)`.  If the metadata store was updated successfully, the callback will be
called without arguments.  Otherwise, an `Error` will be passed in the `err`
argument.

```javascript
var mod_mdata = require('mdata');

mod_mdata.put('platform', process.platform, function (err, value) {
  if (err) {
    console.error('ERROR: %s', err);
    process.exit(1);
  }

  console.log('Platform value set OK');
});
```

### del(key, callback)

This function wraps `mdata-put`.  It accepts a string, `key`, identifying the
metadata key to remove from the store.  It also accepts a callback function
with the argument `(err)`.  If the metadata store was updated successfully, the
callback will be called without arguments.  Otherwise, an `Error` will be
passed in the `err` argument.

```javascript
var mod_mdata = require('mdata');

mod_mdata.del('secret_password', function (err) {
  if (err) {
    console.error('ERROR: %s', err);
    process.exit(1);
  }

  console.log('Secret password cleared');
});
```

[1]: https://github.com/joyent/mdata-client
