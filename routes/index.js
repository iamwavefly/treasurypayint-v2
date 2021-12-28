const express = require("express");
const mailgun = require("mailgun-js");
const url = require("url");
const querystring = "querystring";

const User = require("../models/User");
const Card = require("../models/Card");
const Bank = require("../models/Bank");

const Transaction = require("../models/Transaction");

const { ensureAuthenticated } = require("../config/auth");
const moment = require("moment");
const sendSms = require("../helper/sendsms");
const sendMail = require("../helper/sendMail");
const signUpTemp = require("../template/email/signup");
const verifyToken = require("../middleware/verifyToken");
const getIP = require("ipware")().get_ip;

// initialize express
const route = express.Router();

route.get("/", async (req, res) => {
  const ipInfo = getIP(req);
  res.render("index", { layout: false });
});

route.get("/signup", async (req, res) => {
  res.render("user", { layout: false });
});
// wallet
route.get("/wallet", ensureAuthenticated, async (req, res) => {
  const bank = await Bank.findOne({ addby: req.user._id });
  const card = await Card.find({ addby: req.user.id });
  const user = await User.findById(req.user.id).populate({
    path: "notifications",
    options: { sort: { date: "desc" } },
  });
  res.render("wallet", {
    title: `Wallet | Topup, transfer and withdraw fund`,
    page_name: "Wallet",
    user: req.user,
    bank,
    notifications: user.notifications,
    moment,

    card,
  });
});
// send & withdraw
route.get("/send-withdraw", ensureAuthenticated, async (req, res) => {
  const bank = await Bank.findOne({ addby: req.user._id });
  const card = await Card.find({ addby: req.user.id });
  res.render("send_withdraw", {
    title: `Send or Withdraw fund`,
    page_name: "Withdraw",
    user: req.user,
    bank,
    card,
  });
});
// pay services
route.get("/pay-services", ensureAuthenticated, async (req, res) => {
  const bank = await Bank.findOne({ addby: req.user._id });
  const card = await Card.find({ addby: req.user.id });
  res.render("pay_services", {
    title: `Pay Services | Buy ticket, subscription and more`,
    page_name: "Services",
    user: req.user,
    bank,
    card,
  });
});
// treasury card
route.get("/treasury-card", ensureAuthenticated, async (req, res) => {
  const bank = await Bank.findOne({ addby: req.user._id });
  const card = await Card.find({ addby: req.user.id });
  const user = await User.findById(req.user.id).populate({
    path: "notifications",
    options: { sort: { date: "desc" } },
  });
  res.render("treasury_card", {
    title: `My Treasury Card | Request or renew treasury card`,
    page_name: "Card",
    user: req.user,
    notifications: user.notifications,
    moment,
    bank,
    card,
  });
});
// complaint
route.get("/complaint", ensureAuthenticated, async (req, res) => {
  const bank = await Bank.findOne({ addby: req.user._id });
  const card = await Card.find({ addby: req.user.id });
  res.render("complaint", {
    title: `Complaint | Submit compaint or view responses`,
    page_name: "Complaint",
    user: req.user,
    bank,
    card,
  });
});
// complaint
route.get("/setting", ensureAuthenticated, async (req, res) => {
  const bank = await Bank.findOne({ addby: req.user._id });
  const card = await Card.find({ addby: req.user.id });
  res.render("account_setting", {
    title: `Account Settings | Update your account settings`,
    page_name: "Setting",
    user: req.user,
    bank,
    card,
  });
});
// request card
route.get("/request-account", async (req, res) => {
  const bank = await Bank.findOne({ addby: req.user._id });
  const card = await Card.find({ addby: req.user.id });
  res.render("request_account", {
    title: `Welcome ${req.user.username}`,
    page_name: "Request",
    user: req.user,
    bank,
    card,
  });
});

