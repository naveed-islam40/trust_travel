import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.HOST_EMAIL,
        pass: process.env.EMAIL_PASSKEY,
    }
})

export default transporter