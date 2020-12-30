import http from 'http';

declare class TransparentHTTPCompressor
{
	static wrap(request: http.IncomingMessage, response: http.ServerResponse, libraries?: { [key: string]: () => any; }): http.ServerResponse
	static compress(request: http.IncomingMessage, response: http.ServerResponse, libraries?: { [key: string]: () => any; }): http.ServerResponse
	static wrapResponse(request: http.IncomingMessage, response: http.ServerResponse, libraries?: { [key: string]: () => any; }): http.ServerResponse
	static compressResponse(request: http.IncomingMessage, response: http.ServerResponse, libraries?: { [key: string]: () => any; }): http.ServerResponse

	static getBestCompression(request: http.IncomingMessage, libraries: { [key: string]: () => any; }): http.ServerResponse
}

export default TransparentHTTPCompressor;