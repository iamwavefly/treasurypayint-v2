const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const isRequired = () => {
  throw new Error("param is required");
};

const sendMail = async (
  receiver = isRequired(),
  title = isRequired(),
  htmlBody = isRequired()
) => {
  const smtp = nodemailer.createTransport({
    host: "127.0.0.1",
    port: 1025,
    secure: false,
    auth: {
      user: "support@treasurypayint.com",
      pass: "iTslIFHJydxun_kKlisilg",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "Treasury PayInt PayInt <support@treasurypayint.com>",
    to: receiver,
    subject: title,
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "/assets/logo.png"),
        cid: "logo",
      },
      {
        filename: "signup_banner.png",
        path: path.join(__dirname, "/assets/signup_banner.gif"),
        cid: "signup_banner",
      },
      {
        filename: "img_disapproved.gif",
        path: path.join(__dirname, "/assets/img_disapproved.gif"),
        cid: "img_disapproved",
      },
    ],
    html: htmlBody,
  };

  smtp.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendMail;
