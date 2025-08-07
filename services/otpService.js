const { getRedisClient } = require("../config/redis");

const OTP_EXPIRE_TIME = 60 * 5; // 5 minutes

const generateOtp = (length = 6) => {
  const randomOTP = Math.floor(
    10 ** 5 + Math.random() * 9 * 10 ** 5
  ).toString();
  return randomOTP;
};

const createOtp = async (phone) => {
  const otp = generateOtp();
  const redis = getRedisClient();
  await redis.set(phone, otp, {
    EX: OTP_EXPIRE_TIME,
  });

  return otp;
};

const verifyOtp = async (phone, otp) => {
  const redis = getRedisClient();
  const storedOtp = await redis.get(phone);
  if (storedOtp === otp) {
    await redis.del(phone);
    return true;
  }
  return false;
};

module.exports = {
  createOtp,
  verifyOtp,
};
