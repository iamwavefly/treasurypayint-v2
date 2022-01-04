const express = require("express");
const User = require("../models/User");
const Bank = require("../models/Bank");
const Card = require("../models/Card");
const Notification = require("../models/Notification");
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const uuid = require("uuid").v4;
const passport = require("passport");
const multer = require("multer");
const mailgun = require("mailgun-js");
const Transaction = require("../models/Transaction");
const sendSms = require("../helper/sendsms");
require("dotenv").config();

const { ensureAuthenticated } = require("../config/auth");
const sendMail = require("../helper/sendMail");
const signUpTemp = require("../template/email/signup");
const taiDecline = require("../template/email/tai-decline");

const { default: axios } = require("axios");
const accountSid = "ACcb7a00cf6931b88daa74a25ed882a2f3";
const authToken = "dacedcbafcd7cd6aff9bc8b2080b817c";
const moment = require("moment");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");
const imageDisapproved = require("../template/email/image-disapproved");
const otpTemp = require("../template/email/opt");
const forgotPasswordTemp = require("../template/email/forgot-password");
const { ensureIndexes } = require("../models/Card");

// initialize express
const route = express.Router();
// AWS config
const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
});
// Multer configs
const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, "");
  },
});

const upload = multer({ storage });

// routes

route.post("/tai/verify", async (req, res) => {
  const { tai } = req.body;
  User.findOne({ tai: tai }).then((data) => {
    if (!data) {
      return res.status(400).json({
        message:
          "Invalid Transfer Access ID, please contact support on how to get your TAI",
      });
    }
    res.json({
      user: data,
    });
  });
});
route.get("/linked", (req, res) => {
  res.render("linked", {
    user: req.user,
  });
});
route.get("/success", (req, res) => {
  res.render("success", {
    layout: false,
  });
});
route.get("/auth/login", (req, res) =>
  res.render("user", {
    user: req.user,
    layout: false,
  })
);
route.get("/verify", verifyToken, (req, res) => {});
route.get("/auth/register", (req, res) =>
  res.render("user", { user: req.user, layout: false })
);
// route.get("/signup", (req, res) => res.render("signup"));

function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
route.post(
  "/image-upload",
  upload.single("profile"),
  async (req, res, done) => {
    let uploadedFile = req.file.originalname.split(".");
    const fileType = uploadedFile[uploadedFile.length - 1];

    const params = {
      Bucket: "worldbankpayint",
      Key: `assets/${uuid()}.${fileType}`,
      Body: req.file.buffer,
    };
    try {
      s3.upload(params, (error, data) => {
        if (error) return console.log(error);
        console.log(data.Location);
        User.findByIdAndUpdate(
          req.user?.id,
          {
            $set: {
              profile: data.Location,
            },
          },
          (err, user) => {
            if (err) return err;
            res.status(201).json({
              message: "image updated",
            });
          }
        );
      });
    } catch (error) {}
  }
);
// post request
route.post(
  "/auth/register",
  upload.single("profile"),
  async (req, res, done) => {
    // let myFile = req.file.originalname.split(".");
    // const fileType = myFile[myFile.length - 1];

    // const params = {
    //   Bucket: "worldbankpayint",
    //   Key: `assets/${uuid()}.${fileType}`,
    //   Body: req.file.buffer,
    // };
    let { username, first_name, other_name, email, password, password2 } =
      req.body;
    // push err here
    let err = [];
    const pattern = /^[a-zA-Z0-9_.-]*$/;
    // validate fields
    if (
      !username ||
      !first_name ||
      !other_name ||
      !email ||
      !password ||
      !password2
    ) {
      err.push({
        msg: "Please fill all fields to create your international account",
      });
    }
    // check pass match
    if (password.length > 0) {
      if (password !== password2) {
        err.push({ msg: "Password does not match" });
      }
    }
    if (username.length > 0) {
      if (first_name.length > 0) {
        if (
          username.toLowerCase().includes(first_name.toLowerCase()) ||
          username.toLowerCase().includes(other_name.toLowerCase())
        ) {
          err.push({
            msg: "You cannot use your firstname or lastname as username",
          });
        }
      }
      if (
        username.length < 6 ||
        username.length > 8 ||
        !username.match(pattern)
      ) {
        err.push({
          msg: "Username should be a minimum of 6 characters and a maximum of 8 characters (only alphanumeric, no symbols)",
        });
      }
    }
    // check pass length
    if (password.length < 8) {
      err.push({ msg: "Password length must be atleast 8 characters" });
    }
    if (err.length > 0) {
      res.render("user", {
        err,
        title: "Registration Error",
        layout: false,
        username,
        first_name,
        other_name,
        email,
        password,
        password2,
      });
    } else {
      // find username
      const user = await User.findOne({ username: username });
      // check if username exist
      if (user) {
        err.push({ msg: "Username already exists" });
        return res.render("user", {
          err,
          username,
          first_name,
          other_name,
          email,
          password,
          password2,
          layout: false,
          title: "Error",
        });
      }

      // find email
      const userEmail = await User.findOne({ email: email });
      // check if username exist
      if (userEmail) {
        err.push({ msg: "Email already exists" });
        return res.render("user", {
          err,
          username,
          first_name,
          other_name,
          email,
          password,
          password2,
          layout: false,
          title: "Error",
        });
      }
      // upload photo to s3 bucket
      // try {
      // s3.upload(params, async (error, data) => {
      // if (error) return error;
      // Create token
      const token = jwt.sign({ username }, "secrete");

      //Encrypt user password
      const newUser = new User({
        username,
        first_name,
        other_name,
        email,
        password,
      });
      bcrypt.hash(newUser.password, 10, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then((user) => {
            sendMail(
              email,
              "CONGRATULATIONS!!! ***Account Created***",
              signUpTemp(
                user.first_name,
                user.username,
                user.user_id,
                user.routing_number,
                token
              )
            );
            req.flash(
              "success_msg",
              "Your account has been registered, please check your email for more details"
            );
            res.redirect("/users/auth/login");
          })
          .catch((err) => console.log(err));
      });
      // });
      // } catch (error) {
      //   return error;
      // }
    }
    // }
  }
);
// login route
route.post("/auth/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/auth/login",
    failureFlash: true,
  })(req, res, next);
});

