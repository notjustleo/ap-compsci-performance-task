const nodemailer = require('nodemailer')
require('dotenv').config()

var emailAcc = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'theonepieceetheonepieceisreal@gmail.com',
      pass:  process.env.APPPASSWORD
    }
});

var mailOptions = {
    from: 'aptasktesting@gmail.com',
    to: 'somebody1337666@gmail.com',
    subject: 'test',
    text: 'it works i think'
};

emailAcc.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
});