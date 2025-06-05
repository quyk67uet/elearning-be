/**
 * API route for resending verification email
 *
 * This route calls Frappe API to resend verification email
 * We use only Frappe's email system (configured in Frappe Desk UI)
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

    // Call Frappe API to resend verification email
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_FRAPPE_URL}/api/method/elearning.api.auth.resend_verification_email_api`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      
      // Return the response from Frappe API
      return res.status(200).json({
        success: true,
        message: "Verification email has been sent"
      });
    } catch (error) {
      // Handle specific errors from Frappe API
      if (error.response?.data?.message) {
        return res.status(error.response.status || 400).json({
          message: error.response.data.message
        });
      }
      
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      message: "An error occurred when sending the verification email"
    });
  }
}
