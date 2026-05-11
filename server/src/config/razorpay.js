// backend/config/razorpay.js
import Razorpay  from  'razorpay';
import { config } from "./env.js";
if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials missing in environment variables');
}

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

export default razorpay;