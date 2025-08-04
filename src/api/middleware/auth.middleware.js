// src/interfaces/middleware/auth.middleware.js

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../../utils/ApiError');
const User = require('../../domain/model/user.model');

exports.protect = async (req, res, next) => {
    try {
        // 1) Get the token and check if it exists
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // For API clients sending token in header
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            // For web clients sending token in cookie
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(
                new ApiError(401,'You are not logged in! Please log in to get access.')
            );
        }

        // 2) Verify the token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Check if the user associated with the token still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(
                new ApiError(
                    401,
                    'The user belonging to this token no longer exists.',
                     
                )
            );
        }

        // 4) Grant access to the protected route
        // Attach the user to the request object for future use
        req.user = currentUser;
        next();
    } catch (err) {
        // This will catch errors from jwt.verify (e.g., invalid signature, expired token)
        return next(new ApiError(401,'Authentication failed. Please log in again.'));
    }
};