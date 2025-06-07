import usermodel from "../models/usermodel.js";
import { comaparePassword, hashPassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";
 export const registerController = async(req,res) => {
    try{
const {name, email,password,phone,address,answer} = req.body;
if(!name){
    return res.send({message: "Name is required"});
}
if(!email){
    return res.send({message: "Email is required"});
}
if(!password){
    return res.send({message: "Password is required"});
}
if(!phone){
    return res.send({message: "Phone is required"});
}
if(!address){
    return res.send({message: "Address is required"});
}
if(!answer){
    return res.send({message: "Answer is required"});
}
const existinguser = await usermodel.findOne({email})
if(existinguser){
    return res.status(200).send({
        success: false,
        message: "Already Register please Login", 
    });
}
const hashedPassword = await hashPassword(password)
const user = await new usermodel({name,email,phone,address,password:hashedPassword,answer}).save();
res.status(201).send({
    success: true,
    message: "User Registered Successfully",
    user,
});
    }
    catch(error){
       console.log(error)
       res.status(500).send({
        success: false,
        message: "Error in Registration",
        error,

       });
    };
    
 };

 export const loginContoller = async(req,res) => {
    try{
const{email,password}= req.body;
if(!email || !password){
return res.status(400).send({
    success: false,
    message: "Invalid Email or Password",
});
}
const user = await usermodel.findOne({email});
if(!user){
    return res.status(400).send({
        success: false,
        message: "User not found",
    });
}
const match = await comaparePassword(password, user.password);
if(!match){
    return res.status(200).send({
        success: false,
        message: "Invalid Password",
    });
}
const token = JWT.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d",});
res.status(200).send({
    success: true,
    message: "Login Successfully",
    user:{
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
    },
    token,
});
    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in login",
            error,
        });
    }
 }; 
 
 export const testController = (req,res) => {
    try{
        res.send("Protected Route");
    }
    catch(error){
        console.log(error);
        res.send({error});
    }
 };


export const forgotPasswordContoller = async(req,res) => {
    try{
      const {email,answer,newPassword} = req.body;
      if(!email){
        return res.status(400).send({message: "Email is required"});
      }
      if(!answer){
        return res.status(400).send({message:"Answer is required"});
      }
      if(!newPassword){
        return res.status(400).send({message:"New Pasword is required"});
      }
      const user = await usermodel.findOne({email,answer});
      if(!user){
        return res.status(404).send({
            success:false,
            message: "Wrong Email or Answer",
      });
      }  
      const hashed = await hashPassword(newPassword);
      await usermodel.findByIdAndUpdate(user._id,{password: hashed});
      res.status(200).send({
        success:true,
        message: "Password Reset Successfully",
      });
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message: "Something went wrong",
            error,
        });
    }
};

export const updateProfileController = async (req, res) => {
    try {
      const { name, email, password, address, phone } = req.body;
      const user = await usermodel.findById(req.user._id);
      //password
      if (password && password.length < 6) {
        return res.json({ error: "Passsword is required and 6 character long" });
      }
      const hashedPassword = password ? await hashPassword(password) : undefined;
      const updatedUser = await usermodel.findByIdAndUpdate(
        req.user._id,
        {
          name: name || user.name,
          password: hashedPassword || user.password,
          phone: phone || user.phone,
          address: address || user.address,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated SUccessfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error WHile Update profile",
        error,
      });
    }
  };

  export const getOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ buyer: req.user?._id })
        .populate("products", "-photo")
        .populate("buyer", "name");
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };

  export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };
  
  //order status
  export const orderStatusController = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const orders = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Updateing Order",
        error,
      });
    }
  };