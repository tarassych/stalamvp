import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EventsPage from '@/app/events/page';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

const mockEvent = {
	_id: 'mock123',
	eventID: 'mock-event-id',
	description: 'Interview with Charlie Adams',
	summary: 'Charlie is a great candidate with React experience.',
	conclusion: 'Highly recommended for next round.',
	startDateTime: { dateTime: '2025-05-06T22:00:00+03:00', timeZone: 'America/Chicago' },
	endDateTime: { dateTime: '2025-05-06T22:30:00+03:00', timeZone: 'America/Chicago' },
	candidate: { name: 'Charlie Adams', email: 'charlie@example.com' },
	interviewers: [
		{ name: 'Jane Doe', email: 'jane@example.com' },
		{ name: 'Mark Smith', email: 'mark@example.com' }
	],
	transcription: [
		{
			speaker: 'Jane Doe',
			timestamp: '00:00:05',
			message: 'Hello Charlie, can you introduce yourself?'
		},
		{
			speaker: 'Charlie Adams',
			timestamp: '00:00:10',
			message: 'Sure, I’m a React developer with 5 years of experience.'
		}
	]
};

// Mock the n8n events webhook
const server = setupServer(
	rest.get(process.env.NEXT_PUBLIC_N8N_GET_EVENTS_URL, (req, res, ctx) => {
		return res(ctx.status(200), ctx.json([mockEvent]));
	})
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EventsPage', () => {
	it('renders event data correctly', async () => {
		render(<EventsPage />);

		// Wait for event to appear
		await waitFor(() =>
			expect(screen.getByText('Interview with Charlie Adams')).toBeInTheDocument()
		);

		// Basic details
		expect(screen.getByText(/Charlie Adams/)).toBeInTheDocument();
		expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
		expect(screen.getByText(/mark@example.com/)).toBeInTheDocument();

		// Summary
		expect(screen.getByText(/Charlie is a great candidate/)).toBeInTheDocument();

		// AI Conclusion
		expect(screen.getByText(/Highly recommended for next round/)).toBeInTheDocument();

		// Transcript is initially collapsed
		expect(screen.queryByText(/can you introduce yourself/)).not.toBeInTheDocument();

		// Expand transcript
		fireEvent.click(screen.getByRole('button', { name: /expand more/i }));

		// Now it should be visible
		await waitFor(() =>
			expect(screen.getByText(/can you introduce yourself/)).toBeInTheDocument()
		);
	});
});