route.post("/card/new", async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const cardDetails = { ...req.body, user_id: user.id };
  const { card_number, month, year, card_cvv } = req.body;

  if (card_number.length < 12 || card_number.length > 16) {
    return res.status(400).json({
      message: "Card number can only be between 12 and 16",
    });
  }

  if (card_cvv.length < 2 || card_cvv.length > 3) {
    return res.status(400).json({
      message: "Card CVV length can only be 3",
    });
  }
  if (month.length > 2) {
    return res.status(400).json({
      message: "Card expiry month cannot be greather than 2",
    });
  }
  if (year.length !== 4) {
    return res.status(400).json({
      message: "Card expiry year length can only be 4",
    });
  }

  const newCard = await Card.create(cardDetails);
  user.card = newCard.id;
  await user.save();
  return res.status(201).json({
    message: "Successfully added",
  });
});

route.post("/transaction", (req, res) => {
  Transaction.create(req.body);
  req.flash(
    "success_msg",
    "Hey, make sure you input your international transfer access Id correctly to complete this transaction"
  );
  res.redirect("/dashboard");
});

route.put("/verify/:id", upload.single("verify_id"), (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        marital_status: req.body.marital_status,
        occupation: req.body.occupation,
        income: req.body.income,
        verify_id: req.file.filename,
      },
    },
    function (err, user) {
      if (err) return err;
      res.redirect("/users/success");
    }
  );
});

route.put("/checkpoint/:id", (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    function (err, user) {
      if (err) return err;

      res.redirect("/users/linked");
    }
  );
});
// Logout handle
route.get("/logout", async (req, res) => {
  const user = await User.findById(req.user?.id);
  user.online_status = false;
  await user.save();
  req.logout();
  req.flash("success_msg", "You're now logout");
  res.redirect("/");
});

route.delete("/remove/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id, function () {
    res.redirect("/admin");
  });
});
let options = {
    timeZone: "Europe/London",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  },
  formatter = new Intl.DateTimeFormat([], options);

route.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  User.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true },
    async (err, newUser) => {
      if (err) return err;
      const userId = "" + newUser.user_id;
      const smsData = `
Treasury PayInt PayInt
Txn: Credit
Acct: ${userId.substr(0, 3)}****${userId.substr(userId.length - 3)} 
Date: ${formatter.format(new Date())}
Narration: Treasury PayInt Payint/${newUser.first_name} ${newUser.other_name}
Credit Amt: ${(newUser.available - user.available).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}
Status: Successs
Bal: ${newUser.available.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}
REF: ${Math.random() * 100000000}

Contact us for more info at contact@treasurypayint.com
`;
      if (newUser.available > user.available) {
        sendSms(smsData, newUser.number);
        await User.findByIdAndUpdate(newUser.id, {
          $set: { recent_received: newUser.available - user.available },
        });
      } else {
        console.log("debit");
      }
      req.flash("success_msg", "User updated");
      if (req.user.username === "Admin") return res.redirect("/admin");
      res.redirect("/profile");
    }
  );
});

