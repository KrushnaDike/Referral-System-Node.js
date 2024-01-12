import config from "config";
import jwt from 'jsonwebtoken';
import userModel from "../models/user"
import Sender from 'aws-sms-send';

import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary';
import status from "../enums/status"
import userType from "../enums/userType"

// console.log(config.get('cloudinary.cloud_name'));


cloudinary.config({
  cloud_name: config.get('cloudinary.cloud_name'),
  api_key: config.get('cloudinary.api_key'),
  api_secret: config.get('cloudinary.api_secret')
});

const uuid = require('uuid');

module.exports = {

  // USED
  getOTP() {
    var otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  },

  makeRandomUnique() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },





  sendSms: (number, otp) => {
    sender.sendSms(`Your otp is ${otp}`, config.get('AWS.smsSecret'), false, number)
      .then(function (response) {
        console.log("dfdfdfdfdfdfdfdfd", response);
        return response;
      })
      .catch(function (err) {
        return err;
      })

  },
  // sendSmsTwilio: async (mobileNumber, otp) => {
  //   try {
  //     return await client.messages.create({
  //       body: `Your otp is ${otp}`,
  //       to: mobileNumber,
  //       from: config.get('twilio.number')
  //     })
  //   } catch (error) {
  //     console.log('160 ==>', error)
  //   }
  // },

  // sendSmsPromiseTwilio: async (mobileNumber, body) => {
  //   try {
  //     return await client.messages.create({
  //       body: body,
  //       to: mobileNumber,
  //       from: config.get('twilio.number')
  //     })
  //   } catch (error) {
  //     console.log('160 ==>', error)
  //   }
  // },
  sendSmsPromise: async (number, body) => {
    let send = await sender.sendSms(body, config.get('AWS.smsSecret'), false, number)
    return send

  },





  // USED
  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get('jwtsecret'), { expiresIn: "24h" })
    return token;
  },

  // USED
  sendMail: async (to, name, link) => {
    let html = `<div style="font-size:15px">
                <p>Hello ${name},</p>
                <p>Please click on the following link "${link}">
                  Set a new password now
                </a>
                    If you did not request this, please ignore this email and your password will remain unchanged.
                </p>
                  <p>
                      Thanks<br>
                  </p>
              </div>`
    var findCredentialsRes = await findCredentials()
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        "user": findCredentialsRes.email,
        "pass": findCredentialsRes.password

      },

    });

    var mailOptions = {
      from: findCredentialsRes.email,
      to: to,
      subject: 'Reset Link',
      html: html
    };

    return await transporter.sendMail(mailOptions)
  },

  generateRandomAttributes() {
    return {
      strength: Math.floor(Math.random() * 100) + 1,
      luck: Math.floor(Math.random() * 100) + 1,
      enduring: Math.floor(Math.random() * 100) + 1,
      beauty: Math.floor(Math.random() * 100) + 1,
      comfort: Math.floor(Math.random() * 100) + 1,
    };
  },


  
  sendAdminNotification: async (orderId, description) => {
    let html = `<div style="font-size:15px">
                <p>Hello Admin,</p>
                <p>Order Id ${orderId} ${description}
                </p>
                  <p>
                  You have received a new Feedback..!<br>
                  </p>
              </div>`

    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')

      },

    });
    var mailOptions = {
      from: "<mailto:do_not_reply@gmail.com>",
      to: "<nandkishor.desai@indicchain.com>",
      subject: 'Notification',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  // getImageUrl: async (files) => {
  //   var result = await cloudinary.v2.uploader.upload(files[0].path)
  //   console.log("82", result)
  //   return result.secure_url;
  // },
  getImageUrl: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files, { resource_type: "auto" })
    return result;
  },

  genBase64: async (data) => {
    return await qrcode.toDataURL(data);
  },

  getSecureUrl: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files[0].path);
    return result.secure_url;
  },


  // USED
  sendEmailOtp: async (email, otp) => {
    var html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <table style="width:100%">
            <tr>
                <th></th>
            </tr>
        </table>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Use the following OTP to complete your Sign Up procedures. OTP is valid for 3 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
      <p style="font-size:0.9em;">Thank You,</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      </div>
    </div>
</div>`
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      },
    });
    var mailOptions = {
      from: '<do_not_reply@gmail.com>',
      to: email,
      subject: 'OTP for verification.',
      // text: sub,
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  sendEmailCreadential: (email, password, callback) => {
    var sub = `Your creadential is  email:- ${email} and password:- ${password} .`
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
        // "user": "customerservice@ejobbing.com",
        // "pass": "Thrive123"

      }
    });
    var mailOptions = {
      from: '<do_not_reply@gmail.com>',
      to: email,
      subject: 'creadential for login',
      text: sub,
      // html: html
    };
    transporter.sendMail(mailOptions, function (error, info) {
      // console.log(error, info)
      if (error) {
        callback(error, null)
      } else {
        callback(null, info.response)
      }
    });
  },

  sendPushMail: async (email, subject, body) => {
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: subject,
      html: body
    };
    return await transporter.sendMail(mailOptions)
  },

  uploadImage(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(image, function (error, result) {
        console.log(result);
        if (error) {
          reject(error);
        }
        else {
          resolve(result.url)
        }
      });
    })
  },

  makeReferral() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  generateOrder() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "ORD-" + result;
  },


  async commissionGive(referralCode, package1, amount) {
    let result = []
    let referId = []
    referId[0] = [referralCode]
    let percentile = await percentileModel.findOne({ package: package1 })
    for (let i = 0; i < 10; i++) {
      let findreferer = await userModel.findOne({ referralCode: referId[i], status: status.ACTIVE })
      if (!findreferer) {
        break;
      }
      let amountInc = amount * percentile.percentile[i] / 100

      let update = await userModel.findOneAndUpdate({ _id: checkStack._id }, { $inc: { commission: amountInc } }, {})
      result.push(update)
      if (!findreferer.referedByCode) {
        break;
      }
      else {
        referId.push(findreferer.referedByCode)
        continue
      }
    }
    return result
  },
  async commissionGive2(referralCode, package1, amount) {
    let result = []
    let referId = []
    referId[0] = [referralCode]
    let percentile = await percentileModel.findOne({ package: package1 })
    console.log("zizge8d-----------------8n", percentile)

    // let findAdmin = await user.findOne({ status:status.ACTIVE})
    // console.log("zizge8d8???????????????n", findAdmin)
    for (let i = 0; i < 10; i++) {
      if (referId[i] == null) {
        console.log("gyzuwdqvgwbeyuzn")
        break;
      }
      let stackCheck = await stackingModel.findOne({ referedByCode: referId[i], package: package1 })
      if (!stackCheck) {
        break;
      }

      let amountInc = amount * percentile.percentile[i] / 100;
      console.log(amountInc)
      // let adminUpdate = await user.findOneAndUpdate({ _id: findAdmin._id }, { $inc: { adminUsableAmount: -amountInc } }, { new: true })
      let update = await userModel.findByIdAndUpdate({ _id: stackCheck.userId }, { $inc: { pendingReferralAmount: amountInc } }, { new: true })
      result.push(update)
      referId.push(stackCheck.referedByCode)
    }
    return result
  },
  getImageUrlPhase2: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files, { resource_type: "auto", transformation: { duration: 30 } })
    console.log("82", result)
    return result;
  },
  paginationFunction: (result, page, limit) => {
    let endIndex = page * limit;
    let startIndex = (page - 1) * limit;
    var resultArray = {}

    resultArray.page = page
    resultArray.limit = limit
    resultArray.remainingItems = result.length - endIndex

    if (result.length - endIndex < 0) {
      resultArray.remainingItems = 0

    }
    resultArray.count = result.length
    resultArray.results = result.slice(startIndex, endIndex)
    return resultArray
  },

  sendMailNotification: async (to, subject, name, message) => {
    let html = `<div style="font-size:15px">
                <p>Hello ${name},</p>
                <p>${message}

                </p> 
                <p>
                    Thanks<br>
                </p>
            </div>`

    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: to,
      subject: subject,
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },
  pushNotification: (deviceToken, title, body, callback) => {
    console.log(deviceToken);
    var serverKey = 'AAAAq3GnZvU:APA91bGRp0UOsTVWKBSFdHL4uOuQrmrmzEE24eYEVC5n63v8LINlmjWaSsov7YtvSM3YuLLs3kqu7CSE3BgDca7Tt2H1bDxDVMtHtCFeRsU-sYeVYXfjYHAaTxEn0za4TvGx70lVpnvf';
    var fcm = new FCM(serverKey);

    var message = {
      to: deviceToken, // required fill with device token or topics
      "content_available": true,
      notification: {
        title: title,
        body: body
      },
      // data: data2
    };
    //callback style
    fcm.send(message, function (err, response) {
      if (err) {
        console.log(">>>>>>>>>>", err)
        callback(err, null)
      } else {
        console.log(">>>>>>>>>response", response)
        callback(null, response)
      }
    });

  },

  pushNotificationCustomer: (deviceToken, title, body, callback) => {
    console.log(deviceToken);
    var serverKey = 'AAAAq3GnZvU:APA91bGRp0UOsTVWKBSFdHL4uOuQrmrmzEE24eYEVC5n63v8LINlmjWaSsov7YtvSM3YuLLs3kqu7CSE3BgDca7Tt2H1bDxDVMtHtCFeRsU-sYeVYXfjYHAaTxEn0za4TvGx70lVpnvf';
    var fcm = new FCM(serverKey);
    var message = {
      to: deviceToken, // required fill with device token or topics
      "content_available": true,
      notification: {
        title: title,
        body: body
      },
      // data: data2
    };
    //callback style
    fcm.send(message, function (err, response) {
      if (err) {
        callback(err, null)
      } else {
        callback(null, response)
      }
    });

  },





  generateSku(brand, item, color, size) {
    var gen = brand.substring(0, 3) + "-" + item.substring(0, 3) + "-" + color.substring(0, 3) + "-" + size.substring(0, 6);
    return gen;
  },

  couponCode: async () => {
    function makeid(length) {
      var result = '';
      var characters = '0123456789abcdefghij0123456789klmnopqrst0123456789uvwxyzAB0123456789CDEFGHIJKL0123456789MNOPQRSTU0123456789VWXYZ0123456789';
      for (var i = length; i > 0; --i) result += characters[Math.floor(Math.random() * characters.length)];
      return result;
    }
    var alph = makeid(8)
    return alph
  },

  generateGiftAndVoucherCode: async () => {
    function makeid(length) {
      var result = '';
      var characters = '0123456789abcdefghij0123456789klmnopqrst0123456789uvwxyzAB0123456789CDEFGHIJKL0123456789MNOPQRSTU0123456789VWXYZ0123456789';
      for (var i = length; i > 0; --i) result += characters[Math.floor(Math.random() * characters.length)];
      return result;
    }
    var alph = makeid(8)
    return alph
  },
  
  generateOrder() {
    var result = '';
    var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "LGM-" + result;
  },
  generateOrderS() {
    var result = '';
    var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "LGS-" + result;
  },
  sendMailtoClient: async (to, name, amount, ordstatus, createdDate, orderId, subject) => {
    if (ordstatus == "DELIVERED") {
      let html = `<div style="font-size:15px">
      <p>Hello ${name},</p>
      <p>Your order has been Delivered. Based on your recent delivery experience, Hope you like shopping with us .
      </a>Oder Details :-
          oderId:-${orderId}
          BookingDate:-${createdDate}
          Total Recived Rs. ${amount} 
      </p> 
        <p>
            Thanks<br>
            Best Regards<br>
            Team Lungisa
        </p>
    </div>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: subject,
        html: html
      };
      return await transporter.sendMail(mailOptions)
    } else if (ordstatus == "DISPATCHED") {
      let html = `<div style="font-size:15px">
                <p>Hello ${name},</p>
                <p>Your order of orderId # ${orderId}  dated ${createdDate} has been dispatched .
                  We know you are excited to get your hands on them. you can track your order below. 
                </a>
                    Total payable Rs. ${amount} 
                </p>  
                  <p>
                      Thanks<br>
                      Best Regards<br>
                      Team Lungisa
                  </p>
              </div>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: subject,
        html: html
      };
      return await transporter.sendMail(mailOptions)
    } else {
      let html = `<div style="font-size:15px">
      <p>Hello ${name},</p>
      <p>You have cancelled your orderId ${orderId} that you have booked on Date:- ${createdDate}.
        Thanks for using our services ,You will get your refund within 15 days . 
      </a>
          Total payable Rs. ${amount} 
      </p> 
        <p>
        Thanks<br>
        Best Regards<br>
        Team Lungisa
        </p>
    </div>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: subject,
        html: html
      };
      return await transporter.sendMail(mailOptions)
    }


  },
  sendMailtoExpert: async (to, name, amount, ordstatus) => {
    if (ordstatus == "DELIVERED") {
      let html = `<div style="font-size:15px">
      <p>Hello ${name},</p>
      <p>you have Delivery the order to user.
      </a>
          Total Recived Rs. ${amount} 
      </p> 
        <p>
            Thanks<br>
        </p>
    </div>`

      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: 'Reset Link',
        html: html
      };
      return await transporter.sendMail(mailOptions)
    } else {
      let html = `<div style="font-size:15px">
      <p>Hello ${name},</p>
      <p>you have pick a order for Delivery to user. 
      </a>
          Total Recived Rs. ${amount} 
      </p> 
        <p>
            Thanks<br>
        </p>
    </div>`

      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: 'Reset Link',
        html: html
      };
      return await transporter.sendMail(mailOptions)
    }
  },
  sendPushSms: async (number, body) => {
    console.log("=====>number", number, "====>body", body)
    let send = await sender.sendSms(String(body), config.get('AWS.smsSecret'), false, String(number))
    return send

  },

  sendMailforEdit: async (message, email, subject) => {
    let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
    <!--[if gte mso 9]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
      <title></title>
      
        <style type="text/css">
          table, td { color: #000000; } @media only screen and (min-width: 670px) {
      .u-row {
        width: 650px !important;
      }
      .u-row .u-col {
        vertical-align: top;
      }
    
      .u-row .u-col-100 {
        width: 650px !important;
      }
    
    }
    
    @media (max-width: 670px) {
      .u-row-container {
        max-width: 100% !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }
      .u-row .u-col {
        min-width: 320px !important;
        max-width: 100% !important;
        display: block !important;
      }
      .u-row {
        width: calc(100% - 40px) !important;
      }
      .u-col {
        width: 100% !important;
      }
      .u-col > div {
        margin: 0 auto;
      }
    }
    body {
      margin: 0;
      padding: 0;
    }
    
    table,
    tr,
    td {
      vertical-align: top;
      border-collapse: collapse;
    }
    
    p {
      margin: 0;
    }
    
    .ie-container table,
    .mso-container table {
      table-layout: fixed;
    }
    
    * {
      line-height: inherit;
    }
    
    a[x-apple-data-detectors='true'] {
      color: inherit !important;
      text-decoration: none !important;
    }
    
    </style>
      
      
    
    <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->
    
    </head>
    
    <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
      <!--[if IE]><div class="ie-container"><![endif]-->
      <!--[if mso]><div class="mso-container"><![endif]-->
      <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
      <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
        
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #dff1ff;"><![endif]-->
          
    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color: #ffffff;width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="background-color: #ffffff;width: 100% !important;">
      <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:13px 0px 15px;font-family:'Montserrat',sans-serif;" align="left">
            
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
          <img align="center" border="0" src="https://res.cloudinary.com/mobiloitte-pvt-ltd/raw/upload/v1649398894/ig1h7bgsqubqmw7vzuif.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 54%;max-width: 351px;" width="351"/>
          
        </td>
      </tr>
    </table>
    
          </td>
        </tr>
      </tbody>
    </table>
    
      <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
        </div>
      </div>
    </div>
    
    
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #f3fbfd;"><![endif]-->
          
    <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="width: 100% !important;">
      <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
        <p style="font-size: 14px; line-height: 140%;"><strong><span style="font-size: 24px; line-height: 33.6px;">${subject}</span></strong></p>
      </div>
    
          </td>
        </tr>
      </tbody>
    </table>
    
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #1b262c; line-height: 140%; text-align: left; word-wrap: break-word;">
        <p style="font-size: 14px; line-height: 140%;">${message}</p>
      </div>
    
          </td>
        </tr>
      </tbody>
    </table>
    
      <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
        </div>
      </div>
    </div>
    
    
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #151418;"><![endif]-->
          
    <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="width: 100% !important;">
      <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
        <p dir="rtl" style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">Copyright @ 2021 Lungisa | All RIghts Reserved</span></p>
      </div>
    
          </td>
        </tr>
      </tbody>
    </table>
    
      <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
        </div>
      </div>
    </div>
    
    
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </td>
      </tr>
      </tbody>
      </table>
      <!--[if mso]></div><![endif]-->
      <!--[if IE]></div><![endif]-->
    </body>
    
    </html>`
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: subject,
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },
  sendSmsPromise: async (number, body) => {
    let send = await sender.sendSms(body, config.get('AWS.smsSecret'), false, number)
    return send

  },

  sendMailKYCRequest: async (email, subject, body) => {
    try {
      let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title></title>
        
          <style type="text/css">
            table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
      @media only screen and (min-width: 670px) {
        .u-row {
          width: 650px !important;
        }
        .u-row .u-col {
          vertical-align: top;
        }
      
        .u-row .u-col-100 {
          width: 650px !important;
        }
      
      }
      
      @media (max-width: 670px) {
        .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
        }
        .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
        }
        .u-row {
          width: calc(100% - 40px) !important;
        }
        .u-col {
          width: 100% !important;
        }
        .u-col > div {
          margin: 0 auto;
        }
      }
      body {
        margin: 0;
        padding: 0;
      }
      
      table,
      tr,
      td {
        vertical-align: top;
        border-collapse: collapse;
      }
      
      p {
        margin: 0;
      }
      
      .ie-container table,
      .mso-container table {
        table-layout: fixed;
      }
      
      * {
        line-height: inherit;
      }
      
      a[x-apple-data-detectors='true'] {
        color: inherit !important;
        text-decoration: none !important;
      }
      
      </style>
        
        
      
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
      
      </head>
      
      <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
  
        <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
        <tbody>
        <tr style="vertical-align: top">
          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
          
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;" align="left">
              
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 0px;padding-left: 0px;" align="center">
            
            <img align="center" border="0" src="https://res.cloudinary.com/douysk2ew/image/upload/v1669378215/l7yivriekxdyhaoccspn.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;" width="500"/>
            
          </td>
        </tr>
      </table>
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
          <p style="line-height: 170%; text-align: center; font-size: 14px;"><span style="font-size: 24px; line-height: 40.8px; color: #000000;"><strong>${subject}</strong></span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;"></br></br>
        <p style="font-size: 14px; line-height: 140%;">${subject}</p>
      <p style="font-size: 14px; line-height: 140%;">${body}</p></br>
     <p>Thanks and Regards, <br>
  <b>Team Hexaverse</b></p> 
        </div>
        
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
              
      <div align="center">
          <a href="" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
           
          </a>
      </div>
      
            </td>
          </tr>
        </tbody>
      </table></div>
        </div>
      </div>
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
        <div style="width: 100% !important;">
       <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
        
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
              
        <div style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">2022 @Hexaverse || All Rights Reserved</span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      </div>
        </div>
      </div>
          </div>
        </div>
      </div>
  
          </td>
        </tr>
        </tbody>
        </table>
      </body>
      
      </html>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.email'),
          "pass": config.get('nodemailer.password')
        }
      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: email,
        subject: subject,
        html: html,
      };
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log("error==>>", error);
      throw error;
    }
  },

  sendCredentialsByMail: async (name, message, email, subject) => {
    let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
   <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
   <head>
   <!--[if gte mso 9]>
   <xml>
     <o:OfficeDocumentSettings>
       <o:AllowPNG/>
       <o:PixelsPerInch>96</o:PixelsPerInch>
     </o:OfficeDocumentSettings>
   </xml>
   <![endif]-->
     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <meta name="x-apple-disable-message-reformatting">
     <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
     <title></title>
     
       <style type="text/css">
         table, td { color: #000000; } @media (max-width: 480px) { #u_content_image_3 .v-src-width { width: 183px !important; } #u_content_image_3 .v-src-max-width { max-width: 35% !important; } #u_content_image_2 .v-src-width { width: 479px !important; } #u_content_image_2 .v-src-max-width { max-width: 55% !important; } }
   @media only screen and (min-width: 570px) {
     .u-row {
       width: 550px !important;
     }
     .u-row .u-col {
       vertical-align: top;
     }
   
     .u-row .u-col-50 {
       width: 275px !important;
     }
   
     .u-row .u-col-100 {
       width: 550px !important;
     }
   
   }
   
   @media (max-width: 570px) {
     .u-row-container {
       max-width: 100% !important;
       padding-left: 0px !important;
       padding-right: 0px !important;
     }
     .u-row .u-col {
       min-width: 320px !important;
       max-width: 100% !important;
       display: block !important;
     }
     .u-row {
       width: calc(100% - 40px) !important;
     }
     .u-col {
       width: 100% !important;
     }
     .u-col > div {
       margin: 0 auto;
     }
   }
   body {
     margin: 0;
     padding: 0;
   }
   
   table,
   tr,
   td {
     vertical-align: top;
     border-collapse: collapse;
   }
   
   p {
     margin: 0;
   }
   
   .ie-container table,
   .mso-container table {
     table-layout: fixed;
   }
   
   * {
     line-height: inherit;
   }
   
   a[x-apple-data-detectors='true'] {
     color: inherit !important;
     text-decoration: none !important;
   }
   
   </style>
     
     
   
   <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->
   
   </head>
   
   <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #e0e5eb;color: #000000">
     <!--[if IE]><div class="ie-container"><![endif]-->
     <!--[if mso]><div class="mso-container"><![endif]-->
     <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #e0e5eb;width:100%" cellpadding="0" cellspacing="0">
     <tbody>
     <tr style="vertical-align: top">
       <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
       <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e0e5eb;"><![endif]-->
       
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: transparent;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
   <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
     <tbody>
       <tr>
         <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Lato',sans-serif;" align="left">
           
     <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
       <tbody>
         <tr style="vertical-align: top">
           <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
             <span>&#160;</span>
           </td>
         </tr>
       </tbody>
     </table>
   
         </td>
       </tr>
     </tbody>
   </table>
   
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #ffffff;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="275" style="width: 275px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-50" style="max-width: 320px;min-width: 275px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
   <!--[if (mso)|(IE)]><td align="center" width="275" style="width: 275px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-50" style="max-width: 320px;min-width: 275px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #d5827c;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #d5827c;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="background-color: #ffffff;width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="background-color: #ffffff;width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
   <table id="u_content_image_3" style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
     <tbody>
       <tr>
         <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 10px 10px;font-family:'Lato',sans-serif;" align="left">
           
   <table width="100%" cellpadding="0" cellspacing="0" border="0">
     <tr>
       <td style="padding-right: 0px;padding-left: 0px;" align="center">
         
         <img align="center" border="0" src="https://res.cloudinary.com/mobiloitte-pvt-ltd/raw/upload/v1649398894/ig1h7bgsqubqmw7vzuif.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 72%;max-width: 381.6px;" width="381.6" class="v-src-width v-src-max-width"/>
         
       </td>
     </tr>
   </table>
   
         </td>
       </tr>
     </tbody>
   </table>
   
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #d5827c;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #d5827c;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="background-color: #ffffff;width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="background-color: #ffffff;width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
   <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
     <tbody>
       <tr>
         <td style="overflow-wrap:break-word;word-break:break-word;padding:15px 10px 10px;font-family:'Lato',sans-serif;" align="left">
           
     <h1 style="margin: 0px; color: #000000; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: book antiqua,palatino; font-size: 33px;">
       Welcome! ${name}
     </h1>
   
         </td>
       </tr>
     </tbody>
   </table>
   
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #d5827c;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #d5827c;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="background-color: #ffffff;width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="background-color: #ffffff;width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
   <table id="u_content_image_2" style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
     <tbody>
       <tr>
         <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Lato',sans-serif;" align="left">
           
   <table width="100%" cellpadding="0" cellspacing="0" border="0">
     <tr>
       <td style="padding-right: 0px;padding-left: 0px;" align="center">
         
         <img align="center" border="0" src="https://res.cloudinary.com/mobiloitte-pvt-ltd/raw/upload/v1649398894/ig1h7bgsqubqmw7vzuif.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 39%;max-width: 206.7px;" width="206.7" class="v-src-width v-src-max-width"/>
         
       </td>
     </tr>
   </table>
   
         </td>
       </tr>
     </tbody>
   </table>
   
   <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
     <tbody>
       <tr>
         <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 40px 20px;font-family:'Lato',sans-serif;" align="left">
           
     <div style="color: #4b4a4a; line-height: 140%; text-align: center; word-wrap: break-word;">
       <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 18px; line-height: 25.2px; font-family: Montserrat, sans-serif;"><sub><span style="line-height: 21px; background-color: #ffffff; color: #000000; font-size: 15px;"><span style="font-size: 15px; line-height: 21px;">${message}</span>&nbsp;</span></sub></span></p>
     </div>
   
         </td>
       </tr>
     </tbody>
   </table>
   
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #eef2f5;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #eef2f5;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #eef2f5;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #eef2f5;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="275" style="width: 275px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-50" style="max-width: 320px;min-width: 275px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
   <!--[if (mso)|(IE)]><td align="center" width="275" style="width: 275px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-50" style="max-width: 320px;min-width: 275px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #eef2f5;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #eef2f5;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #ffffff;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #ffffff;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
   <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
     <tbody>
       <tr>
         <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 15px;font-family:'Lato',sans-serif;" align="left">
           
     <div style="color: #7e8c8d; line-height: 140%; text-align: center; word-wrap: break-word;">
       <p style="font-size: 14px; line-height: 140%;">&copy; Copyright @ 2021 Lungisa. All Rights Reserved.</p>
     </div>
   
         </td>
       </tr>
     </tbody>
   </table>
   
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
   
   <div class="u-row-container" style="padding: 0px;background-color: transparent">
     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
       <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
         <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: transparent;"><![endif]-->
         
   <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
   <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
     <div style="width: 100% !important;">
     <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
     
   <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
     <tbody>
       <tr>
         <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Lato',sans-serif;" align="left">
           
     <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
       <tbody>
         <tr style="vertical-align: top">
           <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
             <span>&#160;</span>
           </td>
         </tr>
       </tbody>
     </table>
   
         </td>
       </tr>
     </tbody>
   </table>
   
     <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
     </div>
   </div>
   <!--[if (mso)|(IE)]></td><![endif]-->
         <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
       </div>
     </div>
   </div>
   
   
       <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
       </td>
     </tr>
     </tbody>
     </table>
     <!--[if mso]></div><![endif]-->
     <!--[if IE]></div><![endif]-->
   </body>
   
   </html>
   `
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: subject,
      html: html
    };
    return await transporter.sendMail(mailOptions)

  },
  sendMailOrder: async (email, amount, createdDate, dateIssue, orderId, client_address, subject, message, heading) => {
    let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <!--[if gte mso 9]>
<xml>
 <o:OfficeDocumentSettings>
   <o:AllowPNG/>
   <o:PixelsPerInch>96</o:PixelsPerInch>
 </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <title></title>

  <style type="text/css">
    table,
    td {
      color: #000000;
    }

    a {
      color: #0000ee;
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      #u_content_text_88 .v-text-align {
        text-align: left !important;
      }

      #u_content_text_89 .v-text-align {
        text-align: left !important;
      }

      #u_content_heading_2 .v-container-padding-padding {
        padding: 25px 10px 10px !important;
      }

      #u_content_text_4 .v-container-padding-padding {
        padding: 0px 10px !important;
      }

      #u_content_text_4 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_7 .v-container-padding-padding {
        padding: 0px 10px 1px !important;
      }

      #u_content_text_7 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_6 .v-container-padding-padding {
        padding: 0px 10px !important;
      }

      #u_content_text_6 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_5 .v-container-padding-padding {
        padding: 10px 30px 25px 10px !important;
      }

      #u_content_text_14 .v-container-padding-padding {
        padding: 25px 10px 10px 15px !important;
      }

      #u_content_text_14 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_13 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_18 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_19 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_15 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_16 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_12 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_17 .v-container-padding-padding {
        padding: 0px 15px 10px !important;
      }

      #u_content_text_17 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_21 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_22 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_23 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_20 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_72 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_73 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_74 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_75 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_76 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_77 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_78 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_79 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_80 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_81 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_82 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_83 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_84 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_85 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_86 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_53 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_54 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_55 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_56 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_57 .v-text-align {
        text-align: center !important;
      }

      #u_content_divider_13 .v-container-padding-padding {
        padding: 5px 10px 10px !important;
      }

      #u_content_text_48 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_52 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_70 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_71 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_68 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_69 .v-text-align {
        text-align: center !important;
      }

      #u_content_text_87 .v-text-align {
        text-align: left !important;
      }
    }

    @media only secreen and (min-width: 620px) {
      .u-row {
        width: 600px !important;
      }

      .u-row .u-col {
        vertical-align: top;
      }

      .u-row .u-col-19p33 {
        width: 115.97999999999998px !important;
      }

      .u-row .u-col-20p83 {
        width: 124.97999999999998px !important;
      }

      .u-row .u-col-21p33 {
        width: 127.97999999999998px !important;
      }

      .u-row .u-col-22p66 {
        width: 135.96px !important;
      }

      .u-row .u-col-23p66 {
        width: 141.96px !important;
      }

      .u-row .u-col-23p83 {
        width: 142.98px !important;
      }

      .u-row .u-col-26p17 {
        width: 157.02px !important;
      }

      .u-row .u-col-27p17 {
        width: 163.02px !important;
      }

      .u-row .u-col-28p17 {
        width: 169.02px !important;
      }

      .u-row .u-col-29p84 {
        width: 179.04px !important;
      }

      .u-row .u-col-33p33 {
        width: 199.98px !important;
      }

      .u-row .u-col-100 {
        width: 600px !important;
      }

    }

    @media (max-width: 620px) {
      .u-row-container {
        max-width: 100% !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }

      .u-row .u-col {
        min-width: 320px !important;
        max-width: 100% !important;
        display: block !important;
      }

      .u-row {
        width: calc(100% - 40px) !important;
      }

      .u-col {
        width: 100% !important;
      }

      .u-col>div {
        margin: 0 auto;
      }
    }

    body {
      margin: 0;
      padding: 0;
    }

    table,
    tr,
    td {
      vertical-align: top;
      border-collapse: collapse;
    }

    p {
      margin: 0;
    }

    .ie-container table,
    .mso-container table {
      table-layout: fixed;
    }

    * {
      line-height: inherit;
    }

    a[x-apple-data-detectors='true'] {
      color: inherit !important;
      text-decoration: none !important;
    }

    @media (max-width: 480px) {
      .hide-mobile {
        max-height: 0px;
        overflow: hidden;
        display: none !important;
      }

    }
  </style>



  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css">
  <!--<![endif]-->

