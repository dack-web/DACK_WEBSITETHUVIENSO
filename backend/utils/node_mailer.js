// utils/mailer.js
const nodemailer = require("nodemailer");

const sendResetMail = async (toEmail, token) => {
    try {
        // Tạo transporter dùng Gmail
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // email bạn đã setting trong .env
                pass: process.env.EMAIL_PASS, // App Password nếu Gmail bật 2FA
            },
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        // HTML email đẹp
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #eee; padding: 20px; border-radius: 10px; background-color: #fafafa;">
            <h2 style="color: #333; text-align:center;">Reset Your Password</h2>
            <p style="color: #555; font-size: 16px;">
                We received a request to reset your password. Click the button below to set a new password. 
                <strong>This link is valid for 1 hour only.</strong>
            </p>
            <div style="text-align:center; margin: 30px 0;">
                <a href="${resetUrl}" style="
                    background-color: #4CAF50;
                    color: white;
                    padding: 15px 25px;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 5px;
                    display: inline-block;
                    font-size: 16px;
                ">Reset Password</a>
            </div>

            <div style="padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 6px; word-break: break-all; font-size: 13px;">
                ${resetUrl}
            </div>
            <p style="color: #777; font-size: 14px;">
                If you did not request a password reset, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #aaa; font-size: 12px; text-align:center;">
                &copy; ${new Date().getFullYear()} My App. All rights reserved.
            </p>
        </div>
        `;

        const mailOptions = {
            from: `"Library App Support" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "🔑 Reset Your Password",
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Reset password mail sent: %s", info.messageId);
    } catch (err) {
        console.error("Error sending reset email:", err);
        throw new Error("Cannot send reset email");
    }
};

module.exports = sendResetMail;
