import axios from 'axios';
import { config } from "../App";

// Surfaces the server's JSON `message` instead of axios's generic
// "Request failed with status code 500".
function toError(error, fallback) {
    const message = error?.response?.data?.message || error?.message || fallback;
    return new Error(message);
}

export async function getDatabaseList(access_token) {
    const api = `${config.endpoint}/notion/databaseList/${access_token}`;
    try {
        const response = await axios.get(api);
        return response.data?.data ?? [];
    } catch (error) {
        throw toError(error, 'Could not load your Notion databases');
    }
}

export async function getPageList(access_token) {
    const api = `${config.endpoint}/notion/pageList/${access_token}`;
    try {
        const response = await axios.get(api);
        return response.data?.data ?? [];
    } catch (error) {
        throw toError(error, 'Could not load your Notion pages');
    }
}

export async function postOauthCode(code) {
    const api = `${config.endpoint}/notion/createOauthToken`;
    try {
        const response = await axios.post(api, { auth_code: code });
        return response.data?.data?.access_token ?? null;
    } catch (error) {
        throw toError(error, 'Notion sign-in failed');
    }
}

export async function createTemplate(body) {
    const api = `${config.endpoint}/notion/template`;
    try {
        const response = await axios.post(api, body);
        return response.data?.data ?? null;
    } catch (error) {
        throw toError(error, 'Could not create the template');
    }
}
