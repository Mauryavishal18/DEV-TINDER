const mongoose=require("mongoose");

const connectDB=async ()=>{
    await mongoose.connect(
        "mongodb+srv://2k23it2313958:NCuN2O1b9zN3LLWL@namastenodejs.btmq3cj.mongodb.net/"
    );
};




module.exports=connectDB;