# Antlog (Antimony Log)

Structured, easy-to-parse log messages mostly for CloudWatch

## Overview

Antlog is a follow-on project to the TinLog package, which was
itself a follow-on to SN-LOG.  I wrote it to be used with AWS
CloudWatch, though it works perfectly fine outside that
environment.  In the middle of a recent project I found I was
downloading and processing CloudWatch logs to verify what steps
had been completed by various lambdas and containerized apps.
At first we depended on file names, line numbers and custom
parsers to extract interesting information out of the logs.  You
don't want to do that.

I use SN-LOG and TinLog in previous projects.  They were
intended to "feel" like the old VMS MESSAGE Facility.  VMS
MESSAGE gave developers the ability to create message templates
which were converted into an object file which was then linked
into an application.  Developers could then use the
MSG$_<WHATEVER> procedures to reference a specific message from
the template along with pertinent data.  It then produced log
messages in a regular format that was easy to parse.

Fast-forward 40 years and this is still a decent idea, but
there's no reason not to use JSON as it is well-supported in
virtually every programming language you are likely to use.
So... as a developer, what you do is to create a message
template like this:

```
  var larb_messages = {
  facility: "larb",
  messages: {
    info: {
      begin: {
        message: "Application beginning",
        required: [ "name" ]
      },
      options: {
        message: "Command line options",
        required: [ "options" ]
      },
      environment: {
        message: "Environment variables",
        required: [ "variables" ]
      },
      end: {
        message: "Application exiting",
        required: [ "exit" ]
      }
    },
    debug: {
      comp1: {
        message: "Completed Phase 1"
      },
      tokenauth: {
        message: "Authenticated with JWT token"
      },
      passauth: {
        message: "Authenticated with username / password bearer token"
      }
    },
    error: {
      ddbread: {
        message: "An error reading from a DynamoDB table occurred",
        required: [ "table" ]
      }
    },
    fatal: {
      general: {
        message: "A fatal error has occurred"
      },
      cli: {
        message: "A fatal error parsing command line options has occurred"
      },
      fopen: {
        message: "An error opening a file has occurred",
        required: [ "name", "error" ]
      }
    }
  }
```

It is then read and parsed with the antlog function:

```
  const antlog = require( "antlog" );

  [ _log, _msg ] = antlog( larb_messages );

  _log( _msg.I_BEGIN, {name: "REST Access"} );
  _log( _msg.I_OPTIONS, {options: process.ARGV} );
```

Which would print log messages that look like:

```
{"_f":"LARB","_s":"I","_a":"BEGIN","_d":1654711842031,"_i":"access.js","_l":5,"_m":"Application beginning","name":"REST Access"}
{"_f":"LARB","_s":"I","_a":"OPTIONS","_d":1654711842073,"_i":"access.js","_l":6,"_m":"Command line options","options":["/usr/bin/node","/opt/larb/access.js","--config","/mnt/r1/access_opts.json"]}
```

Each log entry will have the following "private" JSON members:

```
  | _f | facility                                             |
  | _s | severity (I = Info, D = Debug, E = Error, F = Fatal) |
  | _a | abbreviation                                         |
  | _d | date / time (msec since 1970)                        |
  | _i | filename                                             |
  | _l | line                                                 |
  | _m | message text                                         |
```

If you include a JSON object as the second parameter to the
_log() call, it will copy members of that object to the logged
message.

And if you printed these with console.log() in a lambda, you
would get CloudWatch records that look like:

```
2022-06-08T18:10:42.031Z\t76227c3a-e758-11ec-9045-17b456a80bd2\tINFO\t{"_f":"LARB","_s":"I","_a":"BEGIN","_d":1654711842031,"_c":"access.js","_l":5,"_m":"Application beginning","name":"REST Access"}
2022-06-08T18:10:42.073Z\t76227c3a-e758-11ec-9045-17b456a80bd2\tINFO\t{"_f":"LARB","_s":"I","_a":"OPTIONS","_d":1654711842073,"_c":"access.js","_l":6,"_m":"Command line options","options":["/usr/bin/node","/opt/larb/access.js","--config","/mnt/r1/access_opts.json"]}
```

And sure, that may not look all that great to you, but like I
said, it's great if you're trying to parse CloudWatch logfilese
because you can now use code like this to parse it:

```
  function _log_line_to_components( line ) {
    let components = line.split('\t');
  
    try {
      // Parse the text of the log message so we return
      // an object, not the JSON serialization of the object.
      components[ 3 ] = JSON.parse( components[ 3 ] );
    } catch( err ) {
      // If we catch an exception, assume it's a problem
      // parsing the JSON.
      components[ 3 ] = {}
    }

    // This returns an array with the Date string, AWS
    // invocation ID, log level and logged object
    return components;
  }
```

# Log Descriptor

The log descriptor passed to the antlog() call is a JSON
object with the following members:

* facility - required - The name of a logical grouping of files.  When I
  use antlog to make a module, I use the module name as the facility name.
  When making an app, I use the app name as the facility name.
* emitter - optional - A function that takes a string and outputs it
  somewhere.  We use it in the jest test scripts to save a copy of what's
  being output.  By default we emit messages with console.log().
* debug, info, error and fatal - optional (though pointless to not have
  at least one of them) - These objects contain references to message
  templates.  Each key in this object is used as a message abbreviation.
  Each object member contains a message element which is the text
  emitted when the message is logged. It optionally contains an array of
  required members that should be in the parameters when the _log()
  function is called.