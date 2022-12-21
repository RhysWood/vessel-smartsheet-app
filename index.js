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



  const rowIDsarray = async (rows) => {
      let array = [];
      for (let i=0; i<rows.length; i++) {
          array.push(rows[i].id);
      }
      return array;
  }

const getRows = async () => {
    let results = await (await smartsheet.sheets.getSheet({id: process.env.sheet_id, includeAll: true}))
    let rowIDs = rowIDsarray(results.rows);
    // returns an array of row IDs
    return rowIDs;
}

const getAttachment = async (rowId) => {
    let result = await (await smartsheet.sheets.getRowAttachments({sheetId: process.env.sheet_id, rowId: rowId}));
    //don't use 0 - loop through attachments FUTURE BUG
    let attachment = await (await smartsheet.sheets.getAttachment({sheetId: process.env.sheet_id, attachmentId: result.data[0].id}));
    return attachment;
}
const getAttachmentFile = async (attachment) => {
    const url = attachment.url;
    return new Promise((resolve, reject) => {
         https.get(url, (res) => {
        return resolve(res);
        })})
    }

const writeStream = async (res) => {
    const path = "downloaded-image.pdf";
    const writeStream = fs.createWriteStream(path);

    res.pipe(writeStream);

    writeStream.on("finish", () => {
        writeStream.close();
        console.log("Download Completed!");
    })
}

const sendEmail = () => {
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
}

const LoopIdsAndGetAttachments = async () => {
    let rowIDs = await getRows();
    for (let i=0; i<rowIDs.length; i++) {
        let attachment = await getAttachment(rowIDs[i]);
        //Up to this point, we are getting all the attachments 
        let res = await getAttachmentFile(attachment)
        await writeStream(res)

        let email = sendEmail()
        email
    }
}

LoopIdsAndGetAttachments();


