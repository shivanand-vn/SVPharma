const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    appName: { type: String, default: 'Shree Veerabhadreshwara Pharma' },
    email: { type: String, default: 'admin@svpharma.in' },
    phone: { type: String, default: '+91 98765 43210' }, // Deprecated, keeping for backward compatibility
    contacts: [{
        name: { type: String, default: 'General' },
        phone: { type: String, required: true }
    }],
    address: {
        floor: { type: String, default: '' },
        building: { type: String, default: '' },
        line1: { type: String, default: '' }, // Keeping for backward compatibility
        line2: { type: String, default: '' }, // Keeping for backward compatibility
        area: { type: String, default: '' },
        landmark: { type: String, default: '' },
        city: { type: String, default: '' },
        taluk: { type: String, default: '' },
        district: { type: String, default: '' },
        state: { type: String, default: 'Karnataka' },
        pincode: { type: String, default: '' },
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
