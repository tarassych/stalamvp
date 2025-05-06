/**
 * API Route: POST /api/proxy-to-n8n
 *
 * This handler forwards POST requests from the React app
 * to an external n8n webhook. It adds a timeout controller
 * (3 minutes max) to protect the server from long waits or hanging.
 */

export default async function handler(req, res) {
	// Only allow POST requests
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	// Set up abort controller for timeout enforcement
	const controller = new AbortController();
	const timeoutMs = 180000; // 3 minutes
	const timeout = setTimeout(() => {
		controller.abort(); // cancel request if it exceeds timeout
	}, timeoutMs);

	try {
		// Forward the request to the n8n webhook with same payload
		const response = await fetch(process.env.N8N_SCHEDULE_EVENT_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			signal: controller.signal, // attach timeout signal
			body: JSON.stringify(req.body),
		});

		// Clear the timeout once the request completes
		clearTimeout(timeout);

		// Relay the response from n8n directly back to client
		const data = await response.json();
		return res.status(response.status).json(data);
	} catch (err) {
		// Ensure timeout is cleared even on error
		clearTimeout(timeout);
		console.error('Proxy error:', err);

		// Handle case where n8n took too long
		if (err.name === 'AbortError') {
			return res.status(504).json({ error: 'Upstream request timed out after 3 minutes.' });
		}

		// Generic fallback for unexpected errors
		return res.status(500).json({ error: 'Failed to forward to n8n webhook.' });
	}
}
