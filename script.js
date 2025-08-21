document.addEventListener('DOMContentLoaded', () => {
    // --- Login Page Logic ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;
            const loginMessage = document.getElementById('loginMessage');
            
            // Hardcoded credentials for demonstration
            if (username === "admin" && password === "12345") {
                localStorage.setItem('isLoggedIn', 'true');
                loginMessage.textContent = 'লগইন সফল! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...';
                loginMessage.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                loginMessage.textContent = 'ভুল ইউজারনেম বা পাসওয়ার্ড।';
                loginMessage.style.color = 'red';
            }
        });
    }

    // --- Dashboard Logic ---
    if (window.location.pathname.includes('dashboard.html')) {
        // Check for login status
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'index.html';
            return;
        }

        // --- Logout Logic ---
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });

        // --- Digital Clock ---
        function updateClock() {
            const now = new Date();
            const time = now.toLocaleTimeString('bn-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            document.getElementById('digital-clock').textContent = time;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // --- Data Storage Simulation (Using localStorage) ---
        let dealers = JSON.parse(localStorage.getItem('dealers')) || [];
        let entries = JSON.parse(localStorage.getItem('entries')) || [];
        
        const dealerSelect = document.getElementById('dealerSelect');
        const reportDealerSelect = document.getElementById('reportDealerSelect');
        
        function saveToLocalStorage() {
            localStorage.setItem('dealers', JSON.stringify(dealers));
            localStorage.setItem('entries', JSON.stringify(entries));
        }

        // --- Dealer Management ---
        function loadDealers() {
            dealerSelect.innerHTML = '<option value="">ডিলার সিলেক্ট করুন</option>';
            reportDealerSelect.innerHTML = '<option value="">ডিলার সিলেক্ট করুন</option>';
            dealers.forEach(dealer => {
                const option = document.createElement('option');
                option.value = dealer.id;
                option.textContent = `${dealer.name} (${dealer.phone})`;
                dealerSelect.appendChild(option);
                reportDealerSelect.appendChild(option.cloneNode(true));
            });
        }
        
        document.getElementById('registerDealerBtn').addEventListener('click', () => {
            const name = document.getElementById('dealerName').value.trim();
            const phone = document.getElementById('dealerPhone').value.trim();
            if (name && phone) {
                const newDealer = { id: Date.now(), name, phone };
                dealers.push(newDealer);
                saveToLocalStorage();
                loadDealers();
                document.getElementById('dealerName').value = '';
                document.getElementById('dealerPhone').value = '';
                alert('ডিলার সফলভাবে রেজিস্টার করা হয়েছে!');
            } else {
                alert('অনুগ্রহ করে নাম এবং ফোন নাম্বার লিখুন।');
            }
        });
        
        // Initial load of dealers
        loadDealers();

        // --- Time-based Baji Selection Logic ---
        const bajiSchedule = [
            { name: "1st Baji", time: "11:00" },
            { name: "2nd Baji", time: "12:30" },
            { name: "3rd Baji", time: "14:00" },
            { name: "4th Baji", time: "15:30" },
            { name: "5th Baji", time: "17:00" },
            { name: "6th Baji", time: "18:30" },
            { name: "7th Baji", time: "20:00" },
            { name: "8th Baji", time: "21:00" }
        ];

        function getCurrentBaji() {
            const now = new Date();
            const nowHour = now.getHours();
            const nowMinute = now.getMinutes();

            for (let i = 0; i < bajiSchedule.length; i++) {
                const bajiTime = bajiSchedule[i].time.split(':');
                const bajiHour = parseInt(bajiTime[0]);
                const bajiMinute = parseInt(bajiTime[1]);

                if (nowHour < bajiHour || (nowHour === bajiHour && nowMinute < bajiMinute)) {
                    return bajiSchedule[i].name;
                }
            }
            // If all times are passed, it's for the next day's 1st Baji
            return bajiSchedule[0].name;
        }

        document.getElementById('currentBajiName').textContent = getCurrentBaji();

        // --- Data Entry and Submission ---
        document.getElementById('submitEntryBtn').addEventListener('click', () => {
            const selectedDealerId = dealerSelect.value;
            if (!selectedDealerId) {
                alert('অনুগ্রহ করে একজন ডিলার সিলেক্ট করুন।');
                return;
            }

            const amounts = {};
            for (let i = 0; i < 10; i++) {
                amounts[i] = parseInt(document.getElementById(`amount${i}`).value) || 0;
            }

            const currentBaji = getCurrentBaji();
            const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

            const newEntry = {
                dealerId: selectedDealerId,
                date: date,
                baji: currentBaji,
                amounts: amounts
            };

            entries.push(newEntry);
            saveToLocalStorage();
            alert('ডেটা সফলভাবে জমা দেওয়া হয়েছে!');
            
            // Reset input fields
            for (let i = 0; i < 10; i++) {
                document.getElementById(`amount${i}`).value = '0';
            }
            updateGraphs();
        });

        // --- Graphs ---
        const bajiNames = bajiSchedule.map(b => b.name);
        const charts = {};

        function createGraph(baji) {
            const graphsContainer = document.querySelector('.graphs-container');
            const canvas = document.createElement('canvas');
            canvas.id = `chart-${baji.replace(/\s+/g, '-')}`;
            graphsContainer.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            charts[baji] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                    datasets: [{
                        label: `মোট টাকা - ${baji}`,
                        data: Array(10).fill(0),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'টাকার পরিমাণ'
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
        
        bajiNames.forEach(baji => createGraph(baji));

        function updateGraphs() {
            const now = new Date().toISOString().slice(0, 10);
            const todayEntries = entries.filter(entry => entry.date === now);

            bajiNames.forEach(baji => {
                const bajiTotals = Array(10).fill(0);
                
                todayEntries
                    .filter(entry => entry.baji === baji)
                    .forEach(entry => {
                        for (let i = 0; i < 10; i++) {
                            bajiTotals[i] += entry.amounts[i] || 0;
                        }
                    });

                if (charts[baji]) {
                    charts[baji].data.datasets[0].data = bajiTotals;
                    charts[baji].update();
                }
            });
        }
        
        updateGraphs();

        // --- Report Download ---
        document.getElementById('downloadReportBtn').addEventListener('click', () => {
            const reportDate = document.getElementById('reportDate').value;
            const reportDealerId = document.getElementById('reportDealerSelect').value;

            if (!reportDate) {
                alert('অনুগ্রহ করে একটি তারিখ সিলেক্ট করুন।');
                return;
            }

            const filteredEntries = entries.filter(entry => {
                const isDateMatch = entry.date === reportDate;
                const isDealerMatch = !reportDealerId || entry.dealerId == reportDealerId;
                return isDateMatch && isDealerMatch;
            });
            
            if (filteredEntries.length === 0) {
                alert('এই তারিখ বা ডিলারের জন্য কোনো ডেটা পাওয়া যায়নি।');
                return;
            }

            const dealerName = reportDealerId ? dealers.find(d => d.id == reportDealerId).name : 'সমস্ত ডিলার';
            let reportText = `রিপোর্ট: ${reportDate}\nডিলার: ${dealerName}\n\n`;

            filteredEntries.forEach(entry => {
                const dealer = dealers.find(d => d.id == entry.dealerId);
                const entryDate = new Date(entry.date).toLocaleDateString('bn-IN');
                
                reportText += `বাজি: ${entry.baji} | তারিখ: ${entryDate} | ডিলার: ${dealer.name}\n`;
                for (let i = 0; i < 10; i++) {
                    if (entry.amounts[i] > 0) {
                        reportText += `  নম্বর ${i}: ${entry.amounts[i]} টাকা\n`;
                    }
                }
                reportText += `---------------------------\n`;
            });

            // Create and download file
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${reportDate}-${reportDealerId || 'all'}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // --- Login Page Logic ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;
            const loginMessage = document.getElementById('loginMessage');
            
            // Hardcoded credentials for demonstration
            if (username === "admin" && password === "12345") {
                localStorage.setItem('isLoggedIn', 'true');
                loginMessage.textContent = 'লগইন সফল! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...';
                loginMessage.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                loginMessage.textContent = 'ভুল ইউজারনেম বা পাসওয়ার্ড।';
                loginMessage.style.color = 'red';
            }
        });
    }

    // --- Dashboard Logic ---
    if (window.location.pathname.includes('dashboard.html')) {
        // Check for login status
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'index.html';
            return;
        }

        // --- Logout Logic ---
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        });

        // --- Digital Clock ---
        function updateClock() {
            const now = new Date();
            const time = now.toLocaleTimeString('bn-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            document.getElementById('digital-clock').textContent = time;
        }
        setInterval(updateClock, 1000);
        updateClock();

        // --- Data Storage Simulation (Using localStorage) ---
        let dealers = JSON.parse(localStorage.getItem('dealers')) || [];
        let entries = JSON.parse(localStorage.getItem('entries')) || [];
        
        const dealerSelect = document.getElementById('dealerSelect');
        const reportDealerSelect = document.getElementById('reportDealerSelect');
        
        function saveToLocalStorage() {
            localStorage.setItem('dealers', JSON.stringify(dealers));
            localStorage.setItem('entries', JSON.stringify(entries));
        }

        // --- Dealer Management ---
        function loadDealers() {
            dealerSelect.innerHTML = '<option value="">ডিলার সিলেক্ট করুন</option>';
            reportDealerSelect.innerHTML = '<option value="">ডিলার সিলেক্ট করুন</option>';
            dealers.forEach(dealer => {
                const option = document.createElement('option');
                option.value = dealer.id;
                option.textContent = `${dealer.name} (${dealer.phone})`;
                dealerSelect.appendChild(option);
                reportDealerSelect.appendChild(option.cloneNode(true));
            });
        }
        
        document.getElementById('registerDealerBtn').addEventListener('click', () => {
            const name = document.getElementById('dealerName').value.trim();
            const phone = document.getElementById('dealerPhone').value.trim();
            if (name && phone) {
                const newDealer = { id: Date.now(), name, phone };
                dealers.push(newDealer);
                saveToLocalStorage();
                loadDealers();
                document.getElementById('dealerName').value = '';
                document.getElementById('dealerPhone').value = '';
                alert('ডিলার সফলভাবে রেজিস্টার করা হয়েছে!');
            } else {
                alert('অনুগ্রহ করে নাম এবং ফোন নাম্বার লিখুন।');
            }
        });
        
        // Initial load of dealers
        loadDealers();

        // --- Time-based Baji Selection Logic ---
        const bajiSchedule = [
            { name: "1st Baji", time: "11:00" },
            { name: "2nd Baji", time: "12:30" },
            { name: "3rd Baji", time: "14:00" },
            { name: "4th Baji", time: "15:30" },
            { name: "5th Baji", time: "17:00" },
            { name: "6th Baji", time: "18:30" },
            { name: "7th Baji", time: "20:00" },
            { name: "8th Baji", time: "21:00" }
        ];

        function getCurrentBaji() {
            const now = new Date();
            const nowHour = now.getHours();
            const nowMinute = now.getMinutes();

            for (let i = 0; i < bajiSchedule.length; i++) {
                const bajiTime = bajiSchedule[i].time.split(':');
                const bajiHour = parseInt(bajiTime[0]);
                const bajiMinute = parseInt(bajiTime[1]);

                if (nowHour < bajiHour || (nowHour === bajiHour && nowMinute < bajiMinute)) {
                    return bajiSchedule[i].name;
                }
            }
            // If all times are passed, it's for the next day's 1st Baji
            return bajiSchedule[0].name;
        }

        document.getElementById('currentBajiName').textContent = getCurrentBaji();

        // --- Data Entry and Submission ---
        document.getElementById('submitEntryBtn').addEventListener('click', () => {
            const selectedDealerId = dealerSelect.value;
            if (!selectedDealerId) {
                alert('অনুগ্রহ করে একজন ডিলার সিলেক্ট করুন।');
                return;
            }

            const amounts = {};
            for (let i = 0; i < 10; i++) {
                amounts[i] = parseInt(document.getElementById(`amount${i}`).value) || 0;
            }

            const currentBaji = getCurrentBaji();
            const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

            const newEntry = {
                dealerId: selectedDealerId,
                date: date,
                baji: currentBaji,
                amounts: amounts
            };

            entries.push(newEntry);
            saveToLocalStorage();
            alert('ডেটা সফলভাবে জমা দেওয়া হয়েছে!');
            
            // Reset input fields
            for (let i = 0; i < 10; i++) {
                document.getElementById(`amount${i}`).value = '0';
            }
            updateGraphs();
        });

        // --- Graphs ---
        const bajiNames = bajiSchedule.map(b => b.name);
        const charts = {};

        function createGraph(baji) {
            const graphsContainer = document.querySelector('.graphs-container');
            const canvas = document.createElement('canvas');
            canvas.id = `chart-${baji.replace(/\s+/g, '-')}`;
            graphsContainer.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            charts[baji] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                    datasets: [{
                        label: `মোট টাকা - ${baji}`,
                        data: Array(10).fill(0),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'টাকার পরিমাণ'
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
        
        bajiNames.forEach(baji => createGraph(baji));

        function updateGraphs() {
            const now = new Date().toISOString().slice(0, 10);
            const todayEntries = entries.filter(entry => entry.date === now);

            bajiNames.forEach(baji => {
                const bajiTotals = Array(10).fill(0);
                
                todayEntries
                    .filter(entry => entry.baji === baji)
                    .forEach(entry => {
                        for (let i = 0; i < 10; i++) {
                            bajiTotals[i] += entry.amounts[i] || 0;
                        }
                    });

                if (charts[baji]) {
                    charts[baji].data.datasets[0].data = bajiTotals;
                    charts[baji].update();
                }
            });
        }
        
        updateGraphs();

        // --- Report Download ---
        document.getElementById('downloadReportBtn').addEventListener('click', () => {
            const reportDate = document.getElementById('reportDate').value;
            const reportDealerId = document.getElementById('reportDealerSelect').value;

            if (!reportDate) {
                alert('অনুগ্রহ করে একটি তারিখ সিলেক্ট করুন।');
                return;
            }

            const filteredEntries = entries.filter(entry => {
                const isDateMatch = entry.date === reportDate;
                const isDealerMatch = !reportDealerId || entry.dealerId == reportDealerId;
                return isDateMatch && isDealerMatch;
            });
            
            if (filteredEntries.length === 0) {
                alert('এই তারিখ বা ডিলারের জন্য কোনো ডেটা পাওয়া যায়নি।');
                return;
            }

            const dealerName = reportDealerId ? dealers.find(d => d.id == reportDealerId).name : 'সমস্ত ডিলার';
            let reportText = `রিপোর্ট: ${reportDate}\nডিলার: ${dealerName}\n\n`;

            filteredEntries.forEach(entry => {
                const dealer = dealers.find(d => d.id == entry.dealerId);
                const entryDate = new Date(entry.date).toLocaleDateString('bn-IN');
                
                reportText += `বাজি: ${entry.baji} | তারিখ: ${entryDate} | ডিলার: ${dealer.name}\n`;
                for (let i = 0; i < 10; i++) {
                    if (entry.amounts[i] > 0) {
                        reportText += `  নম্বর ${i}: ${entry.amounts[i]} টাকা\n`;
                    }
                }
                reportText += `---------------------------\n`;
            });

            // Create and download file
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${reportDate}-${reportDealerId || 'all'}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
});
