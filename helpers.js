

import nodemailer from 'nodemailer';
import 'dotenv/config';

console.log(email,pass)
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: pass
  }
});

// TODO: Throw error if email not sent!!!
const sendMail = (recieverMail,subject,msg)=>{
    var mailOptions = {
        from: email,
        to: recieverMail,
        subject: subject,
        text: msg
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

// sendMail('rahuldoshi34@gmail.com','done','hiii')