// dashboad
route.get("/dashboard", ensureAuthenticated, async function (req, res) {
  const card = await Card.find({ addby: req.user._id });
  const bank = await Bank.findOne({ addby: req.user._id });
  const transaction = await Transaction.find({ ownby: req.user._id });
  const user = await User.findById(req.user.id).populate({
    path: "notifications",
    options: { sort: { date: "desc" } },
  });
  if (req.user.username === "Admin") {
    return res.redirect("/admin");
  }
  if (req.user.account_status === "pending") {
    req.flash(
      "err_msg",
      "Sorry! Your account is under review or pending, please contact support to authorize you access to your account"
    );
    return res.redirect("/");
  }
  user.online_status = true;
  await user.save();
  res.render("dashboard", {
    title: `Welcome ${req.user.username}`,
    page_name: "Dashboard",
    card,
    bank,
    transaction,
    user: req.user,
    first_name: req.user.first_name,
    other_name: req.user.other_name,
    email: req.user.email,
    number: req.user.number,
    address: req.user.address,
    country: req.user.country,
    account: req.user.account,
    sex: req.user.sex,
    dob: req.user.dob,
    bank_name: req.user.bank_name,
    account_name: req.user.account_name,
    account_number: req.user.account_number,
    bank_branch: req.user.bank_branch,
    available: req.user.available,
    pending: req.user.pending,
    reverse: req.user.reverse,
    loan: req.user.loan,
    tax: req.user.tax,
    maintenance: req.user.maintenance,
    url: req.user.url,
    date: moment(req.user.date).fromNow(),
    notifications: user.notifications,
    moment,
  });
});
route.get("/verify-user", ensureAuthenticated, (req, res) =>
  res.render("account_verify", {
    user: req.user,
    layout: false,
  })
);
route.get("/add-card", ensureAuthenticated, (req, res) =>
  res.render("card", {
    user: req.user,
    layout: false,
  })
);

route.get("/admin", ensureAuthenticated, async function (req, res) {
  if (req.user.username.toLowerCase() !== "admin") {
    req.flash("err_msg", "You'll need admin permission to access this page");
    res.redirect("/");
  }
  const members = await User.find().sort({ date: -1 });
  res.render("admin", {
    layout: false,
    members,
    date: moment,
    admin: req.user,
  });
});

route.get("/admin-db", async function (req, res) {
  const members = await User.find().sort({ date: -1 });
  res.render("admin-db", {
    layout: false,
    members,
    date: moment,
    admin: req.user,
  });
});

route.get("/admin-action", async function (req, res) {
  const members = await User.find().sort({ date: -1 });
  res.render("admin-action", {
    layout: false,
    members,
    date: moment,
    admin: req.user,
  });
});

