// Firebase SDKs and variables
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements for both User and Admin views
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const userNameSpan = document.getElementById('user-name');
const userTokensSpan = document.getElementById('user-tokens');
const resultDateSpan = document.getElementById('result-date');
const resultsContainer = document.getElementById('results-container');
const betSingleBtn = document.getElementById('bet-single-btn');
const betPattiBtn = document.getElementById('bet-patti-btn');
const singleNumberInput = document.getElementById('single-number');
const singleTokensInput = document.getElementById('single-tokens');
const pattiNumbersInput = document.getElementById('patti-numbers');
const pattiTokensInput = document.getElementById('patti-tokens');
const adduserForm = document.getElementById('add-user-form');
const updateResultsBtn = document.getElementById('update-results-btn');

// Time Schedule for Games (as discussed)
const gameSchedule = {
    '11:00 AM': null, '12:30 PM': null, '2:00 PM': null, '3:30 PM': null,
    '5:00 PM': null, '6:30 PM': null, '8:00 PM': null, '9:00 PM': null
};

// Check Auth State on Load
auth.onAuthStateChanged(user => {
    if (user) {
        // Check if user is an Admin
        db.collection('admins').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                // Show Admin Panel
                loginPage.style.display = 'none';
                mainApp.style.display = 'none';
                adminPanel.style.display = 'block';
                setupAdminPanel();
            } else {
                // Show User App
                loginPage.style.display = 'none';
                mainApp.style.display = 'block';
                adminPanel.style.display = 'none';
                fetchUserData(user.uid);
                fetchResults();
            }
        });
    } else {
        loginPage.style.display = 'flex';
        mainApp.style.display = 'none';
        adminPanel.style.display = 'none';
    }
});

// Login and Logout Functions
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(username + '@example.com', password)
        .catch(error => alert("লগইন ব্যর্থ হয়েছে: " + error.message));
});

logoutBtn.addEventListener('click', () => auth.signOut());
adminLogoutBtn.addEventListener('click', () => auth.signOut());

// User App Functions
const fetchUserData = (userId) => {
    db.collection('users').doc(userId).onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            userNameSpan.textContent = data.name;
            userTokensSpan.textContent = data.tokens;
        }
    });
};

const fetchResults = () => {
    db.collection('results').doc('today').onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            resultDateSpan.textContent = data.date;
            renderResults(data.games);
        }
    });
};

const renderResults = (results) => {
    resultsContainer.innerHTML = '';
    const sortedKeys = Object.keys(gameSchedule).sort();
    
    sortedKeys.forEach((time, index) => {
        const result = results[index];
        const resultBox = document.createElement('div');
        resultBox.className = 'result-box';
        resultBox.innerHTML = `
            <h3>${result ? result.patti : '---'}</h3>
            <p>${result ? result.single : '---'}</p>
            <small>${time}</small>
        `;
        resultsContainer.appendChild(resultBox);
    });
};

// Admin Panel Functions
const setupAdminPanel = () => {
    const resultUpdateArea = document.getElementById('result-update-area');
    resultUpdateArea.innerHTML = '';
    
    Object.keys(gameSchedule).forEach((time, index) => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'bet-input-group';
        inputGroup.innerHTML = `
            <h3>${time}</h3>
            <label for="patti-${index}">পাত্তি:</label>
            <input type="text" id="patti-${index}" placeholder="যেমন: 123">
            <label for="single-${index}">সিঙ্গেল:</label>
            <input type="text" id="single-${index}" placeholder="যেমন: 7">
        `;
        resultUpdateArea.appendChild(inputGroup);
    });
};

// Admin User Creation
adduserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    const initialTokens = parseInt(document.getElementById('initial-tokens').value);
    
    // Using an admin Cloud Function for user creation (this part needs backend)
    alert('এই ফাংশনের জন্য Cloud Function প্রয়োজন। Firebase-এ ম্যানুয়ালি ইউজার তৈরি করুন।');
});

// Admin Result Update
updateResultsBtn.addEventListener('click', () => {
    const results = [];
    Object.keys(gameSchedule).forEach((time, index) => {
        const patti = document.getElementById(`patti-${index}`).value;
        const single = document.getElementById(`single-${index}`).value;
        if (patti && single) {
            results.push({ patti: patti, single: single });
        }
    });
    
    if (results.length > 0) {
        db.collection('results').doc('today').set({
            date: new Date().toLocaleDateString('bn-BD'),
            games: results
        }).then(() => {
            alert('ফলাফল সফলভাবে আপডেট হয়েছে!');
        }).catch(error => {
            alert('ফলাফল আপডেট করতে ব্যর্থ: ' + error.message);
        });
    } else {
        alert('কোনো ফলাফল প্রবেশ করানো হয়নি!');
    }
});
// Firebase SDKs and variables
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements for both User and Admin views
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const userNameSpan = document.getElementById('user-name');
const userTokensSpan = document.getElementById('user-tokens');
const resultDateSpan = document.getElementById('result-date');
const resultsContainer = document.getElementById('results-container');
const betSingleBtn = document.getElementById('bet-single-btn');
const betPattiBtn = document.getElementById('bet-patti-btn');
const singleNumberInput = document.getElementById('single-number');
const singleTokensInput = document.getElementById('single-tokens');
const pattiNumbersInput = document.getElementById('patti-numbers');
const pattiTokensInput = document.getElementById('patti-tokens');
const adduserForm = document.getElementById('add-user-form');
const updateResultsBtn = document.getElementById('update-results-btn');

