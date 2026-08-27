import React, { useEffect, useState } from 'react'
import { Typography } from '@mui/material'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { postOauthCode } from '../api/notion';
import { addAccessTokenToLocalStorage } from '../redux/slice';
import { useSelector } from 'react-redux';
import CustomButton from '../components/CustomButton';
import { logOut, readAccessToken, writeAccessToken } from '../utilities/helperFunctions';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(6),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    textTransform: 'uppercase'
}));

export default function Home() {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const accessToken = useSelector((state) => state.localStorageReducer.access_token) || readAccessToken();

    const search = useLocation().search;
    const code = new URLSearchParams(search).get('code');
    const oauthError = new URLSearchParams(search).get('error');

    const [exchanging, setExchanging] = useState(false);

    useEffect(() => {
        if (oauthError) {
            enqueueSnackbar(`Notion returned "${oauthError}"`, { variant: 'error' });
            return;
        }

        // Already have a token, or Notion didn't send a code back — nothing to do.
        if (readAccessToken() || !code) {
            dispatch(addAccessTokenToLocalStorage({ access_token: readAccessToken() }));
            return;
        }

        let cancelled = false;
        setExchanging(true);

        postOauthCode(code)
            .then((token) => {
                if (cancelled) return;
                if (!token) {
                    enqueueSnackbar('Could not complete Notion sign-in', { variant: 'error' });
                    return;
                }
                writeAccessToken(token);
                dispatch(addAccessTokenToLocalStorage({ access_token: token }));
            })
            .catch((err) => {
                if (cancelled) return;
                enqueueSnackbar(err.message || 'Could not complete Notion sign-in', { variant: 'error' });
            })
            .finally(() => {
                if (!cancelled) setExchanging(false);
            });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const features = [
        { title: 'ChatGPT', 'navigateTo': 'chatgpt' }
    ]

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='h5' gutterBottom sx={{ textAlign: 'center', fontStyle: 'italic' }}>
                    NotionGPT
                </Typography>

                {accessToken && <CustomButton ButtonName="Logout" onclickfunction={logOut} />}
            </Box>

            {exchanging && (
                <Typography variant='body2'>Connecting your Notion workspace…</Typography>
            )}

            {!exchanging && !accessToken && (
                <Typography variant='body2'>
                    Not connected. <Link to="/">Connect your Notion workspace</Link> to continue.
                </Typography>
            )}

            {accessToken && (
                <Box sx={{ flexGrow: 1, marginTop: 3 }}>
                    <Grid container rowSpacing={2} columnSpacing={4}>
                        {
                            features.map((value) => (
                                <Grid item lg={6} md={6} sm={4} xs={2} key={value.navigateTo}>
                                    <Item elevation={6} onClick={() => navigate(value.navigateTo)}>
                                        {value.title}
                                    </Item>
                                </Grid>
                            ))
                        }
                    </Grid>
                </Box>
            )}
        </>
    )
}
