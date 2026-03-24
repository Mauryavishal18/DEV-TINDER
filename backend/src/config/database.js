const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "devtinder", // explicit DB name — data will appear in Compass under "devtinder"
  });
  console.log(`✅ MongoDB connected → devtinder`);
};
module.exports = connectDB;
