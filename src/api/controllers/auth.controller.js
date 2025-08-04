const authService = require('../../application/services/auth.service');
const {registerSchema , loginSchema} = require("../../domain/validators/user.validator");
const {ApiError} = require("../../utils/ApiError");

const sendTokenResponse = (res,token,statusCode) =>{
    const cookieOptions = {
        expires:new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN  * 24 * 60*60*1000
        ),
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production'
    };

    res.cookie('jwt' , token, cookieOptions);
    res.status(statusCode).json({
        status:'success',
        token
    })
};



exports.register = async (req, res, next) => {
    try {
        const { error, data } = registerSchema.safeParse(req.body);
        if (error) {
            return next(400,new ApiError(error.errors.map(e => e.message).join(', ')));
        }

        // 1. Create the new user
        const newUser = await authService.register(data);

        // 2. Generate a token for the new user
        const token = authService.generateToken(newUser._id);

        // 3. Send the token and user data in the response
        sendTokenResponse(res, token, 201, newUser);
    } catch (err) {
        next(err);
    }
};


exports.login = async (req,res , next) =>
{
    try{
        const {error, data} = loginSchema.safeParse(req.body);
        if(error)
        {
            return next(new ApiError(400,error.errors.map(e =>e.message).join(', ')))
        }

        const {email,password} = data;
        const {token} = await authService.login(email, password);
        sendTokenResponse(res,token,200);
    } catch(error)
    {
        next(error);
    }
}

exports.logout = (req,res) =>{
    res.cookie('jwt','loggedout',{
        expires:new Date(Date.now() + 10 * 1000),
        httpOnly:true
    });

    res.status(200).json({status:'success'});
}