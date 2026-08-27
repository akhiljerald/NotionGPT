import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import { AlreadyLoggedIn } from './pages/Login';
import Home from './pages/Home';
import Database from './pages/Database';
import Gpt from './pages/Gpt';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAccessTokenToLocalStorage } from './redux/slice';
import { readAccessToken } from './utilities/helperFunctions';

const notionClientId = import.meta.env.VITE_NOTION_CLIENT_ID;
const oauthRedirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI || 'http://localhost:3000/home/';

export const config = {
  endpoint: import.meta.env.VITE_API_ENDPOINT || "http://localhost:8081/v1",
  // Built from env so the client id isn't baked into source. Note that a
  // client id is public by design; the matching *secret* stays server-side.
  notionAuthUrl: notionClientId
    ? `https://api.notion.com/v1/oauth/authorize?client_id=${notionClientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(oauthRedirectUri)}`
    : '',
};

function App() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.localStorageReducer.access_token) || readAccessToken();

  useEffect(() => {
    dispatch(addAccessTokenToLocalStorage({ access_token: accessToken }));
  }, [dispatch, accessToken]);

  const isLoggedIn = Boolean(accessToken);

  return (
    <Router>
      <Routes>
        {
          isLoggedIn
            ? (
              <>
                <Route path="/" element={<AlreadyLoggedIn />} />
                <Route path="/home" element={<Home />} />
                <Route path="/home/database" element={<Database />} />
                <Route path="/home/chatgpt" element={<Gpt />} />
              </>
            )
            : (
              <>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
              </>
            )
        }
      </Routes>
    </Router>
  );
}

export default App;
