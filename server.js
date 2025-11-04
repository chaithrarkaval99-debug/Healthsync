// ==================== BACKEND INTEGRATION ====================
const API_BASE_URL = 'http://localhost:3000/api';

// API Service Functions
const apiService = {
    // Auth endpoints
    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },

    async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    },

    // Specialists endpoints
    async getSpecialists(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/specialists?${params}`);
        return await response.json();
    },

    // Appointments endpoints
    async bookAppointment(appointmentData) {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(appointmentData)
        });
        return await response.json();
    },

    async getUserAppointments() {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    // Feedback endpoints
    async submitFeedback(feedbackData) {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(feedbackData)
        });
        return await response.json();
    },

    async getFeedback() {
        const response = await fetch(`${API_BASE_URL}/feedback`);
        return await response.json();
    },

    // Billing endpoints
    async getUserBilling() {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/billing`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    },

    async makePayment(billingId) {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/billing/${billingId}/pay`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    }
};

// ==================== ENHANCED AUTHENTICATION SYSTEM ====================
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function clearAuthToken() {
    localStorage.removeItem('authToken');
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

function updateAuthUI() {
    const user = getCurrentUser();
    const accountSection = document.getElementById('account-section');
    const accountEmail = document.getElementById('account-email');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if (user && getAuthToken()) {
        accountSection.style.display = '';
        accountEmail.textContent = user.email;
        if (signupForm) signupForm.closest('section').style.display = 'none';
        if (loginForm) loginForm.closest('section').style.display = 'none';
    } else {
        accountSection.style.display = 'none';
        if (signupForm) signupForm.closest('section').style.display = '';
        if (loginForm) loginForm.closest('section').style.display = '';
    }
}

// ==================== ENHANCED SPECIALIST SEARCH ====================
async function renderSpecialists(origin, maxDistance = 50) {
    const list = document.querySelector('#specialists .specialist-list');
    list.innerHTML = '<div class="muted">Loading specialists...</div>';
    
    try {
        const filters = {};
        if (origin && origin.lat && origin.lng) {
            filters.lat = origin.lat;
            filters.lng = origin.lng;
            filters.maxDistance = maxDistance;
        }
        
        const citySelect = document.getElementById('city-select');
        if (citySelect.value) {
            filters.city = citySelect.value;
        }
        
        const specialtyFilter = document.getElementById('specialty-filter');
        if (specialtyFilter.value) {
            filters.specialty = specialtyFilter.value;
        }
        
        const specialists = await apiService.getSpecialists(filters);
        
        list.innerHTML = '';
        
        if (specialists.length === 0) {
            list.innerHTML = '<div class="muted">No specialists found in your area.</div>';
            return;
        }
        
        specialists.forEach(specialist => {
            const card = document.createElement('div');
            card.className = 'specialist-card';
            card.innerHTML = `
                <div class="specialist-name">${specialist.name}</div>
                <div>${specialist.specialty} • ${specialist.city}</div>
                <div class="specialist-contact">${specialist.contact}</div>
                <div class="muted">Experience: ${specialist.experience} years</div>
                <div class="muted">Rating: ${specialist.rating}/5</div>
                ${specialist.distance ? `<span class="distance-badge">${specialist.distance.toFixed(1)} km</span>` : ''}
                <button class="btn btn-small" onclick="bookAppointment('${specialist._id}', '${specialist.name}')" style="margin-top: 10px;">
                    <i class="fas fa-calendar-plus"></i> Book Appointment
                </button>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = '<div class="muted" style="color: var(--danger);">Error loading specialists. Please try again.</div>';
        console.error('Error fetching specialists:', error);
    }
}

// ==================== APPOINTMENT BOOKING ====================
async function bookAppointment(specialistId, specialistName) {
    if (!getAuthToken()) {
        alert('Please login to book an appointment.');
        return;
    }
    
    const date = prompt(`Enter appointment date for ${specialistName} (YYYY-MM-DD):`);
    if (!date) return;
    
    const time = prompt('Enter preferred time (HH:MM):');
    if (!time) return;
    
    const symptoms = prompt('Briefly describe your symptoms (optional):') || '';
    
    try {
        const result = await apiService.bookAppointment({
            specialistId,
            date,
            time,
            symptoms,
            notes: `Appointment with ${specialistName}`
        });
        
        alert('Appointment booked successfully!');
        console.log('Appointment details:', result);
    } catch (error) {
        alert('Error booking appointment. Please try again.');
        console.error('Booking error:', error);
    }
}

