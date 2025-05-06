'use client';

import Link from 'next/link';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';

export default function Header() {
	return (
		<AppBar position="static" sx={{ mb: 4 }}>
			<Toolbar>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					Interview Scheduler
				</Typography>
				<Box>
					<Button color="inherit" component={Link} href="/">Schedule</Button>
					<Button color="inherit" component={Link} href="/events">Events</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
