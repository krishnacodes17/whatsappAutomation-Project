const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  generateRefreshToken,
  storeSession,
  storeActivityLog,
  blacklistToken,
  deleteSession,
  getSession,
} = require("./token.service");
const { Error } = require("mongoose");


//  register serivice
async function registerUSerService(userData) {
  const { email, password, firstName="" , lastName="" } = userData;

  try {
    if (!email || !password) {
      throw new Error("all field is required");
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      throw new Error("email aready register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCount = await User.countDocuments();
    

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: userCount === 0 ? "admin" : "user"
    });

    await user.save();


    const token = generateToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    await storeSession(token, {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    
    return {
    success: true,
    message: 'User registered successfully',
    user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    },
    token,
    refreshToken
}


  } catch (error) {
    throw new Error(error.message);
  }
}


//  login service
async function loginUserService(userData) {
    const {email , password} = userData;

  try {

    if(!email || !password){
      throw new Error("Email and password is required")
    }


    //  check user exist or not 
    const user = await User.findOne({email}).select('+password');

    if(!user){
      throw new Error("Invalid email or password")
    }


    //  check password 
    const isPasswordValid = await bcrypt.compare(password ,user.password)

    if(!isPasswordValid){
      throw new Error("invalid email or password")
    }

    //  update last login
    user.lastLogin = new Date()
    await user.save()


    //  generate token  using user id , email and his role
    const token = generateToken(user._id , user.email ,user.role)
    const refreshToken = generateRefreshToken(user._id)


    //  store session in redis
    await storeSession(token , {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString(),
    })




    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    };


  } catch (error) {
    throw new Error(error.message)
  }


}



async function logoutUserService(token) {
  try {
    if (!token) {
      throw new Error("Token is required");
    }

    // 1. Get session from Redis
    const session = await getSession(token);
    
    // 2. Store activity log 
    if (session) {
      await storeActivityLog(session.userId, 'LOGOUT');
    }

    // 3. Delete session from Redis
    await deleteSession(token);

    // 4. Blacklist token 
    await blacklistToken(token);

    return {
      success: true,
      message: 'Logged out successfully'
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


// Forgot password service - generates reset token
async function forgotPasswordService(email) {
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists (security)
      return {
        success: true,
        message: "If email exists, reset token has been sent"
      };
    }

    // Generate reset token (6-character alphanumeric)
    const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in user document
    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    // Log activity
    await storeActivityLog(user._id.toString(), 'FORGOT_PASSWORD_REQUEST', { email });

    return {
      success: true,
      message: "If email exists, reset token has been sent",
      // For development: remove in production
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


// Reset password service - validates token and sets new password
async function resetPasswordService(email, resetToken, newPassword) {
  try {
    if (!email || !resetToken || !newPassword) {
      throw new Error("Email, reset token, and new password are required");
    }

    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Find user and verify reset token
    const user = await User.findOne({ email }).select('+resetToken +resetTokenExpires');
    
    if (!user) {
      throw new Error("User not found");
    }

    // Check if token is valid and not expired
    if (user.resetToken !== resetToken) {
      throw new Error("Invalid reset token");
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new Error("Reset token has expired");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    // Log activity
    await storeActivityLog(user._id.toString(), 'PASSWORD_RESET', { email });

    return {
      success: true,
      message: "Password reset successfully"
    };

  } catch (error) {
    throw new Error(error.message);
  }
}


module.exports = { registerUSerService, loginUserService, logoutUserService, forgotPasswordService, resetPasswordService };
