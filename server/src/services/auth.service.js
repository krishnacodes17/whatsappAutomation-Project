const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  generateRefreshToken,
  storeSession,
} = require("./token.service");

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

module.exports = { registerUSerService };
