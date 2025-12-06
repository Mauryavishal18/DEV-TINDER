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


// app.get("/user", async(req,res)=>{
//     try{
//         const users= await User.find({emailId});
//         res.send(users);

//     }catch(err){
//         res.status(400).send("User not Found");

//     }

// });
app.get("/feed",async(req,res)=>{
    try{
        const users=await User.find({});
        res.send(users);
    }catch(err){
        res.status(400).send("Something went wrong");
    }
});


// app.delete("/user",async(req,res)=>{
//     const userId=req.body.userId;
//     try{
//         const user=await User.findByIdAndDelete({_id:userId});
//         // const user=await User.findByIdAndDelete(userId);
//         res.send("User is deleted Successfully");
//     }catch(err){
//         res.status(400).send("Something went wrong");
//     }
// });


app.patch("/user",async(req,res)=>{
    const userId=req.body.userId;
    const data=req.body;
    try{
        const user=await User.findByIdAndUpdate({_id: userId},data,{returnDocument:"after",});
        console.log(user);
        res.send("User Updated Successfully");
    }catch(err){

        res.send(400).send("Something went wrong");
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