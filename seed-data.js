const mongoose = require('mongoose');
require('dotenv').config();

const specialistSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    specialty: String,
    city: String,
    location: { lat: Number, lng: Number },
    experience: Number,
    rating: Number,
    available: Boolean,
    contact: String
});

const feedbackSchema = new mongoose.Schema({
    userName: String,
    rating: Number,
    serviceType: String,
    feedback: String,
    createdAt: { type: Date, default: Date.now }
});

const Specialist = mongoose.model('Specialist', specialistSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Clear existing data
        await Specialist.deleteMany({});
        await Feedback.deleteMany({});
        
        // Add specialists
        const specialists = [
            {
                name: 'Dr. Aren Sharma',
                email: 'dr.aren@frankhospital.com',
                phone: '+91-9876543210',
                specialty: 'General Physician',
                city: 'Delhi',
                location: { lat: 28.64, lng: 77.22 },
                experience: 10,
                rating: 4.8,
                available: true,
                contact: 'www.frankhospital.com'
            },
            {
                name: 'Dr. Shalip Gupta',
                email: 'dr.shalip@yahoo.com',
                phone: '+91-9876543211',
                specialty: 'Pediatrics',
                city: 'Delhi',
                location: { lat: 28.58, lng: 77.18 },
                experience: 8,
                rating: 4.6,
                available: true,
                contact: 'Dr.Shalip@yahoo.com'
            },
            {
                name: 'Dr. Hildi Kao',
                email: 'dr.hildi@kongshu.com',
                phone: '+91-9876543212',
                specialty: 'Dermatology',
                city: 'Mumbai',
                location: { lat: 19.09, lng: 72.88 },
                experience: 12,
                rating: 4.9,
                available: true,
                contact: 'Kongshu@yahoo.com'
            },
            {
                name: 'Dr. R. Singh',
                email: 'dr.singh@health.org',
                phone: '+91-9876543213',
                specialty: 'Cardiology',
                city: 'Jaipur',
                location: { lat: 26.90, lng: 75.80 },
                experience: 15,
                rating: 4.7,
                available: true,
                contact: 'rsingh@health.org'
            },
            {
                name: 'Dr. Meera Das',
                email: 'dr.meera@example.com',
                phone: '+91-9876543214',
                specialty: 'Gynecology',
                city: 'Mumbai',
                location: { lat: 19.07, lng: 72.84 },
                experience: 9,
                rating: 4.8,
                available: true,
                contact: 'meeradas@example.com'
            }
        ];
        
        await Specialist.insertMany(specialists);
        
        // Add sample feedback
        const feedback = [
            {
                userName: 'Rahul Kumar',
                rating: 5,
                serviceType: 'General Consultation',
                feedback: 'Excellent service! The doctors were very professional and caring. The online consultation was smooth.'
            },
            {
                userName: 'Priya Singh',
                rating: 4,
                serviceType: 'Lab Tests',
                feedback: 'Good experience overall. The doctor was knowledgeable, but waiting time was a bit long.'
            },
            {
                userName: 'Amit Patel',
                rating: 5,
                serviceType: 'Emergency Care',
                feedback: 'Life-saving service! The emergency team responded quickly and provided excellent care.'
            }
        ];
        
        await Feedback.insertMany(feedback);
        
        console.log('Sample data seeded successfully!');
        console.log(`Added ${specialists.length} specialists and ${feedback.length} feedback entries`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
