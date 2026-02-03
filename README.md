# Retirement Planning App - Modular Version

A comprehensive retirement planning application with modular architecture for better maintainability and performance.

## 📁 Project Structure

```
retirement-app/
├── index.html              # Main HTML with UI structure
├── app.js                  # Main application & routing
├── config.js               # Firebase config & app constants
├── utils.js                # Shared utility functions
├── auth.js                 # Authentication module
├── familyMembers.js        # Family member management
├── income.js               # Income tracking
├── expenses.js             # Expense management
├── investments.js          # Investment portfolio tracking
├── retirement401k.js       # 401(k) and IRA management
├── socialSecurity.js       # Social Security calculations
├── taxProjections.js       # Tax planning & projections
└── dashboard.js            # Dashboard overview
```

## 🚀 Features

### Core Features
- **Family Management**: Track family members and their ages
- **Income Tracking**: Multiple income sources with growth rates
- **Expense Management**: Categorized expense tracking
- **Investment Portfolio**: Track investments with projections
- **401(k)/IRA Management**: Comprehensive retirement account tracking
- **Social Security**: Benefit calculations with claiming strategies
- **Tax Planning**: Tax brackets and retirement tax strategies
- **Dashboard**: Complete financial overview

### Technical Features
- Modular architecture for better performance
- Firebase authentication and realtime database
- Responsive design
- Real-time calculations
- Data persistence

## 🔧 Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Email/Password authentication
4. Create a Realtime Database
5. Set database rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

6. Get your Firebase config from Project Settings

### 2. Configuration

Edit `config.js` and add your Firebase credentials:

```javascript
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Deployment Options

#### Option A: GitHub Pages

1. Create a GitHub repository
2. Push all files to the repository
3. Go to Settings > Pages
4. Set source to "main" branch, root directory
5. Save and wait for deployment

#### Option B: Local Development

1. Use a local web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

2. Open `http://localhost:8000` in your browser

#### Option C: Other Hosting

Upload all files to any web hosting service that supports static sites:
- Netlify
- Vercel
- Firebase Hosting
- AWS S3

## 📝 Usage Guide

### Getting Started

1. **Sign Up**: Create an account with email and password
2. **Add Family Members**: Start by adding family members in the Family tab
3. **Track Income**: Add all income sources
4. **Record Expenses**: Input monthly expenses by category
5. **Add Investments**: Track investment portfolios
6. **Add Retirement Accounts**: Input 401(k), IRA accounts
7. **Social Security**: Add SS benefit estimates
8. **Review Dashboard**: Check your retirement readiness

### Key Calculations

- **4% Rule**: Safe withdrawal rate for retirement savings
- **Social Security Adjustments**: Early/delayed claiming impacts
- **Investment Projections**: Compound growth calculations
- **401(k) Employer Match**: Automatic matching calculations
- **Income Replacement**: Retirement income vs. expenses

## 🔒 Security

- All user data is stored in Firebase with user-specific access rules
- Authentication required for all data access
- No data sharing between users
- Secure password requirements

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure all files are in the same directory
   - Check that file names match exactly (case-sensitive)
   - Use a proper web server (not just file:// protocol)

2. **Firebase connection errors**
   - Verify Firebase config in `config.js`
   - Check Firebase project settings
   - Ensure database rules are set correctly

3. **Data not saving**
   - Check browser console for errors
   - Verify you're logged in
   - Check Firebase database rules

4. **Slow performance**
   - Clear browser cache
   - Check Firebase database size
   - Ensure good internet connection

## 📊 Module Descriptions

### utils.js
Shared functions: formatting, calculations, validation

### auth.js
User authentication: login, signup, logout

### familyMembers.js
Family member CRUD operations and age calculations

### income.js
Income source management with growth projections

### expenses.js
Expense tracking by category with summaries

### investments.js
Investment portfolio with performance tracking

### retirement401k.js
401(k)/IRA management with employer matching

### socialSecurity.js
SS benefit calculations with claiming strategies

### taxProjections.js
Tax bracket information and planning tools

### dashboard.js
Comprehensive overview with all financial metrics

## 🔄 Updates & Maintenance

### Adding New Features

1. Create a new module file (e.g., `newFeature.js`)
2. Import in `index.html` before `app.js`
3. Add navigation tab in `index.html`
4. Add page container in `index.html`
5. Create render function
6. Add to `app.js` switch statement

### Modifying Calculations

- Calculation functions are in `utils.js`
- Module-specific calculations in respective modules
- Update `APP_CONFIG` in `config.js` for constants

## 📈 Future Enhancements

Potential features to add:
- [ ] Health Savings Account (HSA) tracking
- [ ] Pension calculations
- [ ] Real estate investment tracking
- [ ] Debt payoff planner
- [ ] Monte Carlo simulations
- [ ] Charts and visualizations
- [ ] PDF report generation
- [ ] Data export/import
- [ ] Multi-currency support

## 💡 Tips

1. **Regular Updates**: Update balances monthly or quarterly
2. **Review Projections**: Adjust assumptions based on actual returns
3. **Maximize Matching**: Ensure you're getting full employer match
4. **Tax Optimization**: Balance traditional and Roth contributions
5. **Diversification**: Spread investments across asset classes

## 📄 License

This project is open source and available for personal use.

## 🤝 Contributing

Feel free to fork, modify, and enhance this application for your needs!

---

**Note**: This application provides general planning tools and should not replace professional financial advice. Consult with a qualified financial advisor for personalized guidance.
