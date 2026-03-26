const User = require("../models/User");
const { registerUSerService } = require("../services/auth.service");

async function registerUserController(req, res) {
  try {
    const result = await registerUSerService(req.body);

    // ✅ Cookie set karo
    res.cookie("accessToken", result.token, {
      httpOnly: true, // JavaScript nahi access kar sakta
      secure: false, // Development ke liye false (production mein true)
      sameSite: "strict", // CSRF attack se bachao
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // ✅ Refresh token bhi set karo (separate cookie)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Response mein token nahi bhejana (optional - only send user data)
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

module.exports = { registerUserController };
