import 'whatwg-fetch';
import '@testing-library/jest-dom';

if (typeof global.TextEncoder === 'undefined') {
	const { TextEncoder, TextDecoder } = require('util');
	global.TextEncoder = TextEncoder;
	global.TextDecoder = TextDecoder;
}

if (typeof global.BroadcastChannel === 'undefined') {
	class MockBroadcastChannel {
		constructor() {}
		postMessage() {}
		close() {}
		addEventListener() {}
		removeEventListener() {}
		onmessage() {}
	}
	global.BroadcastChannel = MockBroadcastChannel;
}
