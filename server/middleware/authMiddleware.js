const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if Admin
            req.admin = await Admin.findById(decoded.id).select('-password');
            if (req.admin) {
                req.user = req.admin;
                // Use the role from the database
                req.user.role = req.admin.role || 'admin';
            }

            // If not Admin, check if Customer
            if (!req.admin) {
                req.customer = await Customer.findById(decoded.id).select('-password');
                if (req.customer) {
                    req.user = req.customer;
                    req.user.role = 'customer';
                }
            }

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

const developerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'developer') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a developer');
    }
};

const adminOrDeveloper = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'developer')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin or developer');
    }
};

module.exports = { protect, adminOnly, developerOnly, adminOrDeveloper };
