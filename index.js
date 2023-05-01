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
      user: 'aptasktesting@gmail.com',
      pass:  process.env.APPPASSWORD
    }
});

let rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true
});

async function askname() {
    let logins = JSON.parse(fs.readFileSync('./data/passwords.json', 'utf-8'))
    let name = await new Promise(resolve => rl.question("Please pick a username: ", resolve));
    for (i = 0; i < logins.length; i++) {
        if (logins[i].username.toLowerCase() == name.toLowerCase()) {
            console.log("This username is already taken. Please try another.")
            return askname()
        }
    }
    return name
}

async function askpass() {
    mutableStdout.muted = false
    console.log("Enter a password: ")
    mutableStdout.muted = true
    let pass = await new Promise(resolve => rl.question("Enter a password: ", resolve));
    mutableStdout.muted = false
    console.log("Re-enter your password: ")
    mutableStdout.muted = true
    let pass2 = await new Promise(resolve => rl.question("Re-enter your password: ", resolve));
    mutableStdout.muted = false
    if (pass == pass2) {
        return pass
    } else {
        console.log("Passwords don't match. Please type them again.")
        askpass()
    }
}

async function askemail(name) {
    let temail = await new Promise(resolve => rl.question("Enter your email: ", resolve));
    if (!temail.includes("@")) {
        console.log("Invalid email. Does not contain the @ symbol.")
        return askemail()
    }
    let temail2 = await new Promise(resolve => rl.question("Re-enter your email: ", resolve));
    if (temail != temail2) {
        console.log("Wrong email. Please try again.")
        return askemail()
    }
    verification_code = Math.floor(100000 + Math.random() * 900000)
    emailAcc.sendMail({
        from: "aptasktesting@gmail.com",
        to: temail,
        subject: "Your email verification",
        text: `Hello ${name},\n\nYour verification code is ${verification_code}`
    });
    let emailcode = await new Promise(resolve => rl.question("We've sent a code to your email. Please enter it here: ", resolve));
    if (emailcode == verification_code) {
        return temail
    } else {
        console.log("Invalid code. Please re-enter your email.")
        return askemail()
    }
}
async function init() {
    rl.question("Welcome to my base login system. Would you like to (l)ogin or (s)ign up? ", (ans) => {
        if (ans.toLowerCase() == "l" || ans.toLowerCase() == "login" || ans.toLowerCase() == "log in") {
            login()
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
    let username = await askname()
    let password = await askpass()
    let email = await askemail(username)
    let newpassword
    bcrypt.genSalt(10).then(async salt => {
        await bcrypt.hash(password, 10).then(newpass => {
            newpassword = newpass
            const newuserobj = {
                id: logins.length + 1,
                username: username,
                password: newpassword,
                email: email
            }
            logins.push(newuserobj)
            fs.writeFileSync('./data/passwords.json', JSON.stringify(logins, null, 4))
            console.log("Email validated. You can now log in with your credentials.")
        })
    })
    init()
}

async function asknamelogin() {
    let logins = JSON.parse(fs.readFileSync('./data/passwords.json', 'utf-8'))
    let name = await new Promise(resolve => rl.question("Enter your username: ", resolve));
    for (i = 0; i < logins.length; i++) {
        if (logins[i].username.toLowerCase() == name.toLowerCase()) {
            return logins[i].id
        }
    }
    console.log("That user does not exist in our systems. Please sign up or use an existing username.")
    return init()
}

async function askpasslogin(id) {
    let logins = JSON.parse(fs.readFileSync('./data/passwords.json', 'utf-8'))
    let user
    for (i = 0; i < logins.length; i++) {
        if (logins[i].id == id) {
            user = logins[i]
        }
    }
    let loginlol = false
    console.log(`Hey ${user.username}! Enter your password:`)
    mutableStdout.muted = true
    let pass = await new Promise(resolve => rl.question(`Hey ${user.username}! Enter your password: `, resolve));
    mutableStdout.muted = false
    bcrypt.compare(pass, user.password, function(err, result) {
        if (result) {
            return loginlol = true
        } else {
            console.log("Invalid password.")
            askpasslogin(id)
        }
    });
    return loginlol
} 

async function login() {
    let id = await asknamelogin()
    let pass
    if (id) {
        pass = await askpasslogin(id)
    }
    let logins = JSON.parse(fs.readFileSync('./data/passwords.json', 'utf-8'))
    if (pass == true) {
        console.log(`Logged in as ${logins[id - 1].username}! There is no further purpose to this program, so you will be logged out momentarily.`)
        return init()
    }
}

init()