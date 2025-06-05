/**
 * API route for forgot password
 *
 * This route handles password reset requests by calling our custom reset_password_api
 * which uses our own email template system
 */

import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists using our custom method
    try {
      const checkUserResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/elearning.api.auth.test_user_exists_for_reset`,
        { user_email: email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // If there's no error, the user exists
    } catch (userCheckError) {
      // Check if the error message indicates user not found
      if (userCheckError.response?.data?.message?.includes("not found")) {
        return res
          .status(404)
          .json({ message: "No user found with this email" });
      }

      // For any other error, log and return
      console.error(
        "User check returned an error:",
        userCheckError.response?.data || userCheckError.message
      );
      return res
        .status(500)
        .json({ message: "An error occurred when checking user" });
    }

    // Call our custom reset password API
    try {
      const resetResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/elearning.api.auth.reset_password_api`,
        { user_email: email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Return success response
      return res.status(200).json({
        success: true,
        message: "Password reset link has been sent to your email",
      });
    } catch (resetError) {
      console.error(
        "Reset password error:",
        resetError.response?.data || resetError.message
      );
      return res
        .status(500)
        .json({ message: "An error occurred when sending reset email" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);

    return res
      .status(500)
      .json({ message: "An error occurred. Please try again." });
  }
}
