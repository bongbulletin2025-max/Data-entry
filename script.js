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
const addTokenForm = document.getElementById('add-token-form');
const betOpenArea = document.getElementById('betting-open-area');
const betClosedMessage = document.getElementById('betting-closed-message');

// Time Schedule for Games (as discussed)
const gameSchedule = [
    '11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM',
    '5:00 PM', '6:30 PM', '8:00 PM', '9:00 PM'
];

// Check Auth State on Load
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('admins').doc(user.uid).get().then(doc => {
            if (doc.exists) {
                loginPage.style.display = 'none';
                mainApp.style.display = 'none';
                adminPanel.style.display = 'block';
                setupAdminPanel();
            } else {
                loginPage.style.display = 'none';
                mainApp.style.display = 'block';
                adminPanel.style.display = 'none';
                fetchUserData(user.uid);
                fetchResults();
                checkBettingTime();
                setInterval(checkBettingTime, 60000); // Check every minute
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
    auth.signInWithEmailAndPassword(username, password)
        .catch(error => {
            alert("লগইন ব্যর্থ হয়েছে: " + error.message);
        });
});

logoutBtn.addEventListener('click', () => auth.signOut());
adminLogoutBtn.addEventListener('click', () => auth.signOut());

// Betting Time Check
const checkBettingTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let isBettingOpen = false;
    for (const timeStr of gameSchedule) {
        const [time, period] = timeStr.split(' ');
        let [hour, minute] = time.split(':').map(Number);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        const betCloseHour = hour;
        const betCloseMinute = minute - 20;

        const isBeforeGame = currentHour < hour || (currentHour === hour && currentMinute < minute);
        const isAfterGameClosed = currentHour > betCloseHour || (currentHour === betCloseHour && currentMinute > betCloseMinute);

        if (isAfterGameClosed && isBeforeGame) {
            isBettingOpen = true;
            break;
        }
    }

    if (isBettingOpen) {
        betOpenArea.style.display = 'block';
        betClosedMessage.style.display = 'none';
    } else {
        betOpenArea.style.display = 'none';
        betClosedMessage.style.display = 'block';
    }
};

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
    
    gameSchedule.forEach((time, index) => {
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

// Betting Functions
betSingleBtn.addEventListener('click', async () => {
    const singleNumber = singleNumberInput.value;
    const tokens = parseInt(singleTokensInput.value);
    
    if (singleNumber && tokens > 0 && auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userRef = db.collection('users').doc(userId);
        const betTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const currentTokens = userDoc.data().tokens;

            if (currentTokens >= tokens) {
                const newTokens = currentTokens - tokens;
                transaction.update(userRef, { tokens: newTokens });
                
                const betRef = db.collection('bets').doc();
                transaction.set(betRef, {
                    userId: userId,
                    type: 'single',
                    number: singleNumber,
                    tokens: tokens,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    gameTime: betTime
                });
                alert('আপনার বেট সফল হয়েছে!');
            } else {
                alert('আপনার টোকেন যথেষ্ট নয়।');
            }
        });
    }
});

// Admin Panel Functions
const setupAdminPanel = () => {
    const resultUpdateArea = document.getElementById('result-update-area');
    resultUpdateArea.innerHTML = '';
    
    gameSchedule.forEach((time, index) => {
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
    const newUserEmail = document.getElementById('new-user-email').value;
    const newUserPassword = document.getElementById('new-user-password').value;
    const newUserName = document.getElementById('new-user-name').value;
    const initialTokens = parseInt(document.getElementById('initial-tokens').value);

    // This part requires Cloud Functions, so we will use manual creation
    alert('নতুন ইউজার তৈরির জন্য Cloud Function প্রয়োজন। অনুগ্রহ করে Firebase Authentication এ ম্যানুয়ালি ইউজার তৈরি করুন।');
});

// Admin Add Token
addTokenForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userEmail = document.getElementById('user-email-to-add-token').value;
    const tokensToAdd = parseInt(document.getElementById('tokens-to-add').value);

    try {
        const querySnapshot = await db.collection('users').where('email', '==', userEmail).get();
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userRef = userDoc.ref;
            const currentTokens = userDoc.data().tokens;
            const newTokens = currentTokens + tokensToAdd;

            await userRef.update({ tokens: newTokens });
            alert('সফলভাবে টোকেন অ্যাড করা হয়েছে!');
        } else {
            alert('এই ইমেলের কোনো ইউজার খুঁজে পাওয়া যায়নি।');
        }
    } catch (error) {
        alert('টোকেন অ্যাড করতে ব্যর্থ: ' + error.message);
    }
});

// Admin Result Update
updateResultsBtn.addEventListener('click', async () => {
    const results = [];
    gameSchedule.forEach((time, index) => {
        const patti = document.getElementById(`patti-${index}`).value;
        const single = document.getElementById(`single-${index}`).value;
        if (patti && single) {
            results.push({ patti: patti, single: single });
        }
    });
    
    if (results.length > 0) {
        try {
            await db.collection('results').doc('today').set({
                date: new Date().toLocaleDateString('bn-BD'),
                games: results
            });
            alert('ফলাফল সফলভাবে আপডেট হয়েছে!');
        } catch (error) {
            alert('ফলাফল আপডেট করতে ব্যর্থ: ' + error.message);
        }
    } else {
        alert('কোনো ফলাফল প্রবেশ করানো হয়নি!');
    }
});
