const ACCESS_TOKEN_KEY = 'access_token';

// localStorage stores strings, so a null token previously round-tripped as the
// literal "null"/"undefined", which every truthiness check read as logged-in.
// Centralise read/write so that can't happen again.
export function readAccessToken() {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!stored || stored === 'null' || stored === 'undefined') {
        return null;
    }
    return stored;
}

export function writeAccessToken(token) {
    if (!token) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function logOut() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.location.pathname = '/';
}
