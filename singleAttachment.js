const https = require("https");
const fs = require("fs");
require('dotenv').config();

const client = require('smartsheet');
const smartsheet = client.createClient({
    accessToken: process.env.smartsheet_token,
    logLevel: 'info'
  });


const rowNumber = process.argv.slice(2);

const getAttachment = async (rowId) => {
    let result = await (await smartsheet.sheets.getRowAttachments({sheetId: process.env.sheet_id, rowId: rowId}));
    //don't use 0 - loop through attachments FUTURE BUG
    let attachment = await (await smartsheet.sheets.getAttachment({sheetId: process.env.sheet_id, attachmentId: result.data[0].id}));
    return attachment;
}

const writeStream = async (res) => {
    const url = res.url;
    https.get(url, (res) => {
    const path = "dunnage.pdf";
    const writeStream = fs.createWriteStream(path);

   res.pipe(writeStream);

   writeStream.on("finish", () => {
      writeStream.close();
      console.log("Download Completed!");
   })
})
}

const finalFunction = function (rowNumber) {
        getAttachment(rowNumber).then((attachment) => {
            writeStream(attachment)
        }).catch((err) => {
            console.log(err);
        })
}

finalFunction(rowNumber);



