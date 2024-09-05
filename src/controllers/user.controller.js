import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
  // TO DO
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { fullName, email, username, password } = req.body;
  //console.log("email: ", email);
  // if (
  //     [fullName, email, username, password].some((field) => field?.trim() === "")
  // ) {
  //     return  apiError(400, "All fields are required");
  // }
  const missingFields = [];

  if (!fullName) missingFields.push("full name");
  if (!email) missingFields.push("email");
  else if (!(email.includes("@gmail.com") || email.includes("@outlook.com") || email.includes("@yahoo.com")) ) missingFields.push("use valid extension");
  if (!username) missingFields.push("username");
  if (!password) missingFields.push("password");


  
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



//  const file=[];

//  if (!("avatar" in req.files)) file.push("avatar is required");
//  if (!("coverImage" in req.files)) file.push("coverImage is required");
//  if (file.length > 0) {
//     const fileError= `${file.join(', ')}`;
//     apiError(res, 400, false, fileError);
//     return;
//  }  
// 1.validation correction 
// 2.multer file file upload
// 3.apiError handler to handle all errors respnose
// 4.apiResponse to handle all response 


//   if (!("coverImage" in req.files)) {
//     return apiError(res, 400, false, "Cover image file is required");
//   }
//   if (!("avatar" in req.files)) {
//     return apiError(res, 400, false, "Avatar file is required");
//   }

 
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
  //1.req body->>data
  //2.check input username or email
  //3.find the user
  //4.password check
  //5.generate access and refresh token
  //6.send cookie

  //1.req body->>data

  const { email, username, password } = req.body;
  // console.log(email);

  //2.username or email

  if (!username && !email) {
    apiError(res, 400, false, "username or email is required");
    return;
  }
  // here is an alternative of above code based on logic discussed
  // if(!(username || email)){
  //     apiError(400,"username or email is required");
  // }

  //3.find the user

  const user = await User.findOne({
    $or: [{ username }, { email }],
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
  // which user is changing the password
  const user = await User.findById(req.user?._id);

  // compare the old password with the new password
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    apiError(res, 400, false, "invalid old password");
    return;
  }

  // if correct then add the new password in the place of old password
  user.password = newPassword;

  // save the new password
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200), {}, "password changed successfully");
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
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
    .json(new apiResponse(200, user, "account details updated successfully"));
});






const deleteUser=asyncHandler(async(req,res)=>{
// delete to do
// 1.find id and delete it

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