import app from '../server';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel API Serverless Invocation Exception:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Internal Serverless Function Error"
    });
  }
}



