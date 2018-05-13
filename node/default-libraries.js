'use strict';

const zlib = require('zlib');

let lib =
{
	deflate: () => zlib.createDeflate(),
	gzip: () => zlib.createGzip(),
};

try
{
	let brotli = require('iltorb');
	lib.br = () => brotli.compressStream();
}
catch(x) { }


module.exports = lib;