// ==================== ENHANCED FEEDBACK SYSTEM ====================
async function loadFeedback() {
    try {
        const feedback = await apiService.getFeedback();
        const feedbackList = document.getElementById('feedback-list');
        
        feedbackList.innerHTML = feedback.map(item => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <div>
                        <strong>${item.userName}</strong>
                        <div class="muted">${item.serviceType}</div>
                    </div>
                    <div class="feedback-rating">
                        ${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)} 
                        <span class="muted">${new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <p>${item.feedback}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

// ==================== ENHANCED BILLING SYSTEM ====================
async function loadBillingData() {
    if (!getAuthToken()) return;
    
    try {
        const billing = await apiService.getUserBilling();
        updateBillingUI(billing);
    } catch (error) {
        console.error('Error loading billing data:', error);
    }
}

function updateBillingUI(billing) {
    // Update summary
    const totalBalance = billing.reduce((sum, item) => sum + item.amount, 0);
    const amountDue = billing.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = billing.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0);
    
    document.querySelector('#summary-tab .stat-card:nth-child(1) .stat-number').textContent = `₹${totalBalance}`;
    document.querySelector('#summary-tab .stat-card:nth-child(2) .stat-number').textContent = `₹${amountDue}`;
    document.querySelector('#summary-tab .stat-card:nth-child(3) .stat-number').textContent = `₹${totalPaid}`;
    document.querySelector('#summary-tab .stat-card:nth-child(4) .stat-number').textContent = billing.length;
    
    // Update recent invoices
    const recentInvoices = document.getElementById('recent-invoices');
    recentInvoices.innerHTML = billing.slice(0, 2).map(item => `
        <div class="payment-card ${item.status}">
            <h4>${item.service}</h4>
            <p class="muted">${new Date(item.dueDate).toLocaleDateString()}</p>
            <p><strong>₹${item.amount}</strong> 
            <span class="payment-status status-${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></p>
            ${item.status === 'pending' ? 
                `<button class="btn btn-small btn-success" onclick="payInvoice('${item._id}')" style="margin-top: 5px;">Pay Now</button>` : ''}
        </div>
    `).join('');
    
    // Update invoice table
    const invoiceList = document.getElementById('invoice-list');
    invoiceList.innerHTML = billing.map(item => `
        <tr>
            <td>${item.invoiceNumber}</td>
            <td>${new Date(item.dueDate).toLocaleDateString()}</td>
            <td>${item.service}</td>
            <td>₹${item.amount}</td>
            <td><span class="payment-status status-${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></td>
            <td>
                <button class="btn btn-small" onclick="viewInvoice('${item._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${item.status === 'pending' ? 
                    `<button class="btn btn-small btn-success" onclick="payInvoice('${item._id}')">
                        <i class="fas fa-credit-card"></i>
                    </button>` : ''}
            </td>
        </tr>
    `).join('');
}

async function payInvoice(billingId) {
    try {
        const result = await apiService.makePayment(billingId);
        alert('Payment successful!');
        loadBillingData(); // Refresh billing data
    } catch (error) {
        alert('Payment failed. Please try again.');
        console.error('Payment error:', error);
    }
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    updateAuthUI();
    loadFeedback();
    loadBillingData();
    
    // Enhanced signup form
    document.getElementById('signup-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('full-name').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            phone: document.getElementById('middle-number').value.trim(),
            password: document.getElementById('password').value
        };
        
        try {
            const result = await apiService.register(userData);
            if (result.token) {
                setAuthToken(result.token);
                setCurrentUser(result.user);
                updateAuthUI();
                alert('Account created successfully!');
                this.reset();
            } else {
                alert(result.error || 'Registration failed');
            }
        } catch (error) {
            alert('Registration failed. Please try again.');
        }
    });
    
    // Enhanced login form
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const credentials = {
            email: document.getElementById('login-email').value.trim().toLowerCase(),
            password: document.getElementById('login-password').value
        };
        
        try {
            const result = await apiService.login(credentials);
            if (result.token) {
                setAuthToken(result.token);
                setCurrentUser(result.user);
                updateAuthUI();
                loadBillingData();
                alert('Login successful!');
                this.reset();
            } else {
                alert(result.error || 'Login failed');
            }
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        }
    });
    
    // Enhanced feedback form
    document.getElementById('feedback-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!getAuthToken()) {
            alert('Please login to submit feedback.');
            return;
        }
        
        const feedbackData = {
            rating: document.getElementById('rating-value').value,
            serviceType: document.getElementById('service-type').value,
            feedback: document.getElementById('feedback-text').value.trim()
        };
        
        try {
            await apiService.submitFeedback(feedbackData);
            alert('Thank you for your feedback!');
            this.reset();
            stars.forEach(star => star.classList.remove('active'));
            document.getElementById('rating-value').value = '0';
            loadFeedback(); // Reload feedback
        } catch (error) {
            alert('Error submitting feedback. Please try again.');
        }
    });
    
    // Enhanced location search
    document.getElementById('use-location').addEventListener('click', () => {
        if (!navigator.geolocation) {
            setLocationStatus('Geolocation not supported', true);
            return;
        }
        
        setLocationStatus('Detecting location...');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setLocationStatus('Loading specialists...');
                await renderSpecialists(coords);
                setLocationStatus('Specialists loaded');
            },
            (err) => {
                setLocationStatus('Location access denied', true);
            }
        );
    });
    
    // Enhanced city search
    document.getElementById('search-city').addEventListener('click', async () => {
        const city = document.getElementById('city-select').value;
        if (!city) {
            setLocationStatus('Please select a city', true);
            return;
        }
        setLocationStatus('Loading specialists...');
        await renderSpecialists(null);
        setLocationStatus(`Showing specialists in ${city}`);
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        clearAuthToken();
        clearCurrentUser();
        updateAuthUI();
        alert('Logged out successfully');
    });
    
    // Load initial specialists
    renderSpecialists(null);
});

// Utility functions remain the same...
function setLocationStatus(msg, isError = false) {
    const el = document.getElementById('location-status');
    el.textContent = msg;
    el.style.color = isError ? '#b91c1c' : 'var(--gray)';
}

function getServiceName(serviceType) {
    const services = {
        'consultation': 'Doctor Consultation',
        'lab': 'Lab Tests',
        'medicine': 'Medicine Delivery',
        'emergency': 'Emergency Care'
    };
    return services[serviceType] || 'General Service';
}

// Keep your existing utility functions for emergency, wellness, etc.
// ... (rest of your existing utility functions)
