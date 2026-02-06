const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    appName: { type: String, default: 'Shree Veerabhadreshwara Pharma' },
    email: { type: String, default: 'admin@svpharma.in' },
    phone: { type: String, default: '+91 98765 43210' },
    address: {
        line1: { type: String, default: '123 Pharma Street' },
        line2: { type: String, default: '' },
        area: { type: String, default: 'Medical District' },
        city: { type: String, default: 'City' },
        state: { type: String, default: 'State' },
        pincode: { type: String, default: '560001' },
        landmark: { type: String, default: '' }
    },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: 'https://instagram.com/svpharma' },
    whatsapp: { type: String, default: 'https://wa.me/919019843253' },
    linkedin: { type: String, default: '' },
    developerName: { type: String, default: 'Shivanand VN' },
    developerDescription: { type: String, default: 'Full-stack developer with modern tech stacks.' },
    developerRoleName: { type: String, default: 'Technical Partner' },
    developerLink: { type: String, default: '#' },
    developerProfileLink: { type: String, default: '#' },
    upiId: { type: String, default: 'admin@upi' }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;
