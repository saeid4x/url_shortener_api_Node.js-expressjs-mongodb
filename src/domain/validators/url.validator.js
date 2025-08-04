const {z} = require('zod');

const createUrlSchema = z.object({
    originalUrl:z.string().url({message:"a valid url must be provided"}),

    // custom slug is optional , must ne alphanumeric, and between 3-20 chars
    customCode:z.string()
        .min(3,"custom code must be at least 3 characters long")
        .max(20, "custom code cannot be longer than 20 characters")
        .regex(/^[a-zA-Z0-9_-]+$/ , "Custom code can only contain letters, numbers, underscores, and hyphens. ")
        .optional(),
    // Expiration date is optional, can be a date string or 'no_expiry'
        expiresAt:z.union([
            z.string().datetime().optional(),  // ISO 8601 date string
            z.literal('no_expiry').optional()
        ])
})


const updateUrlSchema = z.object({
    originalUrl:z.string().url({message:'a valid url must be provided'}).optional(),
    expiresAt:z.union([
        z.string().datetime().optional(),
        z.literal('no_expiry').optional()
    ]).optional(),
    // To remove a password, the user should send `password: null` or `password: ""`
    password:z.string().min(4,"password must be at least 4 characters long").nullable().optional(),
    isActive:z.boolean().optional(),
})

const  verifyPasswordSchema = z.object({
    password:z.string().nonempty('password is required')
});
module.exports = {
    createUrlSchema,
    updateUrlSchema,
    verifyPasswordSchema
}