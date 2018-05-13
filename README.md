# transparent-http-compress
transparent-http-compress creates a stream based on the `accept-encoding` HTTP header which transparently compresses the data written to it while being fully compatible to original response

## Usage

For normal usage, just call httpCompress.compress and use the return value as new response:
```js
const http = require('http');
const httpCompress = require('transparent-http-compress');

http.createServer((request, response) =>
{
	let compressedResponse = httpCompress.compress(request, response);

	//compressedResponse is connected and fully compatible to the original response
	//and can be used as it would be the real response
	compressedResponse.setHeader('x-foo', 'bar');

	compressedResponse.writeHead(403,
		{
			'x-bar': 'foo'
		}
	);
	compressedResponse.write('Hello HTTP');
	compressedResponse.end();
});
```

If you want to add new compression libraries or replace or disable existing ones, either set or extend the variable `httpCompress.libraries` to set the default for all future responses, or pass an object to `httpCompress.compress` which then will then be merged into the default libraries in `httpCompress.libraries` for that response:
```js
const http = require('http');
const httpCompress = require('transparent-http-compress');

const myZLib = require('./my-zlib');

//Add/replace the 'deflate' library
httpCompress.libraries.deflate = () => myZLib.createDeflate();

http.createServer((request, response) =>
{
	let compressedResponse = httpCompress.compress(request, response,
		{
			gzip: null, //As this object is merged
						//into the default libraries,
						//gzip will be disabled for this response
		}
	);


	compressedResponse.write('Hello HTTP');
	compressedResponse.end();
});
```
## Supported compression methods
### Default compression methods
Following compression methods can be used without any dependencies as they're done using the NodeJS core packages. These are enabled by default:
- `deflate`: Using NodeJS `zlib`
- `gzip`: Using NodeJS `zlib`

### Compressions with dependencies
Some compression methods are provided by other packages not included in NodeJS. `transparent-http-compress`  doesn't have this dependencies listed in package.json so users don't have to download huge dependency-trees if they don't use the features. If you want to use a compression listed here, just install the dependency and `transparent-http-compress` will automatically use it.
- `brotli` (also known as `br`): Depends on npm package `iltorb`


## API

### `compress(request, response, [additionalLibraries])`
#### arguments

- `request (http.IncommingMessage or compatible)`
- `response (http.ServerResponse or compatible)`
- `additionalLibraries (object)` in format `{ LIBNAME: () => return STREAMINSTANCE }`;

#### returns

- `object` fully compatible to `response`
