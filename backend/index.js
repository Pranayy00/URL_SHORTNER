const express=require("express");
const path=require("path");
const cors=require("cors");
const router = require("./routes/url");
const { connectToMongoDB } = require("./connect");

const URL=require("./model/url");

const app=express();

//middlewares
app.use(cors());
app.use(express.json())

//serve the built frontend (frontend/dist) if it exists — lets one server
//handle both the API and the UI in production. In dev, run the Vite dev
//server separately (npm run dev in /frontend) which proxies /api to this server.
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));

//health check
app.get("/health",(req,res)=>{
    res.json({
        status:"ok",
        dbState: require("mongoose").connection.readyState // 0=disconnected,1=connected,2=connecting,3=disconnecting
    });
});

//GET
app.get("/:shortId",async (req,res)=>{
     const shortId=req.params.shortId;
     const entry=await URL.findOneAndUpdate(
        {
            shortId
        },{
            $push:{
                visitHistory:{
                    timestamp:Date.now(),
                }
            }
        }
    )

    if (!entry) {
        return res.status(404).json({
            success:false,
            message:"Short URL not found"
        });
    }

    res.redirect(entry.redirectURL);

});

const PORT=process.env.PORT || 8001

app.use("/url",router)

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);

});
