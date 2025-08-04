const mongoose = require("mongoose");
const clickSchema = new mongoose.Schema({
    // link back to the url that was clicked 
    url:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Url",
        required:true
    },
    ipAddress:{
        type:String,
        trim:true,        
    },
    referer:{
        type:String,
        trim:true
    },
    country:{
        type:String,
        trim:true
    },
    browser:{
        type:String,
        trim:true
    },
    os:{
        type:String,
        trim:true
    }
},{timestamps:true});

clickSchema.index({url:1,createdAt:-1});
clickSchema.index({country:1});
clickSchema.index({referer:1});


const Click = mongoose.model('Click',clickSchema);
module.exports = Click;