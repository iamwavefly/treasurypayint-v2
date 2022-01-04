// const smsAlert = document.querySelector("#sms_alert");
// const emailAlert = document.querySelector("#email_alert");
// // const notifAlert = document.querySelectorAll(".notif_alert");
// const walletTab = document.querySelectorAll(".wallet-tab");
// const tabContents = document.querySelectorAll(".tab-panel");

// // notifAlert.forEach((res) => {
// //   res.addEventListener("change", (event) => {
// //     openLoader();
// //     const { name, checked } = event.target;
// //     console.log(checked);
// //     // const userId = event.target.getAttribute("data-user_id");
// //     // fetch(`http://localhost:4000/users/alert/${name}/${checked}/${userId}`, {
// //     //   method: "post",
// //     // })
// //     //   .then((res) => {
// //     //     closeLoader();
// //     //   })
// //     //   .catch((err) => {
// //     //     closeLoader();
// //     //   });
// //   });
// // });
// let smsChecked = true;
// let emailChecked = true;

// smsAlert.addEventListener("change", (event) => {
//   const { checked } = event.target;
//   smsChecked = checked;
//   console.log(checked);
//   checkAlert();
// });

// emailChecked.addEventListener("change", (event) => {
//   const { checked } = event.target;
//   smsChecked = checked;
//   checkAlert();
// });

// const checkAlert = () => {
//   if (!smsChecked && !emailChecked) {
//     alert(12345);
//   }
// };
