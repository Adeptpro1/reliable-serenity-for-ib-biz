import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

class PaystackService {
  static async initializeTransaction(email, amount) {
    try {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: Math.round(amount * 100), // Convert to kobo
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Paystack Initialization Error:", error.response?.data || error.message);
      throw new Error("Failed to initialize Paystack transaction");
    }
  }

  static async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Paystack Verification Error:", error.response?.data || error.message);
      throw new Error("Failed to verify Paystack transaction");
    }
  }
}

export default PaystackService;
