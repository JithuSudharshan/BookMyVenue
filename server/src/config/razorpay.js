import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

let razorpayInstance = null;

export const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn('[WARNING] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment functionality will fail.');
        }

        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
        });
    }
    return razorpayInstance;
};
