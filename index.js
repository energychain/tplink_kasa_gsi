#!/usr/bin/env node
'use strict';

require('dotenv').config();

let GSI_TPLINK = require("./lib/gsi_tplink.js");

if((typeof process.env.TPLINK_PASSWORD != "undefined")&&((typeof process.env.TPLINK_ACCOUNT != "undefined"))) {
  let instance = new GSI_TPLINK({TPLINK_PASSWORD:process.env.TPLINK_PASSWORD,TPLINK_ACCOUNT:process.env.TPLINK_ACCOUNT,ZIP:process.env.ZIP});
  if(process.argv.length<3) {
    instance.meters().then(function(meters) {
      console.log(meters);
    });
  } else {
    instance.meter(process.argv[2]).then(function(meter) {
      console.log(meter);
    });
  }
} else {
  console.log("Missing environment variable TPLINK_ACCOUNT or TPLINK_PASSWORD.");
  console.log("Try to create a .env file with the values");
  console.log("Alternative you might type on command line:");
  console.log(" SET TPLINK_ACCOUNT=YOURACCOUNT");
  console.log(" SET TPLINK_PASSWORD=YOURPASSWORD");
  console.log(" SET ZIP=ZIP_CODE_IN_GERMANY");
  console.log(" ");
}
