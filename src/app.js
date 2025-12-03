require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
    try {
        console.log(req.body);
        const user = new User(req.body);
        await user.save();
        res.send("User Added successfully!");
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

connectDB()
    .then(() => {
        console.log("Database connected successfully...");
        app.listen(7777, () => {
            console.log("Server is listening on port 7777...");
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected!!");
    });