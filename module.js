'use strict';

const TransparentHTTPCompressor = require(__dirname + '/node/TransparentHTTPCompressor');
const defaultLibraries = require(__dirname + '/node/default-libraries');

TransparentHTTPCompressor.libraries = defaultLibraries;

module.exports = TransparentHTTPCompressor;
