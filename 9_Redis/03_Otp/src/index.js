import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

function otpKey(phone) {
  return `otp:${phone}`;
}

app.post("/otp", async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(otpKey(phone), otp, "EX", 30); // OTP expires in 30 seconds
  res.json({ message: "OTP sent", otp }); // In production, you would send the OTP via SMS instead of returning it in the response
});

app.post("/verify", async (req, res) => {
  const { phone, otp } = req.body;
  const storedOtp = await redis.get(otpKey(phone));
  if (!storedOtp) {
    return res.status(400).json({ error: "OTP expired or not found" });
  }
  if (storedOtp === otp) {
    await redis.del(otpKey(phone)); // Remove the OTP from Redis after successful verification
    res.json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.get("/otp/:phone/ttl", async (req, res) => {
  const { phone } = req.params;
  const ttl = await redis.ttl(otpKey(phone));
  res.json({ ttl });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
