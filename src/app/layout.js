'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';

import { Roboto } from 'next/font/google';

import Header from '@/components/Header';

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}




