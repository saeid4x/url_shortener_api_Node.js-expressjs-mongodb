const Url = require("../../domain/model/url.model");
const {ApiError} = require("../../utils/ApiError");;
const {nanoid} = require("nanoid");
const qrcode = require('qrcode');
const Click = require('../../domain/model/click.model');
const geoip = require('geoip-lite');
const useragent = require('useragent');
const mongoose = require("mongoose");





exports.createShortUrl = async (urlData , userId) =>{
    const {originalUrl, customCode , expiresAt} = urlData;

    let shortCode;

    if(customCode )
    {

        // user wants a custom code 
        const existing = await Url.findOne({shortCode:customCode});
        if(existing)
        {
            throw new ApiError(409,'This custom code is already in use. Please choose another.')
        }
        shortCode = customCode;

    } else {
        // Generate a random code 
        shortCode = nanoid(7); // Generate a 7-character random ID

    }


    // let expiryDate = null;
    // if(expiresAt && expiresAt !== 'no_expiry')
    // {
    //     expiresDate = new Date(expiresAt);
    //     if(isNaN(expiresDate.getTime()) || expiryDate <= new Date())
    //     {
    //         throw new ApiError(400,'Invalid expiration date provided');
    //     }
    // }
      // --- START: IMPROVED DATE VALIDATION LOGIC ---
    let expiryDate = null;
    if (expiresAt && expiresAt !== 'no_expiry') {
        // First, try to create a Date object
        const potentialExpiry = new Date(expiresAt);

        // Check 1: Was the date string a valid format?
        if (isNaN(potentialExpiry.getTime())) {
            throw new ApiError(400, 'The format of the expiration date is invalid. Please use ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ssZ).');
        }

        // Check 2: Is the date in the past?
        if (potentialExpiry <= new Date()) {
            throw new ApiError(400, 'The expiration date must be in the future.');
        }

        // If both checks pass, set the date.
        expiryDate = potentialExpiry;
    }
    // --- END: IMPROVED DATE VALIDATION LOGIC ---

    const newUrl = await Url.create({
        originalUrl,
        shortCode,
        user:userId,
        expiresAt:expiryDate
    })

    return newUrl;

};

exports.getUrlsForUser = async (userId) =>{
    return await Url.find({user:userId}).sort({createdAt:-1});
};

exports.deleteUrl = async(urlId , userId) =>{
    const url = await Url.findOneAndDelete({_id:urlId, user:userId});

    if(!url)
    {
        throw new ApiError(404,'No URL found with that ID for the current user, or you do not have permission to delete it.');        
    }

    return url;
}

exports.findUrlByCode = async (shortCode,req) =>{
    // We need to explicitly ask for the password field since it's select: false
    const url = await Url.findOne({ shortCode }).select('+password');
    // const url = await Url.findOne({shortCode});
    if(!url)
    {
        return {status:'not found'}
    }

     // Check if link is disabled by the user
    if (!url.isActive) {
        return { status: 'disabled' };
    }


      // Check for expiration
    if (url.expiresAt && url.expiresAt < new Date()) {
        return { status: 'expired' };
    }

     // Check if password protected
    if (url.password) {
        return { status: 'password_protected', url };
    }

    // If we reach here, the click is successful. Log it.
    // We pass `req` to the logging function.
    await logClick(url, req);  

    return { status: 'success', url };
}

