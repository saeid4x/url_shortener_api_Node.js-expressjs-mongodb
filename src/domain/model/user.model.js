const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const  userSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please provide a name'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'please provide an email'],
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        select:false

    },
    role:{
        type:String,
        enum:['user', 'editor' , 'admin'],
        default:'user'
    }
},{timestamps:true})



// Pre-save middleware to hash password
userSchema.pre('save' , async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next()
})


// instamce method to compare passwords
userSchema.methods.correctPassword = async function (candidatePasswrod, userPassword)
{
    return await bcrypt.compare(candidatePasswrod , userPassword)    ;

}


const User = mongoose.model('User' , userSchema);

module.exports = User;
