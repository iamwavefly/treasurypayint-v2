const accountSid = "ACcb7a00cf6931b88daa74a25ed882a2f3";
const authToken = "dacedcbafcd7cd6aff9bc8b2080b817c";

const client = require("twilio")(accountSid, authToken);

async function sendSms(body, phone) {
  try {
    const message = client.messages.create({
      to: phone,
      from: "+13254420552",
      body: body,
    });
    return message;
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendSms;
