import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
	rest.get(process.env.NEXT_PUBLIC_N8N_GET_CANDIDATES_URL, (req, res, ctx) =>
		res(ctx.json([{ name: 'Test User', email: 'test@example.com' }]))
	),
	rest.get(process.env.NEXT_PUBLIC_N8N_GET_INTERVIEWERS_URL, (req, res, ctx) =>
		res(ctx.json([{ name: 'Jane Doe', email: 'jane@example.com' }]))
	)
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