let number = 9999;
let ram = Math.floor(Math.random() * number);
if (ram.length < 4) {
  ram + 1;
}

route.put("/update/tai/:id", (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $set: { tai: ram } })
    .then((response) => {
      res.redirect("/admin");

      // -> TAI route (email sender)
      const DOMAIN = "treasurypayint.com";
      const mg = mailgun({
        apiKey: "21f16914e8e3c3cfb6194bd443354d56-4879ff27-7d0c571d",
        domain: DOMAIN,
      });
      const email = req.user.email;
      const data = {
        from: "Treasury PayInt PayInt <support@treasurypayint.com>",
        to: email,
        subject: "Congratulations!!!",
        html: `
        <!DOCTYPE html>
        <html style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
        <head>
        <meta name="viewport" content="width=device-width" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Login Alert</title>
        
        
        <style type="text/css">
        img {
        max-width: 100%;
        }
        body {
        -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;
        }
        body {
        background-color: #f6f6f6;
        }
        @media only screen and (max-width: 640px) {
          body {
            padding: 0 !important;
          }
          h1 {
            font-weight: 800 !important; margin: 20px 0 5px !important;
          }
          h2 {
            font-weight: 800 !important; margin: 20px 0 5px !important;
          }
          h3 {
            font-weight: 800 !important; margin: 20px 0 5px !important;
          }
          h4 {
            font-weight: 800 !important; margin: 20px 0 5px !important;
          }
          h1 {
            font-size: 22px !important;
          }
          h2 {
            font-size: 18px !important;
          }
          h3 {
            font-size: 16px !important;
          }
          .container {
            padding: 0 !important; width: 100% !important;
          }
          .content {
            padding: 0 !important;
          }
          .content-wrap {
            padding: 10px !important;
          }
          .invoice {
            width: 100% !important;
          }
        }
        </style>
        </head>
        
        <body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">
        
        <table class="body-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
            <td class="container" width="600" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
              <div class="content" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 40px;">
                <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top">
                      <meta itemprop="name" content="Confirm Email" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" /><table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                            Dear ${req.user.first_name},
                          </td>
                        </tr><tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                          Congratulations! As one of our new lifetime Transfer Access Id (TAI) holders, we are pleased to welcome you to our world of secure, convenient and endless possibilities on bill payments and other transactions.
                          </td>
                        </tr>
                        <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                          Treasury PayInt Treasury PayInt Transfer Access “TAI” is a dollar denominated internationally accepted payment and transactions ID from the staple of Treasury PayInt PayInt International.
                          </td>
                        </tr>
                        <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://www.treasurypayint.com" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                        For instant issuance, your TAI will be visible through the  button below labelled “View My TAI” <br>
                        <h3>GETTING STARTED</h3>
                    <ul>
                      <li>Click on the “View My TAI” button below.</li>
                      <li>Input your “Account ID”.</li>
                      <li>Confirm your Treasury PayInt PayInt login password.</li>
                      <li>Click on "Validate" to view your “TAI” and your account name.</li>
                    </ul>
                          <br>
                          <a href="https://www.treasurypayint.com/view-tai" alt="treasurypayint" title="Treasury Payint" class="btn-primary" itemprop="url" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 1.2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #348eda; margin: 0; border-color: #348eda; border-style: solid; border-width: 10px 20px;">View My TAI</a>
                          </td>
                        </tr>
                        <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                        Once again, we thank you for choosing the Treasury PayInt Treasury PayInt and we welcome you to our world of endless possibilities.
                          </td>
                        </tr>
                        <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                          From Your Account Security Department <br>
                          Word Bank | PayInt
                          </td>
                        <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="line-height: 1.2rem; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; margin: 0; padding: 0 0 10px; color: #348eda" valign="top">
                            Remember, Treasury PayInt Treasury PayInt will NEVER ask you for your personal information over the phone, via email or by SMS. Please do not share your bank details with anyone. Report all fraud-related issues to our Fraud Helpline Team at <a href="mailto:support@treasurypayint.com" style="color: #348eda">support@treasurypayint.com</a>
                          </td>
                        </tr>
                        
                        
                        </table></td>
                  </tr></table></div>
            </td>
            <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
          </tr></table></body>
        </html>
        `,
      };
      mg.messages().send(data, function (error, body) {
        if (error) return;
        res.redirect("/dashboard");
      });
    })
    .catch((err) => {
      return err;
    });
});

