// আপনার Firebase কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyDMrTQqAao4-zLcCTqlPnUi019muQK9kvE",
  authDomain: "data-entry-3b50f.firebaseapp.com",
  projectId: "data-entry-3b50f",
  storageBucket: "data-entry-3b50f.firebasestorage.app",
  messagingSenderId: "1022730252825",
  appId: "1:1022730252825:web:b3a85e4f7d55e62d15f088",
  measurementId: "G-2KJP9Q59XP"
};

// Firebase SDK এবং ভেরিয়েবল
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
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
const historyList = document.getElementById('history-list');

// Firebase Auth State Observer
auth.onAuthStateChanged(user => {
    if (user) {
        loginPage.style.display = 'none';
        mainApp.style.display = 'block';
        fetchUserData(user.uid);
        fetchResults();
    } else {
        loginPage.style.display = 'flex';
        mainApp.style.display = 'none';
    }
});

// লগইন ফাংশন
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    auth.signInWithEmailAndPassword(username + '@example.com', password)
        .then(() => {
            console.log("Logged in successfully!");
        })
        .catch(error => {
            alert("লগইন ব্যর্থ হয়েছে: " + error.message);
        });
});

// লগআউট ফাংশন
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// ইউজার ডেটা Fetch করা
const fetchUserData = (userId) => {
    db.collection('users').doc(userId).onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            userNameSpan.textContent = data.name;
            userTokensSpan.textContent = data.tokens;
            fetchHistory(userId);
        }
    });
};

// আজকের রেজাল্ট Fetch করা
const fetchResults = () => {
    db.collection('results').doc('today').onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            resultDateSpan.textContent = data.date;
            renderResults(data.games);
        }
    });
};

// রেজাল্ট ডিসপ্লে ফাংশন
const renderResults = (results) => {
    resultsContainer.innerHTML = '';
    results.forEach(result => {
        const resultBox = document.createElement('div');
        resultBox.className = 'result-box';
        resultBox.innerHTML = `
            <h3>${result.patti}</h3>
            <p>${result.single}</p>
        `;
        resultsContainer.appendChild(resultBox);
    });
};

// টোকেন হিস্ট্রি Fetch করার ফাংশন
const fetchHistory = (userId) => {
    // এখানে টোকেন হিস্ট্রি Fetch করার লজিক থাকবে
};

// বেট করার ফাংশন (সিঙ্গেল)
betSingleBtn.addEventListener('click', () => {
    const number = singleNumberInput.value;
    const tokens = parseInt(singleTokensInput.value);
    
    if (auth.currentUser && number && tokens > 0) {
        // ডেটাবেসে বেট যুক্ত করা
        db.collection('bets').add({
            userId: auth.currentUser.uid,
            betType: 'single',
            number: number,
            tokens: tokens,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert('আপনার বেট সফল হয়েছে!');
            // টোকেন মাইনাস করার লজিক এখানে থাকবে
        }).catch(error => {
            alert('বেট করতে ব্যর্থ হয়েছে: ' + error.message);
        });
    } else {
        alert('সঠিক নাম্বার ও টোকেন দিন।');
    }
});

// বেট করার ফাংশন (পাত্তি)
betPattiBtn.addEventListener('click', () => {
    const numbers = pattiNumbersInput.value;
    const tokens = parseInt(pattiTokensInput.value);

    if (auth.currentUser && numbers && tokens > 0) {
        const pattiList = numbers.split(',').map(s => s.trim());
        // ডেটাবেসে বেট যুক্ত করা
        db.collection('bets').add({
            userId: auth.currentUser.uid,
            betType: 'patti',
            numbers: pattiList,
            tokens: tokens,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert('আপনার বেট সফল হয়েছে!');
            // টোকেন মাইনাস করার লজিক এখানে থাকবে
        }).catch(error => {
            alert('বেট করতে ব্যর্থ হয়েছে: ' + error.message);
        });
    } else {
        alert('সঠিক পাত্তি নাম্বার ও টোকেন দিন।');
    }
});
