import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Box from '@mui/material/Box';
import store from './redux/store';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <SnackbarProvider maxSnack={1}>
      <Box sx={{ backgroundImage: 'linear-gradient(135deg, #153677, #4e085f)', minHeight: '100vh' }}>
        <Box sx={{ position: 'absolute', background: 'white', top: '25%', left: '20%', borderRadius: '10px', padding: '25px', width: '55%' }}>
          <App />
        </Box>
      </Box>
    </SnackbarProvider>
  </Provider>
);