route.put("/profile/update/:id", async (req, res) => {
  const { flag } = req.body;
  console.log(flag);
  User.findByIdAndUpdate(
    req.params.id,
    { $set: { ...req.body, flag } },
    { new: true },
    (err, user) => {
      if (err) return err;
      req.flash("success_msg", "User updated");
      if (req.user.username === "Admin") return res.redirect("/admin");
      res.status(201).json({
        message: "Profile updated",
        user,
      });
    }
  );
});
route.put("/account/update/:id", (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    function (err, user) {
      if (err) throw err;
      req.flash("success_msg", "Successfully updated");
      res.redirect("/admin");
    }
  );
});
route.put("/account/reset/:id", (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    function (err, user) {
      if (err) throw err;
      req.flash("success_msg", "Successfully updated");
      res.redirect("/admin");
    }
  );
});
// route.put('/account/update/:id', (req, res) => {
//   User.findByIdAndUpdate(
//     req.params.id,
//     { $set: req.body },
//     function (err, user) {
//       if (err) throw err;
//       req.flash('success_msg', 'Successfully updated');
//       res.redirect('/profile');
//     }
//   );
// });
// route.put('/account/reset/:id', (req, res) => {
//   User.findByIdAndUpdate(
//     req.params.id,
//     { $set: req.body },
//     function (err, user) {
//       if (err) throw err;
//       req.flash('success_msg', 'Successfully updated');
//       res.redirect('/profile');
//     }
//   );
// });

route.post("/bank/new", async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const { account_name } = req.body;
  const bankDetails = { ...req.body, user_id: user.id };

  if (
    !account_name.toLowerCase().includes(user.first_name.toLowerCase()) ||
    !account_name.toLowerCase().includes(user.other_name.toLowerCase())
  ) {
    return res.status(400).json({
      message: `Hello ${user.username}, you bank name must match with the name on your profile, for security reason. Please contact the bank for assistance`,
    });
  }
  const newBank = await Bank.create(bankDetails);
  user.bank = newBank.id;
  await user.save();
  res.status(201).json({
    message: "Bank added success",
  });
});

route.post("/disapprove-img/:id", async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(
    id,
    { $set: { profile: "" } },
    { new: true },
    async (err, user) => {
      if (err) throw err;
      const notification = new Notification({
        title: "Welcome",
        content: "hello",
        user_id: user.id,
      });
      const notifRes = await notification.save();
      User.findById(user.id, (err, newUser) => {
        if (!err) {
          newUser.notifications.push(notifRes.id);
          newUser.save();
        } else {
          return;
        }
      });
      sendMail(
        user.email,
        "Profile image disapproved!",
        imageDisapproved(user.first_name)
      );
      req.flash("success_msg", "Successfully updated");
      res.redirect("/admin");
    }
  );
});
route.post("/alert/:type/:action/:id", (req, res) => {
  const { type, action, id } = req.params;
  User.findByIdAndUpdate(id, { $set: { [type]: action } }, (err, user) => {
    if (err) throw err;
    req.flash("success_msg", "Successfully updated");
    res.redirect("/dashboard");
  });
  console.log(req.params);
});

route.post("/otp/:id", async (req, res) => {
  const { id } = req.params;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const user = await User.findById(id);
  sendMail(
    user.email,
    "Your One Time Password (OTP)",
    otpTemp(user.first_name, otp)
  );
  const otpToken = jwt.sign(
    {
      otp,
    },
    "secret",
    { expiresIn: "10m" }
  );
  user.otp_token = otpToken;
  // send sms
  const smsData = `
Treasury PayInt
Your One Time Password (OTP) for Treasury Payint transfer is: ${otp}. Expires in 10 mins.

If you did not initiate this request, kindly contact us at contact@treasurypayint.com
  `;
  // await sendSms(smsData, user.number);

  // send email
  await user.save();
  res.send("sent");
});

route.get("/verify-otp/:id/:otp", async (req, res) => {
  const { otp, id } = req.params;
  const { otp_token } = await User.findById(id);
  const decodedOtp = jwt.verify(otp_token, "secret");

  if (otp != decodedOtp.otp) {
    return res.status(400).json({
      message: "wrong otp",
    });
  }

  res.status(200).json({
    message: "Verified",
  });
});