// Time Schedule for Games (as discussed)
const gameSchedule = {
    '11:00 AM': null, '12:30 PM': null, '2:00 PM': null, '3:30 PM': null,
    '5:00 PM': null, '6:30 PM': null, '8:00 PM': null, '9:00 PM': null
};

// Check Auth State on Load
auth.onAuthStateChanged(user => {
    if (user) {
        // Check if user is an Admin
        db.collection('admins').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                // Show Admin Panel
                loginPage.style.display = 'none';
                mainApp.style.display = 'none';
                adminPanel.style.display = 'block';
                setupAdminPanel();
            } else {
                // Show User App
                loginPage.style.display = 'none';
                mainApp.style.display = 'block';
                adminPanel.style.display = 'none';
                fetchUserData(user.uid);
                fetchResults();
            }
        });
    } else {
        loginPage.style.display = 'flex';
        mainApp.style.display = 'none';
        adminPanel.style.display = 'none';
    }
});

// Login and Logout Functions
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(username + '@example.com', password)
        .catch(error => alert("লগইন ব্যর্থ হয়েছে: " + error.message));
});

logoutBtn.addEventListener('click', () => auth.signOut());
adminLogoutBtn.addEventListener('click', () => auth.signOut());

// User App Functions
const fetchUserData = (userId) => {
    db.collection('users').doc(userId).onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            userNameSpan.textContent = data.name;
            userTokensSpan.textContent = data.tokens;
        }
    });
};

const fetchResults = () => {
    db.collection('results').doc('today').onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            resultDateSpan.textContent = data.date;
            renderResults(data.games);
        }
    });
};

const renderResults = (results) => {
    resultsContainer.innerHTML = '';
    const sortedKeys = Object.keys(gameSchedule).sort();
    
    sortedKeys.forEach((time, index) => {
        const result = results[index];
        const resultBox = document.createElement('div');
        resultBox.className = 'result-box';
        resultBox.innerHTML = `
            <h3>${result ? result.patti : '---'}</h3>
            <p>${result ? result.single : '---'}</p>
            <small>${time}</small>
        `;
        resultsContainer.appendChild(resultBox);
    });
};

// Admin Panel Functions
const setupAdminPanel = () => {
    const resultUpdateArea = document.getElementById('result-update-area');
    resultUpdateArea.innerHTML = '';
    
    Object.keys(gameSchedule).forEach((time, index) => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'bet-input-group';
        inputGroup.innerHTML = `
            <h3>${time}</h3>
            <label for="patti-${index}">পাত্তি:</label>
            <input type="text" id="patti-${index}" placeholder="যেমন: 123">
            <label for="single-${index}">সিঙ্গেল:</label>
            <input type="text" id="single-${index}" placeholder="যেমন: 7">
        `;
        resultUpdateArea.appendChild(inputGroup);
    });
};

// Admin User Creation
adduserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    const initialTokens = parseInt(document.getElementById('initial-tokens').value);
    
    // Using an admin Cloud Function for user creation (this part needs backend)
    alert('এই ফাংশনের জন্য Cloud Function প্রয়োজন। Firebase-এ ম্যানুয়ালি ইউজার তৈরি করুন।');
});

// Admin Result Update
updateResultsBtn.addEventListener('click', () => {
    const results = [];
    Object.keys(gameSchedule).forEach((time, index) => {
        const patti = document.getElementById(`patti-${index}`).value;
        const single = document.getElementById(`single-${index}`).value;
        if (patti && single) {
            results.push({ patti: patti, single: single });
        }
    });
    
    if (results.length > 0) {
        db.collection('results').doc('today').set({
            date: new Date().toLocaleDateString('bn-BD'),
            games: results
        }).then(() => {
            alert('ফলাফল সফলভাবে আপডেট হয়েছে!');
        }).catch(error => {
            alert('ফলাফল আপডেট করতে ব্যর্থ: ' + error.message);
        });
    } else {
        alert('কোনো ফলাফল প্রবেশ করানো হয়নি!');
    }
});
