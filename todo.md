Future versions of antlog will include these features:

* Severity Mask - By default, antlog prints out all messages logged.
  Sometimes you don't want to print out debug messages, or info
  messages, or whatever.  This feature allows you to assign a bit-mask
  to antlog to indicate which messages you want to emit.  By default,
  antlog looks for the ANTLOG_SEVERITY_MASK environment variable.  If set,
  it is interpreted as a hexadecimal number representing the severity mask.
* Log Level - Slightly different from the severity mask. This is a number
  representing a logging level.  If set to zero, all severities (DEBUG, INFO,
  ERROR, FATAL) are logged.  If set to two, INFO, ERROR and FATAL severities
  are logged.  If set to three, ERROR and FATAL severities are logged.  If set
  to four, only FATAL severities are logged.  If set to five, no messages
  are logged.  By default, antlog looks for the ANTLOG_LOG_LEVEL environment
  variable and interprets it as a number to set the log level.  Note: setting
  the Log Level happens AFTER setting the severity mask.  If BOTH
  ANTLOG_LOG_LEVEL and ANTLOG_SEVERITY_MASK environment variables are set,
  ANTLOG_SEVERITY_MASK is effectively ignored.
* Ignored Facilities - This is an array of facility names you want to supress.
  By default, antlog will look for the ANTLOG_IGNORE_FACILITIES environment
  variable and interpret it as a comma separated list of facility names to
  ignore.
* Warning severity - I was convinced to support a warning severity between info
  and error.  But I want to push out this version to test various bits of
  infrastructure.  Expect a warning severity to land soon.
* Emitter Map - A JSON object representing a map between a severity level and
  an emitter function.  Antlog currently emits all messages to console.info.
  This will change when this feature is added.  The default will be to emit
  info severity messages to console.info, debug messages to console.debug,
  warning messages to console.warn, and error and fatal messages to
  console.error.  This is mostly irrelevant to people using node on a local
  system, but AWS Lambdas record which console function was called when a
  message was "printed" to the log.  Some people may want to retain this
  information.