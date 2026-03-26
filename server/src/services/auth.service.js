const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  generateRefreshToken,
  storeSession,
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



module.exports = { registerUSerService , loginUserService };
