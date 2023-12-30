
const express = require("express")
const { body, validationResult } = require('express-validator')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const jwtSecretKey = process.env.jwtSecretKey
const router = express.Router();
const connectToMongo = require("../db")
const Usermodel = require("../model/User")

const User = require("../model/User");
const fetchuser = require("../middleware/fetchuser")

// const UserData = require("../model/User")

// Signup api : localhost:3000/api/auth/register
router.post('/register', [
    body('name', "Enter a valid name").trim().isLength({ min: 3 }),
    body('email', "Enter a valid email address").optional().trim().isEmail(),
    body('password', "Enter a valid password").optional().trim().isLength({ min: 8 }),
    body('conpass', "Password and confiem password should be match").optional().trim().isLength({ min: 8 }),
    body('address', "Enter a valid address").optional().trim().isLength({ min: 3 }),
], async (req, res) => {

    // const conn = await connectToMongo()


    // if there are errors, return bad request and the request

    // console.log(req.body)

    const { name, email, password, conPass, address } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // console.log("Error", errors)
        return res.status(400).json({ errors: errors.array() })
    }
    // Check the user is exit or not
    try {

        const user = await Usermodel.findOne({ email: email });
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email is already exits" })
        }

        if (password != conPass) {
            return res.status(400).json({ error: "Password and confirm password should be match" })
        }

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt);
        // Create a new user
        userData = await User.create({
            name,
            email,
            password: secPass,
            address
            // password: req.body.password
        })

        const data = {
            user: {
                id: userData.id,
            }
        }
        const authtoken = jwt.sign(data, jwtSecretKey)

        // console.log(req.body)
        // console.log(authtoken)

        // res.json(user)
        res.json({ authtoken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send({ error: error.message })
    }

})


//Route 2:  Login a user using POST: "localhost:3000/api/auth/login". No login required
router.post('/login', [
    body('email', "Enter a valid email address").optional().trim().isEmail(),
    body('password', "Password cannot be blank").optional().exists(),
], async (req, res) => {
    // if there are errors, return bad request and the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body;
    try {
        let user = await Usermodel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ error: "Please try to login with currect credentials" })
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please try to login with currect credentials" })
        }
        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, jwtSecretKey)
        res.json({ authtoken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})


//Route 3:  Get login user details using POST: "localhost:3000/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;

        const user = await User.findById(userId).select("-password");
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

//Route 4:  Change password using POST: "localhost:3000/api/auth/changepassword". Login required

router.post('/changepassword', fetchuser, [
    body('password', "Enter the previous password").exists(),
    body('newPass', "New password cannot be blank").exists(),
    body('conPass', "Confirm password and new password should be match").exists(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        userId = req.user.id;
        const { password, newPass, conPass } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please enter the currect password" })
        }

        if (password === newPass) {
            return res.status(400).json({ error: "Please enter the unique password" });
        }

        if (newPass != conPass) {
            return res.status(400).json({ error: "Please enter the same new and confirm password" });
        }
        // Hash the new password
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(newPass, salt);
        await User.findByIdAndUpdate(userId, { password: hashedPass });
        // res.json({pass:secPass, newPass, conPass, prevPass, userPass});
        res.json({ message: "Password update Successfully" });
    } catch (error) {
        res.status(500).send("Internal server error")
    }
});

module.exports = router