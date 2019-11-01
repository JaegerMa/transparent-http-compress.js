'use strict';

const zlib = require('zlib');

let lib =
{
	deflate: () => zlib.createDeflate(),
	gzip: () => zlib.createGzip(),
	br: zlib.createBrotliCompress && (() => zlib.createBrotliCompress()),
};

if(!lib.br)
{
	try
	{
		let brotli = require('iltorb');
		lib.br = () => brotli.compressStream();
	}
	catch(x) { }
}


module.exports = lib;
