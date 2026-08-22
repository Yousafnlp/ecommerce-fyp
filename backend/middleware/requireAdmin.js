import { User } from "../models/User.js";

/**
 * Server-side admin authorization for mutations.
 *
 * Verifies the JWT subject against the live database so that role changes
 * or account disabling take effect immediately, instead of trusting a
 * role claim that may be up to 15 minutes old (access-token lifetime).
 * Must run after authenticateToken.
 */
export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account no longer exists",
      });
    }

    if (user.status === "disabled") {
      return res.status(403).json({
        success: false,
        message: "This account has been disabled",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: error.message,
    });
  }
}
