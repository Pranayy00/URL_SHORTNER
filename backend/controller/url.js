const{nanoid}=require("nanoid");
const validator=require("validator");
const URL=require("../model/url");


const handleGenerateNewShortURL=async (req,res)=>{
    try {
    const body=req.body
    if (!body.url) {
        return res.status(400).json({
            message:"url is required"
        });
        
    }

    if (!validator.isURL(body.url, { require_protocol: true })) {
        return res.status(400).json({
            success:false,
            message:"Please provide a valid URL (must include http:// or https://)"
        });
    }
    //using nnaoid
    const shortID=nanoid(8);
    //create new short-url
    const newURL=await URL.create({
        shortId:shortID,
        redirectURL:body.url,
        visitHistory:[],

    });
    res.status(201).json({
        success:true,
        message:"url created",
        data:newURL
    });
     

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error In Generate New Short Url",
            error:error.message
        });
        
    }
    
}

//GET|| to find at what time how many clicks has been done 
const handleGetAnalytics=async(req,res)=>{
    try {
        const shortId=req.params.shortId;
        const result=await URL.findOne({shortId});
        return res.json({
            totalClicks:result.visitHistory.length,
            analytics:result.visitHistory,
        });

        
    } catch (error) {
        res.status(500).send({
            success:false,
            message:"Error in get Analytic API",
            error:error.message
        });
        
    }

}


module.exports={handleGenerateNewShortURL,handleGetAnalytics}