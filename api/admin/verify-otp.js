export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { adminEmail, otp } = req.body;
    const targetAdmin = (adminEmail || "").trim().toLowerCase();
    
    if (targetAdmin !== "admin@onlinewishes.in") {
      return res.status(403).json({ error: "Unauthorized email address." });
    }

    // Attempt to read from global store (works if same hot container in serverless)
    const storedData = global.adminOtpStore?.get("admin@onlinewishes.in");
    
    // On Vercel, if container restarts, the memory is wiped. 
    // Fallback logic for Vercel (ideally use Firestore for this).
    if (!storedData) {
      // If we don't have it, we could reject or accept a master password if set up.
      // For now, if no stored data, we just reject unless they provide a hardcoded fallback 
      // (if they want one, they can configure it).
      return res.status(400).json({ error: "No OTP found or container reset. Please request a new code." });
    }

    if (Date.now() > storedData.expiresAt) {
      global.adminOtpStore.delete("admin@onlinewishes.in");
      return res.status(400).json({ error: "OTP code expired. Please request a new code." });
    }

    if (storedData.code !== (otp || "").trim()) {
      return res.status(400).json({ error: "Invalid 6-digit OTP code." });
    }

    // OTP Verified
    global.adminOtpStore.delete("admin@onlinewishes.in");
    
    res.json({
      success: true,
      message: "Admin OTP verified successfully.",
      user: {
        id: "admin-master-id",
        name: "Master Admin",
        email: "admin@onlinewishes.in",
        role: "admin",
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
}
