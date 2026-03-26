const User = require("../models/User");
const {
  registerUSerService,
  loginUserService,
} = require("../services/auth.service");

//  register user
async function registerUserController(req, res) {
  try {
    const result = await registerUSerService(req.body);

    //  Cookie set
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: false, // production turn in  true
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Refresh token  set in  (separate cookie)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "User registered successfully",
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

//  login user
async function loginUserController(req, res) {
  try {
    const result = await loginUserService(req.body);

    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: false,  // production turn in  true
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Refresh token  set in  (separate cookie)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "User login  successfully",
      user: result.user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { registerUserController, loginUserController };