// --- NEW ANALYTICS FUNCTION ---
exports.getUrlAnalytics = async(urlId, userId) =>{
    // 1. verify ownership of the url
    const url = await Url.findById(urlId);
    if(!url || url.user.toString() !== userId.toString())
    {
        throw  new ApiError(404, 'No URL found with that ID for the current user, or you do not have permission to view its analytics.');
    }

    // 2. Define timetamps
    const now = new Date();
    const last24Hours = new Date(now.getTime() - (24*60*60*1000));
    const last7Days = new Date(now.getTime() - (7 * 24 * 60 *60*1000));
    const last30Days =  new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // 3. Perform aggregation queries in parallel 
    const [daily, weekly, monthly, referers, countries, browsers, os] = await Promise.all([
        Click.countDocuments({url:urlId, createdAt:{$gte:last24Hours}}),
        Click.countDocuments({url:urlId , createdAt:{$gte:last7Days}}),
        Click.countDocuments({url:urlId, createdAt:{$gte:last30Days}}),

        // Top 5 referer
        Click.aggregate([
            {
                $match:{url: new mongoose.Types.ObjectId(urlId)},
                
            },
            {
                $group:{
                    _id:'$referer',
                    count:{$sum:1},
                }
            },
            {
                $sort:{count:-1}
            },
            {
                $limit:5
            }
        ]),

        // Top 5 countties 
        Click.aggregate([
            {
                $match:{url: new mongoose.Types.ObjectId(urlId)}
            },
            {
                $group:{_id:'$country', count:{$sum:1}}
            },
            {
                $sort:{count:-1}
            },
            {
                $limit:5
            }
        ]),

        Click.aggregate([
            {
                $match:{url: new mongoose.Types.ObjectId(urlId)}
            },
            {
                $group:{_id:"$browser" , count:{$sum:1}}
            },
            {
                $sort:{count:-1}
            },
            {
                $limit:5
            }
        ]),

        // Top 5 Os
        Click.aggregate([
            {
                $match:{
                    url: new mongoose.Types.ObjectId(urlId)
                }
            },
            {
                $group:{_id:'$os' , count:{$sum:1}}
            },
            {
                $sort:{count:-1}
            },
            {
                $limit:5
            }
        ])

    ]);


    // 4. Format and return the results
    return {
        totalClicks: url.clicks,
        timeFrames:{
              daily,
            weekly,
            monthly,
        },
         topReferrers: referers,
        topLocations: countries,
        topBrowsers: browsers,
        topPlatforms: os,
    }

}


exports.updateUrl = async (urlId , userId , updateData) =>
{
    const url = await Url.findOne({_id:urlId, user:userId});
    if(!url)
    {
        throw new ApiError(404, "No URL found with that ID for the current user, or you do not have permission to edit it");        
    }

    // update fields from the request body
    if(updateData.originalUrl) url.originalUrl = updateData.originalUrl;
    if(updateData.isActive !== undefined) url.isActive = updateData.isActive;

    // handle password update 
    if(updateData.password !== undefined)
    {
        // setting password to null or empty string remove it 
        url.password = updateData.password ||  null;
    }

    await url.save();
    return url;
}

exports.verifyPasswordAndGetUrl = async (shortCode, password) =>{
    const url = await Url.findOne({shortCode}).select('+password');

    // Basic Checks again 
    if(!url || !url.isActive || (url.expiresAt && url.expiresAt < new Date()))
    {
        throw new ApiEror(404, 'this short line does not exist, is disabled or has expires');        
    }

    if(!url.password)
    {
        throw new ApiError(400, 'this like is not password protected ')
    }

    // use the instamce method to check the password
    const isMatch = await url.correctPassword(password);
    if(!isMatch)
    {
        throw new ApiError(401, 'Incorrect password');
    }

    // id password is correct. increments cliecks 
    await url.save();
    return url;

}

exports.generateQrCodeForUrl = async (urlId, userId,protocol, host ) =>{
     // 1. Find the URL and verify ownership
     const url = await Url.findOne({_id:urlId, user:userId});
     if(!url)
     {
        throw new ApiError(404,'No URL found with that ID for the current user, or you do not have permission to access it.');
     }

     // 2. Construct the full short URL that the QR code will point to
     const fullShortUrl = `${protocol}://${host}/${url.shortCode}`;
     try{
         // 3. Generate the QR code as a "Data URL" (a base64 encoded string)
         const qrCodeDataUrl = await qrcode.toDataURL(fullShortUrl,{
            errorCorrectionLevel: 'H', // High error correction
            type: 'image/png',
            margin: 2,
            color: {
                dark:"#ff012bff",
                light:"#FFFFFF"
            }
         })

         return qrCodeDataUrl;
     } catch(err)
     {
        console.error('QR Code generation failed:', err);
          throw new ApiError(500, 'Failed to generate QR code.');
     }
}

async function logClick(url, req){
    try{
        const ip = req.ip;
        const agent= useragent.parse(req.headers['user-agent']);
        const geo = geoip.lookup(ip);

        // create the new click document 
        await Click.create({
            url:url._id,
            ipAddress:ip,
            referer:req.get('Referer') || 'Direct',
            country: geo ? geo.country : 'Unknown',
            browser:agent.family,
            os:agent.os.family
        });
        // Also increment the simple counter on the main URL document
        url.clicks++;
        await url.save();
    } catch(err)
    {
         // We log the error but don't throw it, as failing to log a click
        // should not prevent the user from being redirected.
        console.log(`failed to log click:`,err);
    }
}