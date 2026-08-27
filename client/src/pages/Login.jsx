import React from 'react';
import Box from '@mui/material/Box';
import { Button, Typography } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NotionAppLogo from '../assets/images/Notion_app_logo.png'
import rightArrow from '../assets/images/right_arrow.png'
import { config } from '../App';
import { Navigate } from 'react-router-dom';

export function AlreadyLoggedIn() {
    // Declarative redirect: the previous version called navigate() from an
    // effect with no dependency array and returned undefined, which React 18
    // treats as a render error.
    return <Navigate to="/home" replace />;
}

export default function Login() {

    const ProjectName = 'NotionGPT'

    const theme = useTheme();
    const isMdScreen = useMediaQuery(theme.breakpoints.up('md'));

    const backgroundImageStyleNotionLogo = {
        backgroundImage: `url(${NotionAppLogo})`, // Replace 'path_to_your_image.jpg' with your image file path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        top: '-0.75rem',
        width: '5rem',
        // height: '5rem'
    };

    const backgroundImageStyleRightArrow = {
        backgroundImage: `url(${rightArrow})`, // Replace 'path_to_your_image.jpg' with your image file path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '10rem',
        height: '3rem'
    };

    return (
        <>
            <main>
                <Box sx={{ display: 'flex', justifyContent: 'center', fontSize: 0 }}>
                    <Box>
                        <Typography variant={isMdScreen ? "h4" : "h6"} gutterBottom sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                            Welcome to {ProjectName}
                        </Typography>
                        <br />
                        <Typography variant="overline" sx={{ textTransform: 'none', fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.43, letterSpacing: '0.01071em', color: 'rgba(0, 0, 0, 0.6)' }}>
                            {/* Redefine your productivity */}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', marginTop: '2rem', justifyContent: 'center' }}>

                    <Box style={backgroundImageStyleNotionLogo}>
                    </Box>
                    <Box style={backgroundImageStyleRightArrow}>
                    </Box>
                    <Typography variant={isMdScreen ? "h3" : "h6"} gutterBottom sx={{ marginLeft: '2rem' }}>
                        {ProjectName}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }} >
                    <Button href={config.notionAuthUrl} disabled={!config.notionAuthUrl}>
                        {config.notionAuthUrl ? 'Connect' : 'Set VITE_NOTION_CLIENT_ID'}
                    </Button>
                    <Typography variant='body1' gutterBottom sx={{ marginLeft: '2rem', position: 'relative', left: '-25px', top: '5px' }}>
                        your Notion app with {ProjectName}
                    </Typography>
                </Box>
            </main >
        </>
    )
}
