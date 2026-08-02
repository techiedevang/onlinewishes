import dns from "node:dns/promises";
import validator from "deep-email-validator";

const TYPO_DOMAINS = {
  "gmaill.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmaill.in": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yaho.in": "yahoo.in",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "iclaud.com": "icloud.com"
};

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "mailinator.com", "10minutemail.com", "guerrillamail.com",
  "trashmail.com", "yopmail.com", "dispostable.com", "sharklasers.com",
  "getnada.com", "fakeinbox.com", "throwawaymail.com", "temp-mail.org",
  "bmail.com", "disposable.com", "fake.com", "example.com", "test.com",
  "maildrop.cc", "mytemp.email", "tempmailo.com", "crazymailing.com",
  "nada.ltd", "mohmal.com", "tempmail.net", "tempmail.org", "byom.de",
  "generator.email", "inboxkitten.com", "fake.org", "test.org", "temp.com"
]);

export async function validateEmailAddress(emailStr) {
  if (!emailStr || typeof emailStr !== "string") {
    return { valid: false, reason: "regex", error: "Email is required." };
  }

  const cleanEmail = emailStr.trim().toLowerCase();

  // 1. Strict Regex Check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, reason: "regex", error: "Invalid email format." };
  }

  const parts = cleanEmail.split("@");
  if (parts.length !== 2) {
    return { valid: false, reason: "regex", error: "Invalid email format." };
  }

  const [username, domain] = parts;

  if (!username || username.length < 2) {
    return { valid: false, reason: "regex", error: "Username in email is too short." };
  }

  // 2. Check Typo Domains
  if (TYPO_DOMAINS[domain]) {
    const suggestion = TYPO_DOMAINS[domain];
    return {
      valid: false,
      reason: "typo",
      error: `Did you mean ${username}@${suggestion}? '${domain}' seems to have a typo.`
    };
  }

  // 3. Check Disposable Domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: "disposable",
      error: "Temporary or disposable email addresses are not allowed. Please use a real email."
    };
  }

  // 4. DNS MX Lookup to check if domain actually exists and receives mail
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      // Check fallback A record
      try {
        const aRecords = await dns.resolve4(domain);
        if (!aRecords || aRecords.length === 0) {
          return {
            valid: false,
            reason: "mx",
            error: `The domain '${domain}' does not exist or has no mail servers.`
          };
        }
      } catch (aErr) {
        return {
          valid: false,
          reason: "mx",
          error: `The domain '${domain}' does not exist or cannot receive emails.`
        };
      }
    }
  } catch (dnsErr) {
    return {
      valid: false,
      reason: "mx",
      error: `The domain '${domain}' does not exist or has no valid mail servers.`
    };
  }

  // 5. Deep email validator
  try {
    const deepRes = await validator({
      email: cleanEmail,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false
    });

    if (!deepRes.valid) {
      return {
        valid: false,
        reason: deepRes.reason || "invalid",
        error: "This email address failed validation checks. Please enter a real email address."
      };
    }
  } catch (deepErr) {
    console.warn("Deep email validator warning:", deepErr);
  }

  return { valid: true };
}

export default async function handler(req, res) {
  try {
    const email = (req.query?.email || req.body?.email || "").toString();
    const result = await validateEmailAddress(email);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Email validation endpoint error:", error);
    return res.status(200).json({ valid: true });
  }
}
