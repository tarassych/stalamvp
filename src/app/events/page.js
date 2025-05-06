'use client';

import { useEffect, useState } from 'react';
import {
	Container, Typography, Box, CircularProgress,
	List, ListItem, ListItemText, Divider, Chip, Paper,
	Collapse, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

// Format date string for display
const formatDate = (iso) => dayjs(iso).format('YYYY-MM-DD HH:mm');

// Format duration between start and end timestamps
const formatDuration = (start, end) => {
	const diff = dayjs(end).diff(dayjs(start), 'minute');
	return `${diff} minutes`;
};

export default function EventsPage() {
	// Stores loaded interview events
	const [events, setEvents] = useState([]);

	// UI loading indicator
	const [loading, setLoading] = useState(true);

	// Tracks which transcripts are expanded
	const [expandedEventIds, setExpandedEventIds] = useState({});

	// Tracks which events had AI simulation started
	const [simulationStartedIds, setSimulationStartedIds] = useState({});

	// Fetch events from n8n webhook on mount
	useEffect(() => {
		fetch(process.env.NEXT_PUBLIC_N8N_GET_EVENTS_URL)
			.then(res => res.json())
			.then(data => setEvents(Array.isArray(data) ? data : [data]))
			.catch(err => console.error('Error loading events:', err))
			.finally(() => setLoading(false));
	}, []);

	// Toggle transcript open/closed by event ID
	const toggleTranscript = (id) => {
		setExpandedEventIds(prev => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	// Trigger AI post-processing via n8n webhook for specific event
	const simulateProcessing = async (eventID) => {
		try {
			setSimulationStartedIds(prev => ({ ...prev, [eventID]: true }));

			await fetch(process.env.NEXT_PUBLIC_N8N_SIMULATE_AI_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ eventID }),
			});
		} catch (err) {
			console.error('Simulation trigger failed:', err);
		}
	};

	return (
		<Container maxWidth="md" sx={{ mt: 5 }}>
			<Typography variant="h4" gutterBottom>Interview Events</Typography>

			{loading ? (
				// Show loading spinner while events are being fetched
				<Box mt={4} display="flex" justifyContent="center">
					<CircularProgress />
				</Box>
			) : (
				// Iterate through and render each event
				events.map((event, index) => {
					const eventId = event._id || index;
					return (
						<Box key={eventId} mt={4} p={3} sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
							{/* Event Description Heading */}
							<Typography variant="h6" gutterBottom>{event.description}</Typography>

							{/* Basic Event Info */}
							<Typography variant="body2" color="text.secondary">
								<strong>Time:</strong> {formatDate(event.startDateTime?.dateTime)} – {formatDate(event.endDateTime?.dateTime)} ({formatDuration(event.startDateTime?.dateTime, event.endDateTime?.dateTime)})
							</Typography>

							<Typography variant="body2" mt={1}>
								<strong>Candidate:</strong> {event.candidate?.name} ({event.candidate?.email})
							</Typography>

							<Typography variant="body2" mt={1}>
								<strong>Interviewers:</strong> {event.interviewers?.map(i => `${i.name} (${i.email})`).join(', ')}
							</Typography>

							{/* AI Summary Section */}
							{event.summary && (
								<Box mt={2}>
									<Typography variant="subtitle1" gutterBottom>Summary</Typography>
									<Typography variant="body2" color="text.primary">{event.summary}</Typography>
								</Box>
							)}

							{/* Transcript Available Case */}
							{event.transcription && event.transcription.length ? (
								<>
									{/* Conclusion Bubble */}
									<Box mt={3} p={2} sx={{ background: '#e3f2fd', borderRadius: 2 }}>
										<Typography variant="subtitle2" gutterBottom>🧠 AI Conclusion:</Typography>
										<Typography variant="body2" color="text.primary">{event.conclusion}</Typography>
									</Box>

									{/* Expandable Transcript Header */}
									<Box mt={3} display="flex" alignItems="center" justifyContent="space-between">
										<Typography variant="subtitle1">🗣️ Transcript</Typography>
										<IconButton size="small" onClick={() => toggleTranscript(eventId)}>
											{expandedEventIds[eventId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
										</IconButton>
									</Box>

									{/* Collapsed Transcript Messages */}
									<Collapse in={expandedEventIds[eventId]} timeout="auto" unmountOnExit>
										<List dense>
											{event.transcription.map((msg, i) => (
												<ListItem key={i} alignItems="flex-start" sx={{ pl: 0 }}>
													<Paper variant="outlined" sx={{ p: 1, width: '100%' }}>
														<ListItemText
															primary={
																<Typography variant="body2" fontWeight="bold" color="primary">
																	[{msg.timestamp}] {msg.speaker}
																</Typography>
															}
															secondary={
																<Typography variant="body2" color="text.primary">
																	{msg.message}
																</Typography>
															}
														/>
													</Paper>
												</ListItem>
											))}
										</List>
									</Collapse>
								</>
							) : (
								// If transcription not available yet, show reminder and optional simulate button
								<Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
									<Chip
										label="Waiting for meet recording..."
										color="warning"
										variant="outlined"
									/>

									{/* Button to manually re-trigger AI processing */}
									<Box sx={{ ml: 'auto' }}>
										<Chip
											label={
												simulationStartedIds[event.eventID]
													? 'AI processing in progress...'
													: 'Re-Start AI Processing'
											}
											color={simulationStartedIds[event.eventID] ? 'default' : 'primary'}
											variant="filled"
											clickable={!simulationStartedIds[event.eventID]}
											onClick={
												simulationStartedIds[event.eventID]
													? undefined
													: () => simulateProcessing(event.eventID)
											}
										/>
									</Box>
								</Box>
							)}
						</Box>
					);
				})
			)}
		</Container>
	);
}