route.get("/verify-account/:account", async (req, res) => {
  const { account } = req.params;
  const user = await User.findOne({ user_id: account });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: user,
  });
});

route.get("/auth/forgot-password", (req, res) =>
  res.render("forgot-password", {
    user: req.user,
    layout: false,
  })
);
route.post("/auth/forgot-password/:email", async (req, res) => {
  const { email } = req.params;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: "Email not register" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  const passwordToken = jwt.sign(
    {
      otp,
    },
    "secret",
    { expiresIn: "60m" }
  );
  sendMail(
    email,
    "Reset your Treasury PayInt password",
    forgotPasswordTemp(user.first_name, passwordToken)
  );

  user.password_token = passwordToken;
  await user.save();
  res.status(200).json({
    message:
      "A confirmation link has been sent to your email to reset your password",
  });
});
route.post("/password/send-passcode/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const otp = Math.floor(10000 + Math.random() * 90000);
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  user.passcode = otp;
  await user.save();
  console.log(user, otp);
  // send sms
  const smsData = `
Treasury PayInt
Your One Time Password (OTP) for Treasury Payint password update is: ${otp}. Expires in 10 mins.

If you did not initiate this request, kindly contact us at contact@treasurypayint.com
  `;
  await sendSms(smsData, user.number);
  res.status(200).json({
    message: `Confirmation passcode has been sent to ${user.number}`,
  });
});

route.post("/password/verify-passcode/:passcode/:id", async (req, res) => {
  const { passcode, id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }
  if (user.passcode != passcode) {
    return res.status(400).json({
      message: "Passcode incorrect, try again!",
    });
  }
  return res.status(200).json({
    message: "Thanks, passcode verified",
  });
});

route.post(
  "/password/change-password/:password/:old_password",
  async (req, res) => {
    const { password, old_password } = req.params;
    const user = await User.findById(req.user?.id);
    console.log(old_password);
    bcrypt.compare(old_password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) {
        return res.status(400).json({
          message: "Your old password is incorrect, try again!",
        });
      }
    });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;
      user.password = hash;
      user
        .save()
        .then((user) => {
          res.status(201).json({
            message: "Password updated, please login again",
          });
        })
        .catch((err) => console.log(err));
    });
  }
);

route.get("/password/verify-password-token/:token", async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ password_token: token });
  if (!user) {
    req.flash("err_msg", "Sorry, reset token cannot be verified");
    return res.redirect("/users/auth/login");
  }
  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      req.flash("err_msg", "Sorry, invalid reset token!");
      return res.redirect("/users/auth/login");
    }
    if (!decoded.otp) {
      req.flash("err_msg", "Sorry, reset token not found!");
      return res.redirect("/users/auth/login");
    }
    return res.render("change-password", {
      layout: false,
      user,
    });
  });
  // bcrypt.compare(old_password, user.password, (err, isMatch) => {
  //   if (err) throw err;
  //   if (!isMatch) {
  //     return res.status(400).json({
  //       message: "Your old password is incorrect, try again!",
  //     });
  //   }
  // });
  // if (!user) {
  //   return res.status(400).json({
  //     message: "User not found",
  //   });
  // }
  // bcrypt.hash(password, 10, (err, hash) => {
  //   if (err) throw err;
  //   user.password = hash;
  //   user
  //     .save()
  //     .then((user) => {
  //       res.status(201).json({
  //         message: "Password updated, please login again",
  //       });
  //     })
  //     .catch((err) => console.log(err));
  // });
});

route.post(
  "/password/change-password/:id",
  ensureAuthenticated,
  async (req, res) => {
    const { password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;
      user.password = hash;
      user
        .save()
        .then((user) => {
          req.flash("success_msg", "Your password has been updated!");
          return res.redirect("/users/auth/login");
        })
        .catch((err) => console.log(err));
    });
  }
);

route.post("/tax/update", ensureAuthenticated, async (req, res) => {
  const user = await User.findById(req.user.id);
  const { amount } = req.body;
  if (user.available > 0) {
    const newTax = Math.floor(user.available / 5);
    user.tax = newTax;
    sendMail(
      user.email,
      "Govervenment Tax Fee Required",
      taiDecline(
        user.first_name,
        amount.toLocaleString("en-US", { style: "currency", currency: "USD" }),
        user.available.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }),
        newTax.toLocaleString("en-US", { style: "currency", currency: "USD" })
      )
    );
    await user.save();
    res.status(201);
  }
  res.status(400);
});

module.exports = route;
