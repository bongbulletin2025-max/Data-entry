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
const generateReportBtn = document.getElementById('generate-report-btn');
const generateUserReportBtn = document.getElementById('generate-user-report-btn');

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
                setInterval(checkBettingTime, 10000); // Check every 10 seconds
            }
        }).catch(error => {
            alert("অ্যাডমিন ডেটা অ্যাক্সেস করতে ব্যর্থ: " + error.message);
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
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            alert("লগইন ব্যর্থ হয়েছে: " + error.code + " - " + error.message);
        });
});

logoutBtn.addEventListener('click', () => auth.signOut());
adminLogoutBtn.addEventListener('click', () => auth.signOut());

// Betting Time Check
const checkBettingTime = () => {
    const now = new Date();
    let isBettingOpen = false;

    // Find the next upcoming game
    let nextGameIndex = -1;
    for (let i = 0; i < gameSchedule.length; i++) {
        const timeStr = gameSchedule[i];
        const [time, period] = timeStr.split(' ');
        let [hour, minute] = time.split(':').map(Number);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        const gameTime = new Date();
        gameTime.setHours(hour, minute, 0, 0);

        if (now < gameTime) {
            nextGameIndex = i;
            break;
        }
    }

    if (nextGameIndex !== -1) {
        const timeStr = gameSchedule[nextGameIndex];
        const [time, period] = timeStr.split(' ');
        let [hour, minute] = time.split(':').map(Number);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        const bettingCloseTime = new Date();
        bettingCloseTime.setHours(hour, minute - 20, 0, 0);

        if (now < bettingCloseTime) {
            isBettingOpen = true;
        }
    } else {
        // All games for today are over, so allow betting for the next day's first game
        isBettingOpen = true;
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
    
    if (!singleNumber || tokens <= 0 || !auth.currentUser) {
        alert("বেট করার জন্য সিঙ্গেল নাম্বার এবং টোকেন সংখ্যা সঠিকভাবে পূরণ করুন।");
        return;
    }

    const userId = auth.currentUser.uid;
    const userRef = db.collection('users').doc(userId);
    const betTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw "ইউজার ডেটা খুঁজে পাওয়া যায়নি!";
            }
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
            } else {
                throw new Error('আপনার টোকেন যথেষ্ট নয়।');
            }
        });
        alert('আপনার বেট সফল হয়েছে!');
    } catch (error) {
        alert("বেট করতে ব্যর্থ: " + error.message);
    }
});

betPattiBtn.addEventListener('click', async () => {
    const pattiNumbers = pattiNumbersInput.value;
    const tokens = parseInt(pattiTokensInput.value);

    if (!pattiNumbers || tokens <= 0 || !auth.currentUser) {
        alert("বেট করার জন্য পাত্তি নাম্বার এবং টোকেন সংখ্যা সঠিকভাবে পূরণ করুন।");
        return;
    }
    
    const userId = auth.currentUser.uid;
    const userRef = db.collection('users').doc(userId);
    const betTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    try {
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw "ইউজার ডেটা খুঁজে পাওয়া যায়নি!";
            }
            const currentTokens = userDoc.data().tokens;

            if (currentTokens >= tokens) {
                const newTokens = currentTokens - tokens;
                transaction.update(userRef, { tokens: newTokens });
                
                const betRef = db.collection('bets').doc();
                transaction.set(betRef, {
                    userId: userId,
                    type: 'patti',
                    numbers: pattiNumbers.split(',').map(n => n.trim()),
                    tokens: tokens,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    gameTime: betTime
                });
            } else {
                throw new Error('আপনার টোকেন যথেষ্ট নয়।');
            }
        });
        alert('আপনার পাত্তি বেট সফল হয়েছে!');
    } catch (error) {
        alert("বেট করতে ব্যর্থ: " + error.message);
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

    setupGraphs();
};

