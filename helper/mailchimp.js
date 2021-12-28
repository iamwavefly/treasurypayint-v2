const request = require("request");
const axios = require("axios");

const mailchimpInstance = "us20",
  listUniqueId = "992b16d83f",
  mailchimpApiKey = "4d358abe67e0406c3af781c7d0544f09-us20";
const mailChimp = (email, firstName, lastName) => {
  const data = {
    new_members: [
      {
        email_address: email || "example@email.com",
        status: "subscribed",
        merge_fields: {
          FNAME: firstName || "none",
          LNAME: lastName || "none",
        },
      },
    ],
  };
  const options = {
    url: `https://${mailchimpInstance}.api.mailchimp.com/3.0/lists/${listUniqueId}`,
    method: "POST",
    headers: {
      Authorization: "anagutjor " + mailchimpApiKey,
    },
    data,
  };
  axios(options)
    .then((res) => console.log(res))
    .catch((error) => console.log(error));
};
module.exports = mailChimp;
