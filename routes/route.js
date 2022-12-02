const express = require("express")
const router = express.Router()
const multer = require("multer")


var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });

const {
    authUser,
    registerUser,
    logoutUser,
    changePassword
} = require("../controller/auth")

const {
    qrcodegen,
    getAllqrCode,
    getqrCode
} = require("../controller/qrcode")


//Authentication
router.route('/user/login').post(authUser)
router.route('/user/register').post(registerUser)
router.route('/user/changepassword').post(changePassword)
router.route('/user/logout').get(logoutUser)


//QR code Generator
router.route('/user/qrCode').get(getAllqrCode)
router.route('/user/qrCode/:id').get(getqrCode)
router.route('/generate').post( qrcodegen)

module.exports = router