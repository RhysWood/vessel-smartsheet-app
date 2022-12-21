const https = require("https");
const fs = require("fs");
require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.host_email,
        pass: process.env.host_password
    }
});

const mailOptions = {
    from: process.env.host_email,
    to: process.env.reciever_email,
    subject: 'Sending Email using Node.js',
    text: 'It worked!',
    attachments: [{
        filename: 'downloaded-image.pdf',
        path: 'downloaded-image.pdf'
    }]
};

const client = require('smartsheet');
const smartsheet = client.createClient({
    accessToken: process.env.smartsheet_token,
    logLevel: 'info'
  });
const options = {
    queryParameters: {
      include: "attachments",
      includeAll: true,
    }
};

smartsheet.sheets.getSheet({id: process.env.sheet_id, includeAll: true})
      .then(function(sheetInfo) {
        const row_id = sheetInfo.rows[0].id;
        return smartsheet.sheets.getRowAttachments({sheetId: process.env.sheet_id, rowId: row_id})
      }).then(function(attachment){
        const attachment_id = attachment.data[0].id;
        return smartsheet.sheets.getAttachment({sheetId: process.env.sheet_id, attachmentId: attachment_id})
    }).then(function(attachment) {
        // console.log(attachment)
        const url = attachment.url;
    
        https.get(url, (res) => {
        const path = "downloaded-image.pdf";
        const writeStream = fs.createWriteStream(path);
    
       res.pipe(writeStream);
    
       writeStream.on("finish", () => {
          writeStream.close();
          console.log("Download Completed!");
       })
    })
    })
    .then(function() {
        const sendEmail = function(){
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        }
        setTimeout(sendEmail, 1500);
    })
    .catch(function(error) {
        console.log(error);
    });