</head>

<body class="clean-body u_body"
  style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #e7e7e7;color: #000000">
  <!--[if IE]><div class="ie-container"><![endif]-->
  <!--[if mso]><div class="mso-container"><![endif]-->
  <table
    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #e7e7e7;width:100%"
    cellpadding="0" cellspacing="0">
    <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->


          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #2cb4f3;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:20px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td class="v-text-align" style="padding-right: 0px;padding-left: 0px;" align="center">

                                    <img align="center" border="0" src="https://res.cloudinary.com/mobiloitte-pvt-ltd/raw/upload/v1649398894/ig1h7bgsqubqmw7vzuif.png" alt="Logo" title="Logo"
                                      style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 35%;max-width: 203px;"
                                      width="203" />

                                  </td>
                                </tr>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>




          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0d83dd;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #0d83dd;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="200" style="width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-33p33"
                  style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_heading_2" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:15px 10px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <h1 class="v-text-align"
                                style="margin: 0px; color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: 'Montserrat',sans-serif; font-size: 22px;">
                                <strong>${heading}</strong>
                              </h1>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
           
              </div>
            </div>
          </div>



          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="200" style="width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-33p33"
                  style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_14" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:20px 10px 10px 20px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #000000; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><b><span style="font-size: 16px; line-height: 22.4px;">Billed To </span></b></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table id="u_content_text_13" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 10px 15px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;">${client_address}</span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="200" style="width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-33p33"
                  style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_18" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:20px 10px 5px 15px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #000000; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><strong><span
                                      style="font-size: 16px; line-height: 22.4px;">OderId</span></strong></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table id="u_content_text_19" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 5px 15px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;">${orderId}</span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="200" style="width: 200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-33p33"
                  style="max-width: 320px;min-width: 200px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_12" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:20px 15px 5px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #000000; line-height: 140%; text-align: right; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><strong><span
                                      style="font-size: 16px; line-height: 22.4px;">Date Of Issue</span></strong></p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table id="u_content_text_17" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:0px 15px 5px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="line-height: 140%; text-align: right; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="color: #0d83dd; font-size: 14px; line-height: 19.6px;"><strong><span
                                        style="font-size: 20px; line-height: 28px;">${dateIssue}</span></strong></span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>



          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:15px 0px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 3px dashed #0d83dd;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td
                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <span>&#160;</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>



          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="169" style="width: 169px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-28p17"
                  style="max-width: 320px;min-width: 169px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_21" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 10px 15px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #0d83dd; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;"><strong>oderId </strong></span>
                                </p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="125" style="width: 125px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-20p83"
                  style="max-width: 320px;min-width: 125px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_22" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #0d83dd; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;"><strong>Booking Date </strong></span>
                                </p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>

                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="163" style="width: 163px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-27p17"
                  style="max-width: 320px;min-width: 163px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_20" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px 15px 10px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #0d83dd; line-height: 140%; text-align: right; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;"><strong>Amount</strong></span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>




          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td
                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <span>&#160;</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>
          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="179" style="width: 179px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-29p84"
                  style="max-width: 320px;min-width: 179px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_77" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 5px 15px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #34495e; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><strong>${orderId}</strong></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="136" style="width: 136px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-22p66"
                  style="max-width: 320px;min-width: 136px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_79" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #34495e; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;">${createdDate}</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>

                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="157" style="width: 157px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-26p17"
                  style="max-width: 320px;min-width: 157px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_81" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px 15px 10px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #34495e; line-height: 140%; text-align: right; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><strong>${amount}</strong></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>
          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_divider_13" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td
                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <span>&#160;</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>
          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0d83dd;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #0d83dd;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="179" style="width: 179px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-29p84"
                  style="max-width: 320px;min-width: 179px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table class="hide-mobile" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td
                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <span>&#160;</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="116" style="width: 116px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-19p33"
                  style="max-width: 320px;min-width: 116px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table class="hide-mobile" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid #BBBBBB;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td
                                      style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                      <span>&#160;</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="142" style="width: 142px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-23p66"
                  style="max-width: 320px;min-width: 142px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_68" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 5px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #ffffff; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;"><strong>Total</strong></span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]><td align="center" width="163" style="width: 163px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-27p17"
                  style="max-width: 320px;min-width: 163px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_69" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px 15px 10px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #ffffff; line-height: 140%; text-align: right; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 18px; line-height: 25.2px;"><strong>${amount}</strong></span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>
          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #d9eef8;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #d9eef8;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="598" style="width: 598px;padding: 0px;border-top: 0px solid transparent;border-left: 1px solid #2cb4f3;border-right: 1px solid #2cb4f3;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 1px solid #2cb4f3;border-right: 1px solid #2cb4f3;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table id="u_content_text_87" style="font-family:'Montserrat',sans-serif;" role="presentation"
                        cellpadding="0" cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:30px 10px 10px 15px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #34495e; line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;"><strong><span
                                        style="font-family: Montserrat, sans-serif; line-height: 22.4px; font-size: 16px;">
                                        ${message}</span></strong></span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 30px 15px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;">&nbsp;Thanks<br />&nbsp;Best
                                    Regards</span><span style="font-size: 16px; line-height: 22.4px;">&nbsp;</span></p>
                                <p style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 16px; line-height: 22.4px;">&nbsp;Team Lungisa</span></p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>



          <div class="u-row-container" style="padding: 0px;background-color: transparent">
            <div class="u-row"
              style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #000000;">
              <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #34495e;"><![endif]-->

                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                    <!--[if (!mso)&(!IE)]><!-->
                    <div
                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                      <!--<![endif]-->

                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:30px 10px 10px;font-family:'Montserrat',sans-serif;"
                              align="left">


                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0"
                        cellspacing="0" width="100%" border="0">
                        <tbody>
                          <tr>
                            <td class="v-container-padding-padding"
                              style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;"
                              align="left">

                              <div class="v-text-align"
                                style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                <p dir="rtl" style="font-size: 14px; line-height: 140%;"><span
                                    style="font-size: 14px; line-height: 19.6px;">Copyright @ 2021 Lungisa | All RIghts
                                    Reserved</span></p>
                                <p style="font-size: 14px; line-height: 150%;">&nbsp;</p>
                              </div>

                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!--[if (!mso)&(!IE)]><!-->
                    </div>
                    <!--<![endif]-->
                  </div>
                </div>
                <!--[if (mso)|(IE)]></td><![endif]-->
                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
              </div>
            </div>
          </div>


          <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </td>
      </tr>
    </tbody>
  </table>
  <!--[if mso]></div><![endif]-->
  <!--[if IE]></div><![endif]-->
</body>

</html>`;
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: subject,
      html: html
    };
    return await transporter.sendMail(mailOptions);
  }
}
async function findCredentials() {
  return await setEmail.findOne({})
}

// console.log(findCred);