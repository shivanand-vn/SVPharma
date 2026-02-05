const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public (or Private?) - Usually Private for Shop Apps but maybe public catalog
const getMedicines = asyncHandler(async (req, res) => {
    const { company } = req.query;
    const filter = {};
    if (company) {
        filter.company = company;
    }
    const medicines = await Medicine.find(filter);
    res.json(medicines);
});

// @desc    Get fast moving medicines (by unique customers)
// @route   GET /api/medicines/fast-moving
// @access  Public
const getFastMovingMedicines = asyncHandler(async (req, res) => {
    // 1. Get diversity metrics to decide limits
    const stats = await Medicine.aggregate([
        {
            $group: {
                _id: null,
                distinctCompanies: { $addToSet: "$company" },
                distinctCategories: { $addToSet: "$category" }
            }
        },
        {
            $project: {
                companyCount: { $size: "$distinctCompanies" },
                categoryCount: { $size: "$distinctCategories" }
            }
        }
    ]);

    const companyCount = stats[0]?.companyCount || 0;
    const categoryCount = stats[0]?.categoryCount || 0;

    // adaptive Limit: 3 if sparse, 2 if dense
    const limitPerGroup = (companyCount <= 4 || categoryCount <= 4) ? 3 : 2;

    const fastMoving = await Order.aggregate([
        // 1. Unwind items to treat each medicine purchase as a document
        { $unwind: "$items" },
        // 2. Group by Medicine + Customer to find UNIQUE customer interactions (Demand)
        {
            $group: {
                _id: {
                    medicine: "$items.medicine",
                    customer: "$customer"
                }
            }
        },
        // 3. Group by Medicine to count distinct customers
        {
            $group: {
                _id: "$_id.medicine",
                uniqueCustomers: { $sum: 1 }
            }
        },
        // 4. Join with Medicine details early
        {
            $lookup: {
                from: "medicines",
                localField: "_id",
                foreignField: "_id",
                as: "details"
            }
        },
        { $unwind: "$details" },

        // 5. Faceted search to ensure balance
        {
            $facet: {
                byCategory: [
                    { $sort: { uniqueCustomers: -1, "details.name": 1 } },
                    {
                        $group: {
                            _id: "$details.category",
                            meds: { $push: "$$ROOT" }
                        }
                    },
                    { $project: { meds: { $slice: ["$meds", limitPerGroup] } } },
                    { $unwind: "$meds" },
                    { $replaceRoot: { newRoot: "$meds" } }
                ],
                byCompany: [
                    { $sort: { uniqueCustomers: -1, "details.name": 1 } },
                    {
                        $group: {
                            _id: "$details.company",
                            meds: { $push: "$$ROOT" }
                        }
                    },
                    { $project: { meds: { $slice: ["$meds", limitPerGroup] } } },
                    { $unwind: "$meds" },
                    { $replaceRoot: { newRoot: "$meds" } }
                ]
            }
        },

        // 6. Combine and Deduplicate
        { $project: { combined: { $setUnion: ["$byCategory", "$byCompany"] } } },
        { $unwind: "$combined" },
        { $replaceRoot: { newRoot: "$combined" } },

        // 7. Stable Final Sort
        { $sort: { uniqueCustomers: -1, "details.name": 1 } },
        { $limit: 12 }, // Maximum reasonable for a horizontal scroll

        // 8. Final Projection
        {
            $project: {
                _id: "$details._id",
                name: "$details.name",
                description: "$details.description",
                company: "$details.company",
                mrp: "$details.mrp",
                cost: "$details.cost",
                price: "$details.cost",
                image: "$details.imageUrl",
                imageUrl: "$details.imageUrl",
                category: "$details.category",
                type: "$details.type",
                packing: "$details.packing",
                uniqueCustomers: 1
            }
        }
    ]);

    res.json(fastMoving);
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);
    if (medicine) {
        res.json(medicine);
    } else {
        res.status(404);
        throw new Error('Medicine not found');
    }
});

// @desc    Create a medicine
// @route   POST /api/medicines
// @access  Private/Admin
const createMedicine = asyncHandler(async (req, res) => {
    const { name, description, company, mrp, cost, category, type, packing } = req.body;

    // 1. Validation for Required Fields
    if (!name || !description || !company || !mrp || !cost || !category || !type || !packing || !req.file) {
        if (req.file) fs.unlinkSync(req.file.path); // Cleanup if uploaded
        res.status(400);
        throw new Error('All primary fields and image are mandatory');
    }

    // 2. Check for Duplicate Name (Case-Insensitive)
    const medicineExists = await Medicine.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (medicineExists) {
        if (req.file) fs.unlinkSync(req.file.path); // Cleanup
        res.status(400);
        throw new Error('Medicine with this name already exists');
    }

    // 3. Upload to Cloudinary (Only if validations pass)
    let imageUrl = '';
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500);
        throw new Error('Cloudinary configuration is missing');
    }

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'pharma-app',
        });
        imageUrl = result.secure_url;
        fs.unlinkSync(req.file.path); // Cleanup local
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500);
        throw new Error('Image upload failed');
    }

    // 4. Create Medicine
    const medicine = new Medicine({
        name,
        description,
        company,
        mrp: Number(mrp),
        cost: Number(cost),
        price: Number(cost),
        category,
        type,
        packing,
        imageUrl
    });

    const createdMedicine = await medicine.save();
    res.status(201).json(createdMedicine);
});

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
const updateMedicine = asyncHandler(async (req, res) => {
    const { name, description, company, mrp, cost, category, type, packing } = req.body;

    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
        // Check uniqueness if name is being changed
        if (name && name.toLowerCase() !== medicine.name.toLowerCase()) {
            const medicineExists = await Medicine.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (medicineExists) {
                if (req.file) fs.unlinkSync(req.file.path);
                res.status(400);
                throw new Error('Medicine with this name already exists');
            }
        }

        // Handle Image Upload if provided
        if (req.file) {
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                if (req.file) fs.unlinkSync(req.file.path);
                res.status(500);
                throw new Error('Cloudinary configuration is missing');
            }

            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'pharma-app',
                });
                medicine.imageUrl = result.secure_url;
                fs.unlinkSync(req.file.path);
            } catch (error) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                res.status(500);
                throw new Error('Image upload failed');
            }
        }

        medicine.name = name || medicine.name;
        medicine.description = description || medicine.description;
        medicine.company = company || medicine.company;
        medicine.mrp = mrp !== undefined ? Number(mrp) : medicine.mrp;
        medicine.cost = cost !== undefined ? Number(cost) : medicine.cost;
        medicine.price = cost !== undefined ? Number(cost) : medicine.price;
        medicine.category = category || medicine.category;
        medicine.type = type || medicine.type;
        medicine.packing = packing || medicine.packing;

        const updatedMedicine = await medicine.save();
        res.json(updatedMedicine);
    } else {
        res.status(404);
        throw new Error('Medicine not found');
    }
});

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
const deleteMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (medicine) {
        await medicine.deleteOne();
        res.json({ message: 'Medicine removed' });
    } else {
        res.status(404);
        throw new Error('Medicine not found');
    }
});

module.exports = {
    getMedicines,
    getFastMovingMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine
};
