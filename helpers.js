

import nodemailer from 'nodemailer';
import 'dotenv/config';
let email = process.env.EMAIL
let pass = process.env.PASSWORD
console.log(email,pass)
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: pass
  }
});

// TODO: Throw error if email not sent!!!
const sendEMail = (recieverMail,subject,msg)=>{
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


// var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'bugtracker17@gmail.com',
        pass: 'dsnf arcs ocgp civb'
    }
});

transporter.sendMail({
from: 'bugtracker17@gmail.com',
  to: 'rahuldoshi34@gmail.com',
  subject: 'hello world!',
  text: 'hello world!'
});

// sendEMail('rahuldoshi34@gmail.com','done','hiii')