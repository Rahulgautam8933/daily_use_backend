
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // add the value to the object
    user.accessToken = refreshToken;
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    apiError(
      res,
      500,
      false,
      "something wnet wrong while generating refresh and access token"
    );
    return;
  }
};

const registerUser = asyncHandler(async (req, res) => {

  const { fullName, email, username, password } = req.body;
  
  
  const missingFields = [];
  
  if (!fullName) missingFields.push("full name");
  if (!email) missingFields.push("email");
  else if (!(email.includes("@gmail.com") || email.includes("@outlook.com") || email.includes("@yahoo.com")) ) missingFields.push("use valid extension");
  if (!username) missingFields.push("username");
  if (!password) missingFields.push("password");
  
  console.log("working");

  
  if (missingFields.length > 0) {
    const error = `The following fields are required: ${missingFields.join(", ")}`;
    apiError(res, 400, false, error);
    return;
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    apiError(res, 409, false, "User with email or username already exists");
    return;
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id)
  .select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    apiError(
      res,
      500,
      false,
      "Something went wrong while registering the user"
    );
    return;
  }
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {


  const { email,  password } = req.body;
 

  if (!email) {
    apiError(res, 400, false, " email is required");
    return;
  }


  const user = await User.findOne({
    $or: [ { email }],
  });
  if (!user) {
    apiError(res, 404, false, "user doesn't exist");
    return;
  }

  //4.password check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    apiError(res, 401, false, "password incorrect or invalid user credentials")
    return;
  }

  //5.generate access and refresh token

  //there can be a time taking situation to generate these two.
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //it's a optional step to get the token generation and call the db
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //6.send cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out")); // Correct usage of apiResponse
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;

  if (!(newPassword === confPassword)) {
    apiError(res, 400, false, "enter the same password");
    return;
  }
  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    apiError(res, 400, false, "invalid old password");
    return;
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200), {}, "password changed successfully");
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(req.user);

  const loggedInUser = await User.find();
  console.log("res", loggedInUser);

  const response = new apiResponse(200, loggedInUser, "Details fetched successfully");

  return res.status(200).json(response);
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    apiError(res, 400, false, "all fields are required");
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName, // in es6 new method
        email: email, // email:emailold method to set the value
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiResponse(200, user, "details updated successfully"));
});






const deleteUser=asyncHandler(async(req,res)=>{


await User.findOneAndDelete(req.user._id)


const options={
  http:true,
  secure:true,
}
return res
.status(200)
.json(new apiResponse(200,{},"user deleted successfully"));
})


export {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  deleteUser
};