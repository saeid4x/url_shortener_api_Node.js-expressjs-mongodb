const {z} = require('zod');

const registerSchema = z.object({
    name:z.string().min(3,'Name must be at least 3 characters long'),
    email:z.string().email('Invalid email address'),
    password:z.string().min(8,'password must be at least 8 characters long'),
    role:z.enum(['user' , 'editor' , 'admin']).optional(),
});


const loginSchema = z.object({
    email:z.string().email('invlaid email address'),
    password:z.string().min(8,"password must be at least 8 characters long")
})


module.exports = {
    registerSchema,
    loginSchema
}