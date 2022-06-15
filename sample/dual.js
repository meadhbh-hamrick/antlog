// dual.js
//
// An example of using two different facilities.

const antlog = require( "../antlog" );

const descriptor_one = {
  facility: "ONE",
  info: {
    whatever: {
      message: "I am a message in facility one."
    }
  }
};

const descriptor_two = {
  facility: "TWO",
  info: {
    works: {
      message: "I am a message in facility two."
    }
  }
};

const [ _log, _ONE ] = antlog( descriptor_one );
const _TWO = ( antlog( descriptor_two ) )[1];

// The key takeaway here is you can log messages for one descriptor
// using the _log() function from a previous antlog() call.

_log( _ONE.I_WHATEVER );
_log( _TWO.I_WORKS );
