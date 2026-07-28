import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const key_id = process.env.RAZORPAY_KEY_ID?.trim();
    const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

    const razorpay = key_id && key_secret
      ? new Razorpay({
          key_id,
          key_secret,
        })
      : null;

    if (!razorpay) {
      return res.json({ 
        id: `order_mock_${Date.now()}`, 
        amount: req.body?.amount ? Math.round(Number(req.body.amount) * 100) : 19900, 
        currency: "INR", 
        receipt: `receipt_order_${Date.now()}` 
      });
    }

    const amountInRupees = req.body?.amount ? Number(req.body.amount) : 199;
    const options = {
      amount: Math.round(amountInRupees * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ ...order, key_id });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ error: "Could not create order", details: error.message || error });
  }
}
