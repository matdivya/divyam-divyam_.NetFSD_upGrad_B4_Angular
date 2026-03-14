// main.js - Common UI layout logic (Navbar injection)

const createNavbar = () => {
    const isAuth = auth.isAuthenticated;
    const navContent = `
        <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top">
            <div class="container">
                <a class="navbar-brand" href="index.html">UpGrad Events</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="index.html">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${isAuth ? 'admin_events.html' : 'login.html'}">Events</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="contact.html">Contact Us</a>
                        </li>
                        ${isAuth ? `
                        <li class="nav-item">
                            <a class="nav-link text-danger" href="#" onclick="auth.logout()">Logout</a>
                        </li>` : `
                        <li class="nav-item">
                            <a class="nav-link" href="login.html">Login</a>
                        </li>
                        `}
                    </ul>
                </div>
            </div>
        </nav>
    `;

    document.getElementById('navbar-container').innerHTML = navContent;
    
    // Set active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
            link.style.fontWeight = 'bold';
            link.style.color = '#0d6efd';
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Only initialized DB here if we need it immediately. Usually we do.
    db.init().then(() => {
        console.log("DB Initialized");
        // Dispatch custom event when DB is ready
        document.dispatchEvent(new Event('dbReady'));
    }).catch(err => {
        console.error("Failed to init DB", err);
    });

    if (document.getElementById('navbar-container')) {
        createNavbar();
    }
});
