const jwt = require("jsonwebtoken");

const redisClient = require("../config/redis");

// generateToken for 24 hours
const generateToken = (userId, email, role) => {
  return jwt.sign(
    {
      id: userId.toString(),
      email,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};

//  generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      id: userId.toString(),
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};



//  verify Token
const verifyToken = (token)=>{
    try {
        return jwt.verify(token , process.env.JWT_SECRET)
    } catch (error) {
        throw new Error("Invalid or expire Token ")
    }
}

//  store Session in redis
const storeSession = async (token , userData)=>{
    try {
         await redisClient.setEx(`session:${token}`, 7*24*60*60, JSON.stringify(userData))
    } catch (error) {
        console.error('Error storing session:', error);
    }
}


//  get Session to Redis 
const getSession = async (token) => {
  try {
    const sessionData = await redisClient.get(`session:${token}`);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};


//  Session delete (logout)
const deleteSession = async (token) => {
  try {
    await redisClient.del(`session:${token}`);
  } catch (error) {
    console.error('Error deleting session:', error);
  }
};




const blacklistToken = async (token) => {
  try {
    await redisClient.setEx(
      `blacklist:${token}`,
      24 * 60 * 60,  
      'true'
    );
    console.log('Token blacklisted successfully');
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
};

// Check if token blacklisted
const isTokenBlacklisted = async (token) => {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result !== null;
  } catch (error) {
    console.error('Error checking blacklist:', error);
    return false;
  }
};

// Store activity log
const storeActivityLog = async (userId, action, metadata = {}) => {
  try {
    const logKey = `activity:${userId}:${new Date().toISOString()}`;
    await redisClient.setEx(
      logKey,
      30 * 24 * 60 * 60,  // 30 days
      JSON.stringify({ action, ...metadata, timestamp: new Date() })
    );
  } catch (error) {
    console.error('Error storing activity log:', error);
  }
};




module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    storeSession,
    getSession,
    deleteSession,
    blacklistToken,
    isTokenBlacklisted,
    storeActivityLog
}