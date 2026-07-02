const express=require("express");
const { handleGenerateNewShortURL, handleGetAnalytics } = require("../controller/url");

const router=express.Router();

//post route
router.post("/",handleGenerateNewShortURL);

//GET
router.get("/analytics/:shortId",handleGetAnalytics);

//exports
module.exports=router