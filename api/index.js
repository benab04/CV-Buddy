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
    data: String
});
const cvBuddy = mongoose.model('cvBuddy', cvSchema);

app.get("/", (req, res) => {
    res.send("Server is live");
})

app.post('/saveCv', async (req, res) => {
    const { data } = req.body;
    try {
        let cv = await cvBuddy.findOne();
        console.log("Save CV called");
        if (cv) {
            cv.data = data;
            await cv.save();
            res.json({ message: 'CV data updated successfully' });
        } else {
            const cvNew = new cvBuddy({ data });
            await cvNew.save();
            res.json({ message: 'CV data saved successfully' });
        }
    } catch (error) {
        res.status(500).send({ message: 'An error occurred', error });
    }
});
// Endpoint to get CV data
app.get('/getCv', async (req, res) => {
    console.log("Get CV called");
    const cvs = await cvBuddy.find({});
    res.json({ data: JSON.stringify(cvs) });
});


app.listen(3000, () => {
    console.log("Server listening on port 5000");
})
