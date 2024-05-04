

import nodemailer from 'nodemailer';
import 'dotenv/config';
let email = process.env.EMAIL
let pass = process.env.PASSWORD
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: pass
  }
});

const exportedHelpers = {
  getBugColor:function (color){
      color = color.toUpperCase();
      switch (color) {
          case "HIGH" : {
              return 'text-bg-danger';
          }
          break;
          case "MEDIUM" : {
              return 'text-bg-warning';
          }
          break;
          case "LOW" : {
              return 'text-bg-success'
          }
          break;
      }
  },
  ternary:function(error){
    return (error) ? true : false
  },
  sendEmail:(recieverMail,subject,msg)=>{
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
            }});
}}
exportedHelpers.sendEmail('rahuldoshi34@gmail.com','Test','123')

export default exportedHelpers;