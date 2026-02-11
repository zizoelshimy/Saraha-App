import { Router } from "express";
import { profile } from "./user.service.js";
import { updateProfile } from "./user.service.js";
const router=Router()

router.get("/:userID" , async (req,res,next)=>{
    const result  = await profile(req.params.userID)
    return res.status(200).json({message:"Profile" , result})
})
router.patch("/:userID" , async (req,res,next)=>{
    const user  = await updateProfile(req.params.userID, req.body)
return res.status(200).json({message:"Profile Updated" , user})
});
export default router