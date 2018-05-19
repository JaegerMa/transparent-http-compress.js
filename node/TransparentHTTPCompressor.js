'use strict';

const WriteStreamInterceptor = require(__dirname + '/WriteStreamInterceptor');

class TransparentHTTPCompressor
{
	static wrapResponse(request, response, libraries = null)
	{
		if(!request || !response)
			return response || null;

		let ourLibraries = Object.assign({}, TransparentHTTPCompressor.libraries, libraries);

		let [libName, libCreator] = this.getBestCompression(request, ourLibraries) || [];
		if(!libName || !libCreator)
			return response;

		let library = libCreator();
		if(!library)
			return response;

		if(typeof(response.setHeader) !== 'function')
			return response;
		response.setHeader('content-encoding', libName);


		let interceptor = WriteStreamInterceptor.create(response, library);

		return interceptor;
	}
	static getBestCompression(request, libraries)
	{
		let headers = request.headers || request;

		let acceptedCompressionsStr = headers['accept-encoding'] || headers;
		if(!acceptedCompressionsStr || typeof(acceptedCompressionsStr) !== 'string')
			return null;

		let acceptedCompressions = acceptedCompressionsStr.split(',').map((method) => method.trim());
		let availableLibraries = Object.entries(libraries)
			.filter(([name, func]) => typeof(func) === 'function')
			.filter(([name]) => acceptedCompressions.includes(name))
			.reduce((libs, [name, func]) => (libs[name] = [name, func], libs), {});

		return availableLibraries.br
			|| availableLibraries.gzip
			|| availableLibraries.deflate
			|| Object.values(availableLibraries)[0];
	}
}


TransparentHTTPCompressor.wrap = TransparentHTTPCompressor.wrapResponse;
TransparentHTTPCompressor.compress = TransparentHTTPCompressor.wrapResponse;
TransparentHTTPCompressor.compressResponse = TransparentHTTPCompressor.wrapResponse;

module.exports = TransparentHTTPCompressor;
