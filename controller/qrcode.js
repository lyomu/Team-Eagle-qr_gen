const express = require("express")
const qrcode = require("../models/qrcode")
const session = require("express-session")
const collection = require("../models/user")
const cloudinary = require("cloudinary").v2
require("dotenv").config()
var sess

cloudinary.config({ 
    cloud_name: process.env.cloud_name, 
    api_key: process.env.api_key, 
    api_secret: process.env.api_secret 
});

const storeQRcode = async (req, res) => {
    let sess = req.session

    if (sess.user) {
        const data = {
            qrcode: req.body.qrcode,
            image: req.body.image,
            qrCodeType: req.body.type
        }

        //when the qrcode is scanned, it should contain /userID/qrcodeType, i.e "/24sdtd3663vgdvdt3232/menu" or /2ggt22tyt2yryc32y32c3f/catalog"

        cloudinary.uploader
        .upload(data.qrcode)
        .then(async (result) => {
            const qrCode = result.url
            await qrcode.create({
                userID: sess.user,
                imgUrl: qrCode
            })

            const qrcodeID = qrcode.findOne({userID: sess.user, imgUrl: qrCode})

            cloudinary.uploader
            .upload(data.image)
            .then(async (result) => {
                const LogoUrl = result.url
                if(data.qrCodeType == "catalog") {
                    await collection.create({
                        userID: sess.user,
                        qrcodeID: qrcodeID,
                        qrcodeType: data.qrCodeType,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        imageUrl: LogoUrl,
                        jobTitle: req.body.jobTitle,
                        businessName: req.body.businessName,
                        description: req.body.description,
                        address: req.body.address,
                        phonenumber: req.body.phonenumber,
                        websiteUrl: req.body.url,
                        openingDay: req.body.days,
                        OpenAndCloseTime: req.body.timeframe,
                        socialMedia: req.body.links,   
                    })
                } else if (data.qrCodeType == "menu") {
                    await collection.create({
                        userID: sess.user,
                        qrcodeID: qrcodeID,
                        qrcodeType: data.qrCodeType,
                        imageUrl: LogoUrl,
                        businessName: req.body.businessName,
                    })
                } else {
                    await collection.create({
                        userID: sess.user,
                        qrcodeID: qrcodeID,
                        qrcodeType: data.qrCodeType,
                        websiteUrl: req.body.url
                    })
                }
            })
            
            res.json({status: "ok", qrCode})
        })
        .catch((error) => {
            console.log(error)
            res.json({status: "error", error: "An error Occurred" })
        })
    } else {
        res.redirect('/user/login')
    }
}   

const getAllqrCode = async (req, res) => {
    let sess = req.session
    if (sess.user) {
       try {
            const user = sess.user
        
            const imageInfo = await qrcode.find({userID: user})
            res.json({status: "ok", QRcodes: imageInfo})
       } catch (error) {
            console.log(error)
            res.json({status: "error"})
       }
    } else {
        res.redirect('/user/login')
    }
}

const getqrCode = async (req, res) => {
    let sess = req.session
    const {id: itemID} = req.params
    if(sess.user) {
        try {
            const user = sess.user
        
            const imageInfo = await qrcode.find({_id: itemID, userID: user})
            res.json({status: "ok", QRcodes: imageInfo})
       } catch (error) {
            console.log(error)
            res.json({status: "error"})
       }
    } else {
        res.redirect('/user/login')
    }
}

const sites = async(req, res) => {
    const info = {
        userID: req.params.userID,
        qrcodeID: req.params.qrcodeID,
        qrcodeType: req.params.qrCodeType
    }
}

// ability to edit, update or delete qr code data and the entire qr code

// update QR code data
const updateQr = async (req, res) => {
    let sess = req.session
    if (sess.user) {

        //For the updating of this qrcode, what exactly are we updating
        try {
            let id = req.params.id;
            let sess = await req.res;
            let update = await qrcode.findOneAndUpdate(id, sess, {new: true} );
            if (!update) {
                return res.status(400).json({
                    success: false,
                    message: "The QR code was not updated",
                });
            }
            return res.status(200).json({
                success: true,
                message: "QR code updated",
                sess: update,
        });
        } catch (error) {
            res.status(500).json({
                suecces: false,
                message : "Internal server error",
                error: error.message
            })
            
        }
    } else {
        res.redirect('/user/login')
    }
};

// delete Single QR code data

const deleteSingleQR = async (req, res) => {
    let sess = req.session
    if (sess.user) {
        try {
            let id = req.params.id;

            //this will delete based on the id and the user
            let deleted = await qrcode.findOneAndDelete({userID: sess.user, _id: id});
            
            //Also delete the qrcode collection
            await collection.findOneAndDelete({userID: sess.user,qrcodeID: id})
            
            //let deleted = await qrcode.findo
            if (!deleted)
                return res.status(400).json({
                    success: false,
                    message: " The QR code was not deleted"
                });

            return res.status(200).json({success: true, messsage: "QR code data delted successfully"});
    
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            })
        }
    } else {
        res.redirect('/user/login')
    }
}


// delete entire QR code data

const deleteEntireQR = async (req, res) => {
    let sess = req.session
    if (sess.user) {
        try {
            //for the delete, we will delete based on the login user
            let deleted = await qrcode.deleteMany({userID: sess.user});

            //This will delete all collection for the user
            await collection.deleteMany({userID: sess.user})

            if (!deleted)
                return res.status(400).json({
                    success: false,
                    message: " The QR code was not deleted"
                });
            return res.status(200).json({success: true, messsage: "All QR code data delted successfully"});
    
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            })
        }
    } else {
        res.redirect('/user/login')
    }
}


module.exports = {
    storeQRcode,
    getAllqrCode,
    getqrCode,
    sites,
    updateQr,
    deleteSingleQR,
    deleteEntireQR,
}