route.get(
  "/profile",
  ensureAuthenticated,
  async (req, res) =>
    await Card.find({ addby: req.user.id }, async function (err, data) {
      const bank = await Bank.findOne({ addby: req.user.id });
      const user = await User.findById(req.user.id).populate({
        path: "notifications",
        options: { sort: { date: "desc" } },
      });
      res.render("profile", {
        title: `${req.user.username} Profile Setting`,
        page_name: "Profile",
        card: data,
        bank,
        format: moment(req.user.date).fromNow(),
        user: req.user,
        first_name: req.user.first_name,
        other_name: req.user.other_name,
        email: req.user.email,
        number: req.user.number,
        address: req.user.address,
        country: req.user.country,
        account: req.user.account,
        sex: req.user.sex,
        dob: req.user.dob,
        bank_name: req.user.bank_name,
        account_name: req.user.account_name,
        account_number: req.user.account_number,
        bank_branch: req.user.bank_branch,
        available: req.user.available,
        pending: req.user.pending,
        reverse: req.user.reverse,
        loan: req.user.loan,
        tax: req.user.tax,
        maintenance: req.user.maintenance,
        url: req.user.url,
        date: req.user.date,
        moment,
        notifications: user.notifications,
      });
    })
);
route.get("/request-fund", ensureAuthenticated, (req, res) =>
  res.render("transfer", {
    title: `Make transfer ${req.user.username}`,
    page_name: "Transfer",
    user: req.user,
    first_name: req.user.first_name,
    other_name: req.user.other_name,
    email: req.user.email,
    number: req.user.number,
    address: req.user.address,
    country: req.user.country,
    account: req.user.account,
    sex: req.user.sex,
    dob: req.user.dob,
    bank_name: req.user.bank_name,
    account_name: req.user.account_name,
    account_number: req.user.account_number,
    bank_branch: req.user.bank_branch,
    date: req.user.date,
  })
);
route.get("/withdraw/:id", ensureAuthenticated, (req, res) =>
  res.render("transfer", {
    user: req.user,
    first_name: req.user.first_name,
    other_name: req.user.other_name,
    email: req.user.email,
    number: req.user.number,
    address: req.user.address,
    country: req.user.country,
    account: req.user.account,
    sex: req.user.sex,
    dob: req.user.dob,
    bank_name: req.user.bank_name,
    account_name: req.user.account_name,
    account_number: req.user.account_number,
    bank_branch: req.user.bank_branch,
    date: req.user.date,
  })
);
route.get("/request-card", ensureAuthenticated, (req, res) =>
  res.render("request_card", {
    title: `Make transfer ${req.user.username}`,
    first_name: req.user.first_name,
    other_name: req.user.other_name,
    email: req.user.email,
    number: req.user.number,
    address: req.user.address,
    country: req.user.country,
    account: req.user.account,
    sex: req.user.sex,
    dob: req.user.dob,
    bank_name: req.user.bank_name,
    account_name: req.user.account_name,
    account_number: req.user.account_number,
    bank_branch: req.user.bank_branch,
    date: req.user.date,
  })
);
route.get("/service-request", ensureAuthenticated, (req, res) =>
  res.render("service_request", {
    first_name: req.user.first_name,
    other_name: req.user.other_name,
    email: req.user.email,
    number: req.user.number,
    address: req.user.address,
    country: req.user.country,
    account: req.user.account,
    sex: req.user.sex,
    dob: req.user.dob,
    bank_name: req.user.bank_name,
    account_name: req.user.account_name,
    account_number: req.user.account_number,
    bank_branch: req.user.bank_branch,
    date: req.user.date,
  })
);
route.get("/feedback", ensureAuthenticated, (req, res) =>
  res.render("feedback", {
    first_name: req.user.first_name,
    other_name: req.user.other_name,
    email: req.user.email,
    number: req.user.number,
    address: req.user.address,
    country: req.user.country,
    account: req.user.account,
    sex: req.user.sex,
    dob: req.user.dob,
    bank_name: req.user.bank_name,
    account_name: req.user.account_name,
    account_number: req.user.account_number,
    bank_branch: req.user.bank_branch,
    date: req.user.date,
  })
);
route.get("/loan-request", ensureAuthenticated, (req, res) =>
  res.render("loan_request", {
    first_name: req.user.first_name,
    other_name: req.user.other_name,
    email: req.user.email,
    number: req.user.number,
    address: req.user.address,
    country: req.user.country,
    account: req.user.account,
    sex: req.user.sex,
    dob: req.user.dob,
    bank_name: req.user.bank_name,
    account_name: req.user.account_name,
    account_number: req.user.account_number,
    bank_branch: req.user.bank_branch,
    date: req.user.date,
  })
);
route.get("/scam-alert", ensureAuthenticated, (req, res) =>
  res.render("scam_alert", {
    first_name: req.user.first_name,
    other_name: req.user.other_name,
    email: req.user.email,
    number: req.user.number,
    address: req.user.address,
    country: req.user.country,
    account: req.user.account,
    sex: req.user.sex,
    dob: req.user.dob,
    bank_name: req.user.bank_name,
    account_name: req.user.account_name,
    account_number: req.user.account_number,
    bank_branch: req.user.bank_branch,
    date: req.user.date,
  })
);
route.get("/tai", ensureAuthenticated, (req, res) => {
  res.render("TAI", {
    layout: false,
    user: "",
    invalid: "",
    tai: req.body.tai,
    title: "Transfer Access Id - Verification",
  });
});
route.get("/view-tai", (req, res) => {
  res.render("view-tai", {
    layout: false,
    user: "",
    invalid: "",
    tai: req.body.tai,
    title: "Transfer Access Id - Verification",
  });
});
route.get("/tai-report", async (req, res) => {
  try {
    const tai = await User.findOne({ tai: req.query.tai });

    if (req.query.tai === "") {
      return res.render("tai-report", {
        title: "TAI cannot be empty",
        layout: false,
        invalid: "",
        user: null,
        message: "Please, your Transfer Access Id cannot be empty!",
      });
    }
    if (tai) {
      return res.render("tai-report", {
        title: "TAI cannot be empty",
        layout: false,
        invalid: "",
        user: tai,
      });
    } else {
      return res.render("tai-report", {
        title: "TAI cannot be empty",
        layout: false,
        invalid: "",
        user: null,
        message:
          "Invalid Transfer Access Id, please contact support on how to get your lifetime TAI.",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

route.get("/tai-checkpoint", ensureAuthenticated, async (req, res) => {
  try {
    const bank = await Bank.findOne({ addby: req.user.id });
    res.render("tai-checkpoint", {
      layout: false,
      title: "Transaction declined!!!",
    });

    // -> Tax Fee route (email sender)
    const DOMAIN = "treasurypayint.com";
    const mg = mailgun({ apiKey: process.env.API_KEY, domain: DOMAIN });
    const email = req.user.email;

    const data = {
      from: "Treasury PayInt PayInt <support@treasurypayint.com>",
      to: email,
      subject: "INTERNATIONAL GOVERNMENT TAX FEE NEEDED ON YOUR ACCOUNT",
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
                  Dear ${req.user.first_name} ${req.user.other_name},
                  </td>
                  </tr>
                  <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                  Your lifetime Transfer Access Id (TAI) is correct but you are restricted to carry out transactions on your account due to unsettled charges of the International Government Tax fee. You have to settle the charges as soon as possible to gain full access to carry out transactions on your international account at any point of time.  Read full details below. 
                  </td>
                  </tr>
                  <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                  <img src="https://www.treasurypayint.com/img/tax.png" width="30%" alt="treasury tai image"/><br>
                  lncome Tax Department <br>
                  Ministry of Finance <br> 
                  Government of America/${req.user.country}
                  </td>
                  </tr>
                  <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://www.treasurypayint.com" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                  <h3>FEDERAL GOVERNMENT SERVICES</h3>
                  <p>We will undertake the necessary regulatory regime for all such financial sector porridge across the systematic comparative problem of capital regulation.
                  </td>
                  </tr>
                  <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://www.treasurypayint.com" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                  <b>(INTERNATIONAL GOVERNMENT TAX)</b> is a demand that will cost you sum of ${
                    req.user.tax > 0 ? req.user.tax : "$5,700.00"
                  } to get it done for your transactions to be successful. This payment must be made within 7 days as your transaction is at 99% to submit your money to your destination bank (${
        bank.bank_name
      }). <br>
                  </td>
                  </tr>
                  <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" itemprop="handler" itemscope itemtype="http://www.treasurypayint.com" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                  <span style="color: green">Trevor Field Marketing Director</span> <br> <br>
                  ............. Designed To Serve You More .............. <br> 
                  Sorry for any Inconvenience this may cause you. <br>
                  Thank you for banking with us! <br>
                  The Customer Protection Service.
                  </td>
                  </tr>
                  <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td class="content-block" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top">
                  Sincerely, <br>
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
                  </tr>
              </table>
          </body>
          </html>
          `,
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = route;
