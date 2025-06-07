import express from 'express';
import { registerController,loginContoller,testController, forgotPasswordContoller, updateProfileController, orderStatusController, getAllOrdersController, getOrdersController} from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post("/register", registerController);
//login || post
router.post("/login",loginContoller);
// forgot password ||post
router.post("/forgot-password",forgotPasswordContoller);
//test routes
router.get("/test",requireSignIn,isAdmin, testController);
// protected routes
router.get("/user-auth", requireSignIn, (req,res)=>{
    res.status(200).send({ok:true});
});
router.get("/admin-auth", requireSignIn,isAdmin, (req,res) =>{
    res.status(200).send({ok:true});
});
router.put("/profile", requireSignIn, updateProfileController);

router.get("/orders", requireSignIn, getOrdersController);

router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

router.put(
    "/order-status/:orderId",
    requireSignIn,
    isAdmin,
    orderStatusController
  );

export default router;