// Admin User Creation
adduserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUserEmail = document.getElementById('new-user-email').value;
    const newUserPassword = document.getElementById('new-user-password').value;
    const newUserName = document.getElementById('new-user-name').value;
    const initialTokens = parseInt(document.getElementById('initial-tokens').value);

    auth.createUserWithEmailAndPassword(newUserEmail, newUserPassword)
        .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
                name: newUserName,
                email: newUserEmail,
                tokens: initialTokens,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                alert('নতুন ইউজার সফলভাবে তৈরি হয়েছে!');
            });
        })
        .catch((error) => {
            alert('ইউজার তৈরি করতে ব্যর্থ: ' + error.message);
        });
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

// New section for Graphs
const setupGraphs = () => {
    // Aggregating bet data for singles
    db.collection('bets').onSnapshot(snapshot => {
        const singleBetData = {};
        for (let i = 0; i <= 9; i++) {
            singleBetData[i] = 0;
        }

        const pattiList = new Set();
        
        snapshot.docs.forEach(doc => {
            const bet = doc.data();
            if (bet.type === 'single') {
                const number = bet.number;
                if (singleBetData[number] !== undefined) {
                    singleBetData[number] += bet.tokens;
                }
            } else if (bet.type === 'patti') {
                bet.numbers.forEach(patti => {
                    pattiList.add(patti);
                });
            }
        });

        // Update the Single Bet Chart
        const chartData = {
            labels: Object.keys(singleBetData),
            datasets: [{
                label: 'টোকেন সংখ্যা',
                data: Object.values(singleBetData),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        const config = {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        const existingChart = Chart.getChart("singleBetChart");
        if (existingChart) {
            existingChart.destroy();
        }
        
        const singleBetChart = new Chart(
            document.getElementById('singleBetChart'),
            config
        );

        // Update the Patti List
        const pattiUl = document.getElementById('pattiList');
        pattiUl.innerHTML = '';
        if (pattiList.size > 0) {
            pattiList.forEach(patti => {
                const li = document.createElement('li');
                li.textContent = patti;
                pattiUl.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'কোনো পাত্তি খেলা হয়নি।';
            pattiUl.appendChild(li);
        }
    });
};

// Report Generation
generateUserReportBtn.addEventListener('click', async () => {
    if (!auth.currentUser) {
        alert("রিপোর্ট দেখতে আপনাকে লগইন করতে হবে।");
        return;
    }
    const userId = auth.currentUser.uid;
    const bets = await db.collection('bets').where('userId', '==', userId).get();
    
    let report = "আপনার বেটিং রিপোর্ট:\n\n";
    if (bets.empty) {
        report += "কোনো বেট খুঁজে পাওয়া যায়নি।";
    } else {
        bets.docs.forEach(doc => {
            const bet = doc.data();
            report += `টাইপ: ${bet.type}\n`;
            report += `নাম্বার: ${bet.type === 'single' ? bet.number : bet.numbers.join(', ')}\n`;
            report += `টোকেন: ${bet.tokens}\n`;
            report += `সময়: ${bet.gameTime}\n`;
            report += "--------------------\n";
        });
    }
    alert(report);
});

generateReportBtn.addEventListener('click', async () => {
    if (!auth.currentUser) {
        alert("রিপোর্ট দেখতে আপনাকে লগইন করতে হবে।");
        return;
    }
    const userId = auth.currentUser.uid;
    const isAdminSnapshot = await db.collection('admins').doc(userId).get();

    if (!isAdminSnapshot.exists) {
        alert("এই রিপোর্ট দেখার অনুমতি আপনার নেই।");
        return;
    }

    const bets = await db.collection('bets').get();
    let report = "সম্পূর্ণ বেটিং রিপোর্ট:\n\n";
    if (bets.empty) {
        report += "কোনো বেট খুঁজে পাওয়া যায়নি।";
    } else {
        bets.docs.forEach(doc => {
            const bet = doc.data();
            report += `ইউজার আইডি: ${bet.userId}\n`;
            report += `টাইপ: ${bet.type}\n`;
            report += `নাম্বার: ${bet.type === 'single' ? bet.number : bet.numbers.join(', ')}\n`;
            report += `টোকেন: ${bet.tokens}\n`;
            report += `সময়: ${bet.gameTime}\n`;
            report += "--------------------\n";
        });
    }
    alert(report);
});
