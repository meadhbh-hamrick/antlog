// antlog.js
// Structured JSON Log Messages, mostly for CloudWatch
//
// Copyright (c) 2022 Meadhbh S. Hamrick
// All Rights Reserved
//
// Released under a 3-Clause BSD License, see LICENCE for
// details.

// Export a function that returns a logger function and a
// "message object" in an array.  Assumed you'll use
// destructuring assignment when calling it. Something like
// this:
//
//   const antlog = require( "antlog" );
//   const [ _log, _msg ] = antlog( { ... descriptor ... } );
//
// See readme.md for information regarding the descriptor
// format.

module.exports = function ( _d ) {
  let _emitter, _msg, _log, _facility;
  
  if( "object" !== typeof _d ) {
    throw new Error( "Descriptor should be object" );
  }

  // The emitter is a function that takes stringified JSON
  // output and prints it out somewhere.  Useful if you don't
  // want to log wit console.info().  We use it for the unit
  // tests, for instance.
  
  if( "function" == typeof _d.emitter ) {
    _emitter = _d.emitter;
  } else {
    _emitter = console.info;
  }

  // The "facility" is a named logical grouping of log
  // messages.  When I use antlog, I use a per-module
  // descriptor and use the module name as the facility
  // name.
  
  if( "string" == typeof _d?.facility ) {
    _facility = _d.facility;
  } else {
    _facility = "UNKNOWN";
  }

  // We only support four "severities": DEBUG, INFO, ERROR
  // and FATAL.  The _msg object is returned to the caller
  // and used to contain information about log messages.
  
  _msg = [
    [ "info", "I" ], [ "debug", "D" ], [ "error", "E" ],
    [ "fatal", "F" ]
  ].reduce( ( a, c ) => {
    if( undefined !== _d[c[0]] ) {
      Object.keys( _d[c[0]] ).forEach( ( e ) => {
        let abbrev = e.toUpperCase();
        let key = `${c[1]}_${abbrev}`;
        a[ key ] = _d[c[0]][e];
        a[ key ].abbrev = abbrev;
        a[ key ].severity = c[1];
        a[ key ].facility = _facility.toUpperCase();
      } );
    }
    return a;
  }, {} );

  // This is the log function we return to the caller.  The _msg
  // parameter references a member of the _msg object defined above.
  // This is how we think it should be used:
  //
  //   const antlog = require( "antlog" );
  //   const [ _log, _msg ] = antlog( {
  //     facility: "EXAMPLE",
  //     info: {
  //       simple: {
  //         message: "Simple Log Message"
  //       }
  //     }
  //   } );
  //   _log( _msg.I_SIMPLE );
  
  _log = function ( _msg, _params ) {

    // Still no standard JS shallow (or deep) copy
    let _output = Object.keys( ( undefined === _params ) ? {} : _params ).reduce( ( a, c ) => {
      a[ c ] = _params[ c ];
      return a;
    }, {} );

    [
      [ "message", "_m" ], [ "abbrev", "_a" ],
      [ "severity", "_s" ], [ "facility", "_f" ]
    ].forEach( ( e ) => {
      _output[ e[ 1 ] ] = _msg[ e[ 0 ] ];
    } );

    _output._d = Date.now();

    let frame = (new Error()).stack.split('\n')[2];
    _output._l = Number( frame.split(':')[1] );
    _output._i = frame.split(':')[0].split('/').pop();
    
    _emitter( JSON.stringify( _output ) );
  };
  
  return [ _log, _msg ];
};
