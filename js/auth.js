// ==========================================================================
// DISCORD OAUTH2 (IMPLICIT GRANT) - OBSŁUGA LOGOWANIA DLA GITHUB PAGES
// ==========================================================================

const Auth = {
    // Sprawdza czy użytkownik jest zalogowany
    isLoggedIn() {
        return !!localStorage.getItem('discord_token') && !!localStorage.getItem('discord_user');
    },

    // Zwraca dane zalogowanego użytkownika
    getUser() {
        try {
            const raw = localStorage.getItem('discord_user');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    // Zwraca token dostępowy
    getToken() {
        return localStorage.getItem('discord_token');
    },

    // Rozpoczęcie procesu logowania przez Discord
    login() {
        const clientId = CONFIG.DISCORD_CLIENT_ID;
        const redirectUri = encodeURIComponent(CONFIG.DISCORD_REDIRECT_URI);
        const scope = encodeURIComponent('identify');
        
        const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
        window.location.href = oauthUrl;
    },

    // Wylogowanie
    logout() {
        localStorage.removeItem('discord_token');
        localStorage.removeItem('discord_user');
        window.location.href = 'index.html';
    },

    // Przetwarzanie tokena z URL po powrocie z Discorda (#access_token=...)
    async handleRedirect() {
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token=')) {
            return false;
        }

        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('access_token');

        if (token) {
            localStorage.setItem('discord_token', token);
            // Usuwamy hash z paska adresu
            history.replaceState(null, null, window.location.pathname);

            // Pobieramy dane użytkownika z API Discorda
            await this.fetchUserProfile(token);
            return true;
        }
        return false;
    },

    // Pobranie profilu użytkownika (ID, nick, avatar)
    async fetchUserProfile(token) {
        try {
            const response = await fetch('https://discord.com/api/v10/users/@me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Nie udało się pobrać profilu Discord.');
            }

            const user = await response.json();
            
            // Przygotowanie linku do avatara
            const avatarUrl = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0') % 5}.png`;

            const userData = {
                id: user.id,
                username: user.username,
                global_name: user.global_name || user.username,
                avatar: avatarUrl
            };

            localStorage.setItem('discord_user', JSON.stringify(userData));
            return userData;
        } catch (err) {
            console.error('Błąd autoryzacji Discord:', err);
            this.logout();
            return null;
        }
    },

    // Aktualizacja widoku nawigacji w zależności od stanu zalogowania
    renderNavUser() {
        const container = document.getElementById('nav-user-container');
        if (!container) return;

        if (this.isLoggedIn()) {
            const user = this.getUser();
            container.innerHTML = `
                <div class="user-profile-badge">
                    <img src="${user.avatar}" alt="Avatar" class="user-avatar">
                    <span class="user-name">${user.global_name || user.username}</span>
                    <button class="btn-logout" title="Wyloguj się" onclick="Auth.logout()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button class="btn btn-discord btn-sm" onclick="Auth.login()">
                    <svg width="20" height="16" viewBox="0 0 127.14 96.36" fill="currentColor">
                        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.86,53,48.83,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                    </svg>
                    Zaloguj przez Discord
                </button>
            `;
        }
    }
};

// Automatyczna inicjalizacja po załadowaniu skryptu
window.addEventListener('DOMContentLoaded', async () => {
    await Auth.handleRedirect();
    Auth.renderNavUser();
});
