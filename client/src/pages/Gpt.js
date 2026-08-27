import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';
import { createTemplate, getDatabaseList, getPageList } from '../api/notion';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import CustomButton from '../components/CustomButton';
import { logOut, readAccessToken } from '../utilities/helperFunctions';
import { useSnackbar } from 'notistack'

// Must match the keys the server accepts in notion.service.js SYSTEM_PROMPTS.
const templateList = [
    'carrerCoach',
]

// Notion accepts ids with or without dashes; we store the dash-stripped form,
// so compare normalized on both sides or the selected value never renders.
const plainId = (id) => (id || '').replace(/-/g, '');

// Selecting by object (rather than by title string) keeps the mapping correct
// when two pages happen to share a title.
export function ComboBox({ databaseList, database, setDatabase }) {
    return (
        <Box width="100%">
            <Autocomplete
                disablePortal
                id="database-combo-box"
                options={databaseList}
                getOptionLabel={(option) => option.databaseTitle}
                isOptionEqualToValue={(option, value) => option.databaseId === value.databaseId}
                sx={{ width: '100%' }}
                value={databaseList.find(item => plainId(item.databaseId) === database) || null}
                onChange={(event, option) => setDatabase(option ? plainId(option.databaseId) : '')}
                renderInput={(params) => <TextField {...params} label="Databases" />}
            />
        </Box>
    );
}


export function ComboBoxForPages({ pageList, page, setPage }) {
    return (
        <Box width="100%">
            <Autocomplete
                disablePortal
                id="page-combo-box"
                options={pageList}
                getOptionLabel={(option) => option.pageTitle}
                isOptionEqualToValue={(option, value) => option.pageId === value.pageId}
                sx={{ width: '100%' }}
                value={pageList.find(item => plainId(item.pageId) === page) || null}
                onChange={(event, option) => setPage(option ? plainId(option.pageId) : '')}
                renderInput={(params) => <TextField {...params} label="Pages" />}
            />
        </Box>
    );
}



export function ComboBoxChooseTemplate({ templateList, template, setTemplate }) {
    return (
        <Box width="100%">
            <Autocomplete
                disablePortal
                id="template-combo-box"
                options={templateList}
                sx={{ width: '100%' }}
                value={template || null}
                onChange={(event, value) => setTemplate(value || '')}
                renderInput={(params) => <TextField {...params} label="Choose template" />}
            />
        </Box>

    );
}

export default function Gpt() {

    const [databaseList, setDatabaseList] = useState([]);
    const [pageList, setPageList] = useState([]);
    const [database, setDatabase] = useState('')
    const [page, setPage] = useState('')
    const [gptQuery, setGptQuery] = useState('')
    const [template, setTemplate] = useState('')

    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(false);

    const accessToken = useSelector((state) => state.localStorageReducer.access_token) || readAccessToken();

    useEffect(() => {
        if (!accessToken) return;

        let cancelled = false;

        Promise.all([getDatabaseList(accessToken), getPageList(accessToken)])
            .then(([databaseListData, pageListData]) => {
                if (cancelled) return;
                setDatabaseList(databaseListData);
                setPageList(pageListData);
            })
            .catch((error) => {
                if (cancelled) return;
                enqueueSnackbar(error.message, { variant: 'error' });
            });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken])

    const handleCreateTemplate = async () => {
        if (!page) {
            enqueueSnackbar('Pick a parent page first', { variant: 'warning' });
            return;
        }
        if (!template) {
            enqueueSnackbar('Pick a template first', { variant: 'warning' });
            return;
        }
        if (!gptQuery.trim()) {
            enqueueSnackbar('Enter a query for ChatGPT', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            await createTemplate({ database, page, gptQuery, template, accessToken });

            enqueueSnackbar("Template created successfully", { variant: "success" });
            setDatabase('');
            setPage('');
            setGptQuery('');
            setTemplate('');
        } catch (error) {
            enqueueSnackbar(error.message, { variant: "error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                <Typography variant='h5' gutterBottom >
                    Work with ChatGpt
                </Typography>

                <CustomButton ButtonName="Logout" onclickfunction={logOut} />
            </Box>

            <ComboBox database={database} setDatabase={setDatabase} databaseList={databaseList} />
            <br />
            <ComboBoxForPages page={page} setPage={setPage} pageList={pageList} />
            <br />
            <TextField
                id="outlined-multiline-static"
                label="Query chatGpt"
                multiline
                fullWidth
                rows={3}
                value={gptQuery}
                onChange={(e) => setGptQuery(e.target.value)}
            />
            <br />
            <br />
            <ComboBoxChooseTemplate template={template} setTemplate={setTemplate} templateList={templateList} />

            <br />
            <LoadingButton
                sx={{ height: 50 , width: "15em" }}
                color="secondary"
                onClick={handleCreateTemplate}
                loading={loading}
                loadingPosition="end"
                variant="contained"
            >
                <span>Create Template</span>
            </LoadingButton>

        </>
    );

}
