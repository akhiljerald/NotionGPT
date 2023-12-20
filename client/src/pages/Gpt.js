import React, { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { getDatabaseList, getPageList } from '../api/notion';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { config } from '../App';
import { useSelector } from 'react-redux';

const templateList = [
    'carrerCoach',
    'template2',
    'template3'
]

export function ComboBox({ databaseList, database, setDatabase }) {
    const handleChange = (event, value) => {
        const selectedDatabase = databaseList.find(item => item.databaseTitle === value);
        if (selectedDatabase) {
            const plainId = selectedDatabase.databaseId.replace(/-/g, '');
            setDatabase(plainId);
        }
    };

    return (
        <Box width="100%">
            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={databaseList.map(item => item.databaseTitle)}
                sx={{ width: '100%' }}
                value={databaseList.find(item => item.databaseId === database)?.databaseTitle || ''}
                onChange={handleChange}
                renderInput={(params) => <TextField {...params} label="Databases" />}
            />
        </Box>
    );
}


export function ComboBoxForPages({ pageList, page, setPage }) {
    const handleChange = (event, value) => {
        const selectedPage = pageList.find(item => item.pageTitle === value);
        if (selectedPage) {
            const plainId = selectedPage.pageId.replace(/-/g, '');
            setPage(plainId);
        }
    };

    const filteredPages = pageList.filter(item => item.pageTitle !== 'undefinedPageTitle');
    const pageTitles = filteredPages.map(item => item.pageTitle);

    return (
        <Box width="100%">
            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={pageTitles}
                sx={{ width: '100%' }}
                value={pageList.find(item => item.pageId === page)?.pageTitle || ''}
                onChange={handleChange}
                renderInput={(params) => <TextField {...params} label="pages" />}
            />
        </Box>
    );
}



export function ComboBoxChooseTemplate({ templateList, template, setTemplate }) {
    return (
        <Box width="100%">
            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={templateList}
                sx={{ width: '100%' }}
                value={template}
                onChange={(event, value) => setTemplate(value)}
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

    const accessToken = useSelector((state) => state.localStorageReducer.access_token) || localStorage.getItem('access_token');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const databaseListData = await getDatabaseList(accessToken);
                const pageListData = await getPageList(accessToken);
                setDatabaseList(databaseListData);
                setPageList(pageListData);
            } catch (error) {
                console.error('Error fetching database/page list:', error);
            }
        };

        fetchData();
    }, [])

    console.log("accessToken inside Gpt.js : ", accessToken);

    const handleCreateTemplate = async (event) => {

        const api = `${config.endpoint}/notion/template`;
        try {
            const body = {
                database,
                page,
                gptQuery,
                template
            }
            const response = axios.post(api, body);
            console.log("response");
            console.log(response);
            setDatabase('');
            setPage('');
            setGptQuery('');
            setTemplate('');

        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Typography variant='button' gutterBottom sx={{ display: 'flex', justifyContent: 'center' }}>
                Work with ChatGpt
            </Typography>
            {databaseList && (
                <>
                    <ComboBox database={database} setDatabase={setDatabase} databaseList={databaseList} />
                    <br />
                </>
            )}
            {pageList && (
                <>
                    <ComboBoxForPages page={page} setPage={setPage} pageList={pageList} />
                    <br />
                </>
            )}
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
            <Button variant="contained" color="secondary" sx={{ height: 50 }} onClick={handleCreateTemplate} >Create Template</Button>

        </>
    );

}
