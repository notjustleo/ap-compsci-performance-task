const fs = require('fs')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const readline = require('readline')
require('dotenv').config()
var Writable = require('stream').Writable;

var mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});

var emailAcc = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'theonepieceetheonepieceisreal@gmail.com',
      pass:  process.env.APPPASSWORD
    }
});

let rl = readline.createInterface(process.stdin, mutableStdout);

function askname(valid) {
    if (valid == false) {
        rl.question("Please pick a username: ", async (name) => {
            for (i = 0; i > logins.length; i++) {
                if (logins[i].username.toLowerCase() == name.toLowerCase()) {
                    console.log("This username is already taken. Please try another.")
                    return askname()
                }
            }
            username_valid = true
            username = name
        })
    } else return
}

async function init() {
    rl.question("Welcome to my data management system. Would you like to (l)ogin or (s)ign up?", (ans) => {
        if (ans.toLowerCase() == "l" || ans.toLowerCase() == "login") {

        } else if (ans.toLowerCase() == "s" || ans.toLowerCase() == "signup" || ans.toLowerCase() == "sign up") {
            signup()
        } else {
            console.log("Invalid response. Must be of either \"login\" (\"l\") or \"signup\" (\"s\").")
            init()
            return
        }
    })
    return
}

async function signup() {
    let logins = JSON.parse(fs.readFileSync('./data/passwords.json', 'utf-8'))
    let db = false
    let username_valid = false
    let username
    let password_valid = false
    let password
    let email_valid = false
    let email_verified = false
    let email
    askname(username_valid)
    let password_check = false
    mutableStdout.muted = true
    while (password_check == false && password) {
        rl.question("Enter your desired password: ", async (pass) => {
            rl.question("Please re-enter your password: ", async (pass2) => {
                if (pass2 == pass) {
                    password_valid = true
                    password = pass2
                }
            })
        })
    }
    mutableStdout.muted = false
    while (email_verified == false) {
        rl.question("Enter your email: ", async (temail) => {
            if (!pass.includes("@")) return console.log("Invalid email. Does not contain the @ symbol.")
            rl.question("Please re-enter your email: ", async (temail2) => {
                if (temail2 == temail) {
                    email_valid = true
                    email = temail2
                    verification_code = Math.floor(100000 + Math.random() * 900000)
                    emailAcc.sendMail({
                        from: "aptasktesting@gmail.com",
                        to: email,
                        subject: "Your email verification",
                        text: `Hello ${username},\n\nYour verification code is ${verification_code}`
                    });
                    rl.question("We sent a code to your email. Please enter it here: ", async (emailcode) => {
                        if (emailcode == verification_code) {
                            const newuserobj = {
                                id: logins.length + 1,
                                username: username,
                                password: password,
                                email: email
                            }
                            console.log("Email validated. You can now log in with your credentials.")
                        } else {
                            return console.log("Invalid code. Please re-enter your email.")
                        }
                    })
                }
            })
        })
    }
}

init()