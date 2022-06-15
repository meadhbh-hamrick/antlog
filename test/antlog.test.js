const antlog = require( "../antlog" );

test( "antlog is a function", () => {
  expect( typeof antlog ).toBe( "function" );
} );

let _test_global;
let _object_global;

function _test_emit( message ) {
  _test_global = message;
}

const [ _log, _TESTISH ] = antlog( {
  emitter: _test_emit,
  facility: "testish",
  info: {
    begin: {
      message: "Application beginning"
    },
    end: {
      message: "Application ending",
      required: [ "code" ]
    }
  },
  debug: {
    random: {
      message: "Random Debugging Message",
      required: [ "p1" ]
    }
  }
} );

test( "log object should be function", () => {
  expect( typeof _log ).toBe( "function" );
} );

test( "msg object should be object", () => {
  expect( typeof _TESTISH ).toBe( "object" );
} );

test( "_TESTISH.I_BEGIN exists", () => {
  expect( typeof _TESTISH.I_BEGIN ).toBe( "object" );
} );

// Now log a message. But we set a custom emitter, so the
// string it would normally emit to the console goes into
// the _test_global variable.

_log( _TESTISH.I_BEGIN, { name: "TESTER" } );

test( "is _test_global a string?", () => {
  expect( typeof _test_global ).toBe( "string" );
} );

// Is the message a valid JSON object?

var got_exception;

try {
  _object_global = JSON.parse( _test_global );
  got_exception = false;
} catch( err ) {
  got_exception = true;
}

test( "is _test_global a valid JSON object?", () => {
  expect( got_exception ).toBe( false );
} );

test( "is _object_global._f equal to TESTISH", () => {
  expect( _object_global?._f ).toBe( "TESTISH" );
} );

test( "is _object_global._s equal to I", () => {
  expect( _object_global?._s ).toBe( "I" );
} );

test( "is _object_global._a equal to BEGIN", () => {
  expect( _object_global?._a ).toBe( "BEGIN" );
} );

test( "is _object_global._d a number", () => {
  expect( typeof _object_global?._d ).toBe( "number" );
} );

test( "is _object_global._i a string", () => {
  expect( typeof _object_global?._i ).toBe( "string" );
} );

test( "is _object_global._l a number", () => {
  expect( typeof _object_global?._l).toBe( "number" );
} );

test( "is _object_global._m equal to \"Application beginning\"", () => {
  expect( _object_global?._m ).toBe( "Application beginning" );
} );
