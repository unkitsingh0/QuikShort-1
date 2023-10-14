import nodemailer from "nodemailer";

// NodeMailer code
let handelEmailService = (userEmail, subject, text) => {
  let mailTrasnporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "speedylink.mail@gmail.com",
      pass: "lfnxwjvkffsyuhxq",
    },
  });

  let details = {
    from: "speedylink.mail@gmail.com",
    to: userEmail,
    subject: subject,
    text: text,
  };

  mailTrasnporter.sendMail(details, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("mail hase been sent");
    }
  });
};

export default handelEmailService;
