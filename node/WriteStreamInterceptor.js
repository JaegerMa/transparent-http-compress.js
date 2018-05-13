'use strict';

const INTERCEPTED_EVENTS =
[
	'drain',
	'pipe',
	'unpipe',
	'error',
];
const INTERCEPTED_EMITTED_EVENTS =
[
	'pipe',
	'unpipe',
]

class WriteStreamInterceptor
{
	constructor(proxiedStream, injectedStream)
	{
		this.proxiedStream = proxiedStream;
		this.injectedStream = injectedStream;

		this.init();
	}
	init()
	{
		if(this.injectedStream)
			this.injectedStream.pipe(this.proxiedStream);
	}

	get nextHop()
	{
		return this.injectedStream || this.proxiedStream;
	}
	getNextHopForEvent(eventName)
	{
		//Some events should be registered on the injectedStream,
		//if the event isn't listed in INTERCEPTED_EVENTS, it's
		//forwarded as every other function to the proxiedStream
		if(INTERCEPTED_EVENTS.includes(eventName))
			return this.nextHop;
		else
			return this.proxiedStream;
	}
	getNextHopForEmittedEvent(eventName)
	{
		//Sometimes, other code calls .emit on our object. Like
		//in .getNextHopForEvent, some of these .emit-calls should
		//be intercepted and called on injectedStream whilst all
		//other will be forwarded to proxiedStream
		if(INTERCEPTED_EMITTED_EVENTS.includes(eventName))
			return this.nextHop;
		else
			return this.proxiedStream;
	}

	
	on(name)
	{
		let nextHop = this.getNextHopForEvent(name);
		return nextHop.on.apply(nextHop, Array.from(arguments));
	}
	once(name)
	{
		let nextHop = this.getNextHopForEvent(name);
		return nextHop.once.apply(nextHop, Array.from(arguments));
	}
	prependListener(name)
	{
		let nextHop = this.getNextHopForEvent(name);
		return nextHop.prependListener.apply(nextHop, Array.from(arguments));
	}
	removeListener(name)
	{
		let nextHop = this.getNextHopForEvent(name);
		return nextHop.removeListener.apply(nextHop, Array.from(arguments));
	}
	emit(name)
	{
		let nextHop = this.getNextHopForEmittedEvent(name);
		return nextHop.emit.apply(nextHop, Array.from(arguments));
	}

	write()
	{
		let nextHop = this.nextHop;
		return nextHop.write.apply(nextHop, Array.from(arguments));
	}
	end()
	{
		let nextHop = this.nextHop;
		return nextHop.end.apply(nextHop, Array.from(arguments));
	}


	static create()
	{
		let streamInterceptor = new WriteStreamInterceptor(...arguments);
		let coat = new Proxy(streamInterceptor,
			{
				get(proxied, name)
				{
					if(name in streamInterceptor)
						return streamInterceptor[name];
					

					let wrappedAttribute = streamInterceptor.proxiedStream[name];
					if(typeof(wrappedAttribute) === 'function')
					{
						return function()
						{
							let funcCaller = this;
							if(funcCaller === streamInterceptor || funcCaller === coat)
								funcCaller = streamInterceptor.proxiedStream;

							return wrappedAttribute.call(funcCaller, ...arguments);
						};
					}

					return wrappedAttribute;
				},
				set(proxied, name, value)
				{
					if(name in streamInterceptor)
						streamInterceptor[name] = value;
					else
						streamInterceptor.proxiedStream[name] = value;
					
					return true;
				}
			}
		);

		return coat;
	}
}

module.exports = WriteStreamInterceptor;
