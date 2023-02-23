const User = require('../models/userModel')
const bcrypt = require('bcrypt')

const nodemailer = require('nodemailer')

const securePassword = async(password)=>{

    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
        
    } catch (error) {
        console.log(error.message)
    }
}

//for sending mail
const sendVerifyMail = async(name, email, user_id)=>{

    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure:false,
            requireTLS:true,
            auth:{
                user: 'jainkaushal899@gmail.com',
                pass: ''
            }
        })

        const mailOptions = {
            from: 'jainkaushal899@gmail.com',
            to: email,
            subject: 'For Mail Verification',
            html: '<p>Hi' + name + '. Please click <a href="http://localhost:3000/verify?id' + user_id + '">here</a> to verify your mail.</p>'
        }

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error)
            }
            else{
                console.log("Email has been sent:- ", info.response)
            }
        })
        
    } catch (error) {
        console.log(error.message)
    }

}

const loadRegister = async(req, res) =>{
    try {

        res.render('registration')
        
    } catch (error) {
        console.log(error.message)
    }
}

const insertUser = async(req, res)=>{

    try {

        const spassword = await securePassword(req.body.password)

        const user = new User({
            name : req.body.name,
            email : req.body.email,
            phone : req.body.mno,
            password : spassword,
            regNo : req.body.regNo,
            is_admin : 0
        })

        const userData = await user.save()

        if(userData){
            sendVerifyMail(req.body.name, req.body.email, userData._id)
            res.render('registration', {message: "Your registration has been successful."})
        }
        else{
            res.render('registration', {message: "Your registration has failed!"})      
        }
        
    } catch (error) {
        console.log(error.message)
    }
}



const verifyMail = async(req, res)=>{

    try {

        const updateInfo = await User.updateOne({_id: req.query.id}, {$set: { is_verified: 1}})

        console.log(updateInfo)
        res.render("email-verified")
        
    } catch (error) {
        console.log(error.message)
    }
}

//login user method started

const loginLoad = async(req, res)=>{

    try {

        res.render('login')
        
    } catch (error) {
       console.log(error.message) 
    }

}

const verifyLogin = async(req, res)=>{

    try {
        
        const email = req.body.email
        const password = req.body.password
        
        const userData = await User.findOne({email:email})

        if(userData){

            const passwordMatch = await bcrypt.compare(password, userData.password)

            if(passwordMatch){

                if(userData.is_verified === 0){
                    res.render('login',{message: "Please verify your mail."})
                }else{
                    req.session.user_id = userData._id
                    res.redirect('/home')
                }

            }else{
                res.render('login', {message:"Incorrect Email/Password."})
            }

        }else{
            res.render('login', {message:"Incorrect Email/Password."})
        }

    } catch (error) {
       console.log(error.message) 
    }

}

const loadHome = async(req, res)=>{


    try {

        const userData = await User.findById({_id: req.session.user_id})
        res.render('home', { user: userData})
    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = async(req, res)=>{

    try {

        req.session.destroy()
        res.redirect('/')
        
    } catch (error) {
        console.log(error.message)
    }
}

const editLoad = async(req, res)=>{

    try {
        const id = req.query.id 

        const userData = await User.findById({ _id:id })

        if(userData){
            res.render('edit', {user: userData})
        }else{
            res.redirect('/home')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const updateProfile = async(req, res) =>{

    try {
     
            if(req.file){
                const userData = await User.findByIdAndUpdate({_id: req.body.user_id}, {$set: {name: req.body.name, email: req.body.email, phone: req.body.mno}})
            }else{
                const userData = await User.findByIdAndUpdate({_id: req.body.user_id}, {$set: {name: req.body.name, email: req.body.email, phone: req.body.mno}})
            }

        

        res.redirect('/home')
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome ,
    userLogout,
    editLoad,
    updateProfile
}