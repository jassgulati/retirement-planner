<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wealth - Retirement Planning</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Auth Container -->
    <div id="authContainer">
        <div class="auth-box">
            <h1>💰 Wealth</h1>
            <p>Your Personal Retirement Planner</p>
            
            <div id="loginForm">
                <h2>Login</h2>
                <input type="email" id="loginEmail" placeholder="Email">
                <input type="password" id="loginPassword" placeholder="Password">
                <button id="loginBtn" class="primary-button">Login</button>
                <p class="auth-toggle">Don't have an account? <a href="#" id="showSignup">Sign up</a></p>
            </div>
            
            <div id="signupForm" style="display: none;">
                <h2>Sign Up</h2>
                <input type="email" id="signupEmail" placeholder="Email">
                <input type="password" id="signupPassword" placeholder="Password">
                <button id="signupBtn" class="primary-button">Sign Up</button>
                <p class="auth-toggle">Already have an account? <a href="#" id="showLogin">Login</a></p>
            </div>
        </div>
    </div>

    <!-- Main App Container -->
    <div id="appContainer" style="display: none;">
        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
            <div class="nav-brand">💰 Wealth</div>
            <div class="nav-items">
                <a href="#" class="nav-item" data-page="dashboard">
                    <span class="nav-icon">📊</span>
                    <span>Overview</span>
                </a>
                <a href="#" class="nav-item" data-page="family">
                    <span class="nav-icon">👨‍👩‍👧‍👦</span>
                    <span>Family</span>
                </a>
                <a href="#" class="nav-item" data-page="income">
                    <span class="nav-icon">💵</span>
                    <span>Income</span>
                </a>
                <a href="#" class="nav-item" data-page="expenses">
                    <span class="nav-icon">💳</span>
                    <span>Expenses</span>
                </a>
                <a href="#" class="nav-item" data-page="investments">
                    <span class="nav-icon">📈</span>
                    <span>Investments</span>
                </a>
                <a href="#" class="nav-item" data-page="retirement">
                    <span class="nav-icon">🏦</span>
                    <span>Retirement</span>
                </a>
                <a href="#" class="nav-item" data-page="social-security">
                    <span class="nav-icon">🇺🇸</span>
                    <span>Social Security</span>
                </a>
                <a href="#" class="nav-item" data-page="taxes">
                    <span class="nav-icon">📝</span>
                    <span>Taxes</span>
                </a>
                <a href="#" class="nav-item" data-page="ai-assistant">
                    <span class="nav-icon">🤖</span>
                    <span>AI Assistant</span>
                </a>
                <a href="#" class="nav-item" data-page="settings">
                    <span class="nav-icon">⚙️</span>
                    <span>Settings</span>
                </a>
            </div>
            <button id="logoutBtn" class="logout-btn">Logout</button>
        </nav>

        <!-- Hamburger Menu (Mobile) -->
        <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </div>

        <!-- Mobile Nav Menu -->
        <div class="nav-menu">
            <div class="nav-menu-header">
                <h2>💰 Wealth</h2>
                <button class="close-menu">✕</button>
            </div>
            <a href="#" class="nav-menu-item" data-page="dashboard">📊 Dashboard</a>
            <a href="#" class="nav-menu-item" data-page="family">👨‍👩‍👧‍👦 Family</a>
            <a href="#" class="nav-menu-item" data-page="income">💵 Income</a>
            <a href="#" class="nav-menu-item" data-page="expenses">💳 Expenses</a>
            <a href="#" class="nav-menu-item" data-page="investments">📈 Investments</a>
            <a href="#" class="nav-menu-item" data-page="retirement">🏦 Retirement</a>
            <a href="#" class="nav-menu-item" data-page="social-security">🇺🇸 Social Security</a>
            <a href="#" class="nav-menu-item" data-page="taxes">📝 Taxes</a>
            <a href="#" class="nav-menu-item" data-page="ai-assistant">🤖 AI Assistant</a>
            <a href="#" class="nav-menu-item" data-page="settings">⚙️ Settings</a>
            <div class="nav-menu-footer">
                <button id="mobileLogoutBtn" class="logout-btn">Logout</button>
            </div>
        </div>

        <!-- Main Content -->
        <main class="main-content">
            <div id="content"></div>
        </main>

        <!-- Mobile Bottom Navigation -->
        <nav class="mobile-nav">
            <a href="#" class="mobile-nav-item" data-page="dashboard">
                <span class="mobile-nav-icon">📊</span>
                <span class="mobile-nav-label">Overview</span>
            </a>
            <a href="#" class="mobile-nav-item" data-page="investments">
                <span class="mobile-nav-icon">📈</span>
                <span class="mobile-nav-label">Invest</span>
            </a>
            <a href="#" class="mobile-nav-item" data-page="ai-assistant">
                <span class="mobile-nav-icon">🤖</span>
                <span class="mobile-nav-label">AI Help</span>
            </a>
            <a href="#" class="mobile-nav-item" data-page="expenses">
                <span class="mobile-nav-icon">💳</span>
                <span class="mobile-nav-label">Spend</span>
            </a>
        </nav>
    </div>

    <!-- Firebase and App Scripts -->
    <script type="module" src="js/config.js"></script>
    <script type="module" src="js/auth.js"></script>
    <script type="module" src="js/utils.js"></script>
    <script type="module" src="js/profile.js"></script>
    <script type="module" src="js/familyMembers.js"></script>
    <script type="module" src="js/income.js"></script>
    <script type="module" src="js/dashboard.js"></script>
    <script type="module" src="js/expenses.js"></script>
    <script type="module" src="js/investments.js"></script>
    <script type="module" src="js/retirement401k.js"></script>
    <script type="module" src="js/socialSecurity.js"></script>
    <script type="module" src="js/taxProjections.js"></script>
    <script type="module" src="js/aiAssistant.js"></script>
    <script type="module" src="js/app.js"></script>
</body>
</html>
