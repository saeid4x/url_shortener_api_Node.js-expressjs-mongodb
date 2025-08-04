const urlService = require("../../application/services/url.service");
const {createUrlSchema, verifyPasswordSchema,updateUrlSchema} = require("../../domain/validators/url.validator");
const {ApiError} = require("../../utils/ApiError");

exports.createShortUrl = async(req,res,next) =>{
    try{
        const {error, data} = createUrlSchema.safeParse(req.body);
        if(error)
        {
            return next(400,new ApiError(error.errors.map(e=>e.message).join(', ')));
        }

        // req.user is attached by our 'protected' middleware
        const newUrl =await urlService.createShortUrl(data,req.user._id);

        const fullShortUrl = `${req.protocol}://${req.get('host')}/${newUrl.shortCode}`;
        res.status(201).json({
            status:'success',
            data:{
                ...newUrl.toObject(),
                fullShortUrl
            }
        })
    }catch(err)
    {
        next(err);
    }
};

exports.getMyUrls = async (req,res,next) =>{
    try{
        const urls = await urlService.getUrlsForUser(req.user._id);
        res.status(200).json({
            status:'success',
            results:urls.length,
            data:{
                urls
            }
        })
    }catch(err)
    {
        next(err);
    }
}

exports.deleteUrl = async(req,res,next) =>{
    try{
        await urlService.deleteUrl(req.params.id, req.user._id);
        res.status(204).json({
            status:'success',
            data:null
        });
    }catch(err)
    {
        next(err);
    }
}

exports.redirectToOriginalUrl = async(req,res,next) =>{
    try{
        const {shortCode} = req.params;
        const result = await urlService.findUrlByCode(shortCode,req);

        // if(!url)
        // {
        //      // You can redirect to a 404 page or just send a 404 status
        //      return next(new ApiError(404,'This short link does not exist or has expired'));

        // }

        // res.redirect(302,url.originalUrl);

         switch (result.status) {
            case 'success':
                return res.redirect(302, result.url.originalUrl);
            case 'password_protected':
                // For an API, we send a clear response. A frontend would use this
                // to render a password prompt.
                return res.status(403).json({
                    status: 'password_required',
                    message: 'This link is protected by a password.',
                });
            case 'disabled':
                return next(new ApiError(403, 'This link has been disabled by its owner.'));
            case 'expired':
            case 'not_found':
            default:
                return next(new ApiError(404, 'This short link does not exist or has expired.'));
        }
    } catch(error)
    {
        next(error);
    }
}

exports.updateUrl = async(req,res,next) =>{
    try{
        const {error, data } = updateUrlSchema.safeParse(req.body);
        if(error){
            return next(new ApiError(400,error.errors.map(e => e.message).join(', ') ));
        }

        const updateUrl = await urlService.updateUrl(req.params.id, req.user._id, data);
        res.status(200).json({
            status:'success',
            data:{
                url:updateUrl
            }
        })
    }
    catch(err)
    {
        next(err);
    }
}

exports.verifyPassword = async(req,res,next) =>{
    try{
        const {error, data} =  verifyPasswordSchema.safeParse(req.body);
        if(error)
        {
            return next(new ApiError(400, error.errors.map(e =>e.message).join(', ')));
        }

        const url = await urlService.verifyPasswordAndGetUrl(req.params.shortCode,data.password);
        console.log(`--- short code `, req.params)
        // on succecss, return the original URL  for the client to handle redirection
        res.status(200).json({
            status:'success',
            originalUrl:url.originalUrl
        })
    } catch(err)
    {
        next(err);
    }
}

exports.getQrCode = async(req,res,next) =>{
    try{
           // The service needs the protocol (http/https) and host (localhost:5000)
        // from the request object to build the full URL.
        const qrCodeDataUrl = await urlService.generateQrCodeForUrl(
            req.params.id,
            req.user._id,
            req.protocol,
            req.get('host')
        );

         res.status(200).json({
            status: 'success',
            message: 'QR Code generated successfully.',
            data: {
                qrCodeDataUrl, // This is the base64 data URL for the QR code image
            },
        });
    } catch(err)
    {
         next(err);
    }
}

exports.getAnalytics = async (req,res,next) => 
{
    try{
        const analyticsData = await urlService.getUrlAnalytics(req.params.id, req.user._id);
        res.status(200).json({
            status:'success',
            data:{
                analytics:analyticsData
            }
        })
    }catch(err)
    {
        next(err);
    }
}