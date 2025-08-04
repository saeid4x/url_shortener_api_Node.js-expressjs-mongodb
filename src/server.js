const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
 
const authRoutes = require('./api/routes/auth.routes');
const urlRoutes = require('./api/routes/url.route');
const { errorHandler } = require('./api/middleware/error.middleware');
const connectDb = require('./config/database.config');
const redirectRoutes = require('./api/routes/redirect.routes'); 

// Load env vars
dotenv.config({ path: '../.env' });

connectDb();

const app = express();


// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/v1/auth' , authRoutes);
app.use('/api/v1/urls',urlRoutes);

 // Mount the general redirection router at the root.
// This will catch everything else, like /myCustomCode
app.use('/', redirectRoutes); // <-- USE the new router

// --- 404 Handler for all other routes ---
// app.all('*', (req, res, next) => {
//     next( new Error(`Cant find ${req.originalUrl} on this server!`));
// });

// Global Error Handler 
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`server running on port ${PORT}`);
})

