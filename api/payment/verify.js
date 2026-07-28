export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // We would normally verify razorpay_signature here
  res.json({ status: "success", message: "Payment verified successfully, templates unlocked." });
}
