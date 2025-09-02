// এই কোডটি আপাতত শুধু ফ্রন্টএন্ডের কাজ করবে।
// গুগল ফায়ারবেসের সঙ্গে সংযোগের জন্য পরবর্তী ধাপে কোড যুক্ত করা হবে।

document.addEventListener('DOMContentLoaded', () => {
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
    
    // ডেমো ডেটা: পরবর্তীতে Firebase থেকে আসবে
    const fakeUserData = {
        name: 'Demo User',
        tokens: 1500,
    };

    const fakeResults = [
        { patti: '567', single: '7' },
        { patti: '222', single: '6' },
        { patti: '244', single: '0' },
        { patti: '180', single: '9' },
        { patti: '145', single: '0' },
        { patti: '238', single: '3' },
        { patti: '450', single: '9' },
        { patti: '110', single: '2' },
    ];

    // লগইন ফাংশন
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // এখানে আমরা ফায়ারবেস অথেন্টিকেশন ব্যবহার করব।
        // আপাতত এটি একটি ডেমো লগইন।
        if (username === 'test' && password === '123') {
            loginPage.style.display = 'none';
            mainApp.style.display = 'block';
            userNameSpan.textContent = fakeUserData.name;
            userTokensSpan.textContent = fakeUserData.tokens;
            renderResults();
        } else {
            alert('ভুল ইউজারনেম বা পাসওয়ার্ড!');
        }
    });

    // লগআউট ফাংশন
    logoutBtn.addEventListener('click', () => {
        loginPage.style.display = 'flex';
        mainApp.style.display = 'none';
        loginForm.reset();
    });

    // রেজাল্ট ডিসপ্লে ফাংশন
    const renderResults = () => {
        resultDateSpan.textContent = new Date().toLocaleDateString('bn-BD');
        resultsContainer.innerHTML = '';
        fakeResults.forEach(result => {
            const resultBox = document.createElement('div');
            resultBox.className = 'result-box';
            resultBox.innerHTML = `
                <h3>${result.patti}</h3>
                <p>${result.single}</p>
            `;
            resultsContainer.appendChild(resultBox);
        });
    };

    // বেটিং ফাংশন (সিঙ্গেল নাম্বার)
    betSingleBtn.addEventListener('click', () => {
        const number = singleNumberInput.value;
        const tokens = parseInt(singleTokensInput.value);

        if (number && tokens > 0) {
            alert(`সিঙ্গেল নাম্বার ${number}-এ ${tokens} টোকেন বেট করা হয়েছে।`);
            // এখানে Firebase এ ডেটা লেখার লজিক থাকবে
        } else {
            alert('সঠিক নাম্বার ও টোকেন দিন।');
        }
    });

    // বেটিং ফাংশন (পাত্তি নাম্বার)
    betPattiBtn.addEventListener('click', () => {
        const numbers = pattiNumbersInput.value;
        const tokens = parseInt(pattiTokensInput.value);

        if (numbers && tokens > 0) {
            const pattiList = numbers.split(',').map(s => s.trim());
            alert(`পাত্তি ${pattiList.join(', ')} তে ${tokens} টোকেন বেট করা হয়েছে।`);
            // এখানে Firebase এ ডেটা লেখার লজিক থাকবে
        } else {
            alert('সঠিক পাত্তি নাম্বার ও টোকেন দিন।');
        }
    });

    // রিপোর্ট জেনারেট ফাংশন (পরবর্তীতে সম্পূর্ণ করা হবে)
    const generateReportBtn = document.getElementById('generate-report-btn');
    generateReportBtn.addEventListener('click', () => {
        alert('রিপোর্ট জেনারেট করা হচ্ছে...');
        // এখানে Firebase থেকে ডেটা নিয়ে রিপোর্ট তৈরির লজিক থাকবে।
    });
});
