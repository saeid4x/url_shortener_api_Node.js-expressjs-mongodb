const User = require("../../domain/model/user.model");
const jwt = require("jsonwebtoken");
const {ApiError} = require("../../utils/ApiError");
const { email } = require("zod");

const generateToken = (id) =>{
    return jwt.sign({id} , process.env.JWT_SECRET , {
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}


exports.register = async (userData) =>{
    const existingUser = await User.findOne({email:userData.email});
    if(existingUser){
        throw new ApiError(409,'An Account with this email already exists');
    }

    const newUser = await User.create({
        name:userData.name,
        email:userData.email,
        password:userData.password,
        role:userData.role
    });

    // Remove password from output 
    newUser.password = undefined;
    return newUser;
}


exports.login = async(email, password) =>
{
    const user = await User.findOne({email}).select('+password');
    if(!user || !(await user.correctPassword(password, user.password)))
    {
        throw new ApiError(401, 'Incorect email or password');
    }

    const token = generateToken(user._id);
    user.password = undefined;  // remove password from output 
    return {token, user};
}

// ADD THIS EXPORT
exports.generateToken = generateToken;