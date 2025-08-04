const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const urlSchema = new mongoose.Schema({
    originalUrl:{
        type:String,
        required:true,
        trim:true
    },
    shortCode:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    // user who created this link
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    clicks:{
        type:Number,
        default:0
    },
    expiresAt:{
        type:Date,
        default:null,   // null means it never expires
    },
    isActive:{
        type:Boolean,
        default:true
    },
    password:{
        type:String,
        select:false  // Don't include the password hash in normal queries
    }
},{timestamps:true})


// create an index on shortcode for faster lockups 
urlSchema.index({shortCode:1});

// create an index on the user field for faster user-specific queries 
urlSchema.index({user:1});

// Pre-save middleware to hash the link password if it's modified
urlSchema.pre('save',async function(next){
    if(!this.isModified('password') || !this.password)
    {
      // If password is not modified or is being set to null/undefined, continue
      return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next()
})


urlSchema.methods.correctPassword = async function(candidatePassword)
{
    return await bcrypt.compare(candidatePassword, this.password);
}
const Url = mongoose.model("Url" , urlSchema);

module.exports=Url