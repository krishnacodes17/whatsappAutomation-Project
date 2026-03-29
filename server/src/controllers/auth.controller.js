const User = require("../models/User");
const {
  registerUSerService,
  loginUserService,
  logoutUserService,
  forgotPasswordService,
  resetPasswordService
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


async function logoutUserController(req,res) {
   try {
    const token = req.cookies.accessToken;
    if(!token){
      return res.status(400).json({
        success: false,
        message: 'No token found'
      });
    }

     const result = await logoutUserService(token);

     res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });

     res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });



   } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
   }
}

// Forgot password controller
async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await forgotPasswordService(email);

    res.status(200).json(result);

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


// Reset password controller
async function resetPasswordController(req, res) {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset token, and new password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const result = await resetPasswordService(email, resetToken, newPassword);

    res.status(200).json(result);

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = { registerUserController, loginUserController , logoutUserController, forgotPasswordController, resetPasswordController};
