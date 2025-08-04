const mongoose = require("mongoose");

const connectDb = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected Successfully....`);
    }catch(err)
    {
        console.error(`MongoDB connection failed`,err.messgae);
        process.exit(1);
    }
}

module.exports = connectDb;