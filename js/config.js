// Konfiguracja panelu EMS (Frontend)
const CONFIG = {
    // ----------------------------------------------------
    // 1. DISCORD OAUTH2
    // ----------------------------------------------------
    // Twój Client ID z Discord Developer Portal (taki sam jak w bocie):
    DISCORD_CLIENT_ID: "1429913156561539153",

    // Adres przekierowania po zalogowaniu:
    // Podczas testów lokalnych: "http://localhost:5500/index.html" (lub "http://127.0.0.1:5500/index.html")
    // Na GitHub Pages: "https://twoj-login.github.io/nazwa-repo/index.html"
    // PAMIĘTAJ: Musisz dodać ten sam adres w Discord Developer Portal -> OAuth2 -> Redirects!
    DISCORD_REDIRECT_URI: "https://ems.ggone.pl/index.html",

    // ----------------------------------------------------
    // 2. FIREBASE CONFIG (Darmowy plan Spark)
    // ----------------------------------------------------
    // Skopiuj te dane z konsoli Firebase (https://console.firebase.google.com):
    // Projekt -> Ustawienia projektu -> Twoje aplikacje (Web)
    FIREBASE: {
        apiKey: "AIzaSyAUOznjjzTi8K5Z3wyrgZ5zhMWHG3mvKtQ",
        authDomain: "emsweb-8e95a.firebaseapp.com",
        projectId: "emsweb-8e95a",
        storageBucket: "emsweb-8e95a.firebasestorage.app",
        messagingSenderId: "883420755776",
        appId: "1:883420755776:web:a20747df364830a9e62ca5"
    },

    // ----------------------------------------------------
    // 3. INFORMACJE O FRAKCJI
    // ----------------------------------------------------
    FRACTION_NAME: "Emergency Medical Services",
    FRACTION_SHORT: "EMS",
    LOGO_URL: "https://cdn.discordapp.com/attachments/1562865685892300807/1563229746907582514/fe893a14-58b1-4fd5-a384-e473c31a2f30.png?ex=6adcdea7&is=6adb8d27&hm=33d013d265277b126371acc8de5268392aa396c3f26413c2d23929b20d987191&"
};
