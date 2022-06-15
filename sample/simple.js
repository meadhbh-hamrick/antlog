// simple.js
//
// A simple example of using antlog

const antlog = require( "../antlog" );

const example_descriptor = {
  facility: "EXAMPLE",
  debug: {
    add: {
      message: "Addition Test"
    }
  },
  info: {
    begin: {
      message: "Begin Program"
    },
    cli: {
      message: "Command Line Options"
    },
    end: {
      messsage: "End Program"
    }
  },
  error: {
    random: {
      message: "Random Error"
    }
  },
  fatal: {
    example: {
      message: "In the old days, fatal errors caused an abend"
    }
  }
};

const [ _log, _EXAMPLE ] = antlog( example_descriptor );

_log( _EXAMPLE.I_BEGIN );
_log( _EXAMPLE.I_CLI, process.argv );

test_addition( 2, 3 );

_log( _EXAMPLE.E_RANDOM );
_log( _EXAMPLE.F_EXAMPLE );

_log( _EXAMPLE.I_END );

function test_addition( a, b ) {
  _log( _EXAMPLE.D_ADD, { a: a, b: b, sum: a + b } );
}
