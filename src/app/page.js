'use client';

import { useState, useEffect } from 'react';
import {
    Container, Typography, MenuItem, Select, InputLabel,
    FormControl, Box, Button, Checkbox, ListItemText,
    OutlinedInput
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Component to display a success message after scheduling,
 * with an option to simulate meet + AI processing manually.
 */
const SuccessMessage = ({ message, eventID }) => {
    const [simulationStarted, setSimulationStarted] = useState(false);


    // Simulates a post-interview AI processing trigger
    const handleSimulate = async () => {
        try {
            setSimulationStarted(true);
            await fetch(process.env.N8N_SIMULATE_AI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventID }),
            });
        } catch (err) {
            console.error('Simulation request failed (ignored):', err);
        } finally {
            setSimulationStarted(true); // ensure state is updated even on failure
        }
    };

    return (
        <Box
            mt={3}
            p={3}
            sx={{
                backgroundColor: '#e3f2fd', // light blue background
                color: '#0d47a1',           // dark blue text
                borderRadius: 2,
                boxShadow: 1,
                border: '1px solid #90caf9',
            }}
        >
            <Typography variant="body1" gutterBottom>
                {message}
            </Typography>

            {simulationStarted ? (
                <Typography mt={2} fontWeight="medium">
                    Simulation started, results will be available in few minutes.
                </Typography>
            ) : (
                <>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2, mb: 2, display: 'block' }}
                        onClick={handleSimulate}
                    >
                        Simulate meet conversation & initiate AI processing
                    </Button>

                    <Typography variant="caption" gutterBottom>
                        {/* Note: MVP only – in production this would be triggered automatically via webhook */}
                        ** Pressing Simulate ... is needed only for MVP. In real application it will be hooked to Meet recording delivery and started automatically.
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default function HomePage() {
    // Local state for dropdowns and form
    const [candidates, setCandidates] = useState([]);
    const [interviewers, setInterviewers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [selectedCandidateEmail, setSelectedCandidateEmail] = useState('');
    const [selectedInterviewers, setSelectedInterviewers] = useState([]);

    // Default datetime initialized to next full hour (rounded)
    const [selectedDateTime, setSelectedDateTime] = useState(() => {
        const now = dayjs();
        const nextHour = now.minute() === 0 ? now : now.add(1, 'hour').startOf('hour');
        return nextHour;
    });

    const [scheduleStatus, setScheduleStatus] = useState(null); // success | error | null
    const [scheduleMessage, setScheduleMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [eventID, setEventID] = useState(null);

    // Load candidate and interviewer lists from remote API (via n8n)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [candidatesRes, interviewersRes] = await Promise.all([
                    fetch(process.env.N8N_GET_CANDIDATES_URL),
                    fetch(process.env.N8N_GET_INTERVIEWERS_URL)
                ]);

                const [candidatesData, interviewersData] = await Promise.all([
                    candidatesRes.json(),
                    interviewersRes.json()
                ]);

                setCandidates(candidatesData);
                setInterviewers(interviewersData);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoadingData(false); // always unset loading state
            }
        };

        fetchData();
    }, []);

    // Builds payload and initiates interview scheduling call
    const handleSchedule = () => {
        const selectedCandidateData = candidates.find(c => c.email === selectedCandidateEmail);
        const selectedInterviewerDetails = interviewers.filter((i) =>
            selectedInterviewers.includes(i.email)
        );

        console.log({
            candidate: selectedCandidateData,
            interviewers: selectedInterviewerDetails,
            datetime: selectedDateTime.format(),
        });

        scheduleInterviewViaN8N({
            candidate: selectedCandidateData,
            interviewers: selectedInterviewerDetails,
            datetime: selectedDateTime.toISOString(),
        });
    };

    // Sends scheduling request to n8n proxy API
    const scheduleInterviewViaN8N = async ({ candidate, interviewers, datetime }) => {
        try {
            setIsLoading(true);

            // Add timeout protection (max wait: 3 minutes)
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 180000);

            const res = await fetch('/api/proxy-to-n8n', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({ candidate, interviewers, datetime }),
            });

            clearTimeout(timeout);

            const result = await res.json();

            if (result.eventID) {
                setEventID(result.eventID);
                setScheduleStatus('success');
                setScheduleMessage(`Interview scheduled successfully. Event ID: ${result.eventID}`);
            } else if (result.error) {
                setScheduleStatus('error');
                setScheduleMessage(`Error: ${result.error}`);
            } else {
                setScheduleStatus('error');
                setScheduleMessage('Unexpected response from the server.');
            }
        } catch (err) {
            console.error(err);
            setScheduleStatus('error');
            setScheduleMessage(err.name === 'AbortError'
                ? 'Request timed out after 3 minutes.'
                : 'Unable to connect to the scheduling service.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5 }}>
            {/* Loading spinner while fetching candidates/interviewers */}
            {loadingData ? (
                <Box mt={4} display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <Typography variant="h4" gutterBottom>Schedule Interview</Typography>

                    {/* Candidate dropdown */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Candidate</InputLabel>
                        <Select
                            value={selectedCandidateEmail}
                            onChange={(e) => setSelectedCandidateEmail(e.target.value)}
                            input={<OutlinedInput label="Candidate" />}
                        >
                            {candidates.map((c) => (
                                <MenuItem key={c.email} value={c.email}>
                                    {c.name} ({c.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Interviewer multi-select */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Interviewers</InputLabel>
                        <Select
                            multiple
                            value={selectedInterviewers}
                            onChange={(e) => setSelectedInterviewers(e.target.value)}
                            input={<OutlinedInput label="Interviewers" />}
                            renderValue={(selected) =>
                                selected
                                    .map(email => interviewers.find(i => i.email === email)?.name || email)
                                    .join(', ')
                            }
                        >
                            {interviewers.map((i) => (
                                <MenuItem key={i.email} value={i.email}>
                                    <Checkbox checked={selectedInterviewers.includes(i.email)} />
                                    <ListItemText primary={`${i.name} (${i.email})`} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Date & time picker */}
                    <Box mt={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                label="Pick Date & Time"
                                minutesStep={30}
                                value={selectedDateTime}
                                onChange={setSelectedDateTime}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* Status messages */}
                    {!isLoading && scheduleStatus === 'success' && (
                        <SuccessMessage message={scheduleMessage} eventID={eventID} />
                    )}

                    {!isLoading && scheduleStatus === 'error' && (
                        <Box mt={2}>
                            <Typography color="error.main">{scheduleMessage}</Typography>
                        </Box>
                    )}

                    {isLoading && (
                        <Box mt={2} display="flex" justifyContent="center">
                            <CircularProgress />
                        </Box>
                    )}

                    {/* Final Schedule Button */}
                    <Button
                        variant="contained"
                        sx={{ mt: 4 }}
                        fullWidth
                        disabled={
                            isLoading ||
                            !selectedCandidateEmail ||
                            !selectedInterviewers.length ||
                            !selectedDateTime
                        }
                        onClick={handleSchedule}
                    >
                        {isLoading ? 'Scheduling...' : 'Schedule'}
                    </Button>
                </>
            )}
        </Container>
    );
}
