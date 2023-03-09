const User = require('../models/userModel')
const Hostel = require('../models/hostelModel')
const Complaint = require('../models/complaintModel')
const Warden = require('../models/wardenModel')
const bcrypt = require('bcrypt')


const loadDashboard = async (req, res) => {

    try {
        const wardenId = req.session.user_id
        
        const hostelData = await Warden.findOne({_id: wardenId})
        
        res.render('dashboard', {hostelName: hostelData.hostel_name})
    } catch (error) {
        console.log(error.message)
    }
}

const loadLogin = async (req, res) => {

    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {

    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await Warden.findOne({ email: email })
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {

                if (userData.role === 2) {
                    req.session.user_id = userData._id
                    req.session.role = userData.role
                    res.redirect('/warden/dashboard')
                }
                else {
                    res.render('login', { message: "Not a warden" })
                    
                }

            } else {
                res.render('login', { message: "Email and password is incorrect" })
            }

        } else {
            res.render('login', { message: "Email and password is incorrect" })
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {

    try {
        req.session.destroy()
        res.redirect('/warden')
    } catch (error) {
        console.log(error.message)
    }
}

const loadHostelDetails = async (req, res) => {

    try {

        const hostelData = await Hostel.findOne({name : req.query.n})
        
        res.render('hostel-details', {hostel: hostelData})
        
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    loadDashboard,
    loadLogin,
    verifyLogin,
    logout,
    loadHostelDetails
}


