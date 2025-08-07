const express = require("express")
const axios = require("axios")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const bodyParser = require("body-parser")
dotenv.config({})
const app = express()
app.use(cors())
app.use(bodyParser.json())

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to database");
}).catch(error => {
    console.log("Error ==>", error);
})

const cvSchema = new mongoose.Schema({
    name: { type: String, default: 'Untitled CV' },
    data: String,
    createdAt: { type: Date, default: Date.now }
});
const cvBuddy = mongoose.model('cvBuddy', cvSchema);

app.get("/", (req, res) => {
    res.send("Server is live");
});

// Get list of all CVs
app.get('/getCvList', async (req, res) => {
    try {
        const cvs = await cvBuddy.find({}, 'name createdAt');
        res.json({ 
            cvList: cvs.map(cv => ({
                id: cv._id,
                name: cv.name,
                createdAt: cv.createdAt
            }))
        });
    } catch (error) {
        res.status(500).send({ message: 'An error occurred', error });
    }
});

// Get specific CV by ID
app.get('/getCv/:id', async (req, res) => {
    try {
        const cv = await cvBuddy.findById(req.params.id);
        if (!cv) {
            return res.status(404).json({ message: 'CV not found' });
        }
        res.json({ data: JSON.stringify(cv) });
    } catch (error) {
        res.status(500).send({ message: 'An error occurred', error });
    }
});

// Create new CV
app.post('/createCv', async (req, res) => {
    const { data, name } = req.body;
    try {
        const cvNew = new cvBuddy({ 
            data,
            name: name || 'Untitled CV'
        });
        await cvNew.save();
        res.json({ 
            message: 'CV created successfully',
            id: cvNew._id,
            name: cvNew.name
        });
    } catch (error) {
        res.status(500).send({ message: 'An error occurred', error });
    }
});

// Update existing CV
app.post('/saveCv', async (req, res) => {
    const { id, data, name } = req.body;
    try {
        let cv;
        if (id) {
            cv = await cvBuddy.findById(id);
            if (!cv) {
                return res.status(404).json({ message: 'CV not found' });
            }
            cv.data = data;
            if (name) cv.name = name;
            await cv.save();
            res.json({ 
                message: 'CV updated successfully',
                id: cv._id,
                name: cv.name
            });
        } else {
            // Backward compatibility for old code
            cv = await cvBuddy.findOne();
            if (cv) {
                cv.data = data;
                await cv.save();
                res.json({ message: 'CV data updated successfully' });
            } else {
                const cvNew = new cvBuddy({ data });
                await cvNew.save();
                res.json({ message: 'CV data saved successfully' });
            }
        }
    } catch (error) {
        res.status(500).send({ message: 'An error occurred', error });
    }
});


app.listen(3000, () => {
    console.log("Server listening on port 5000");
})
