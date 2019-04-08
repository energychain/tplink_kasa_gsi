'use strict';

module.exports = function(config) {
  const http_request = require("request");
  const { login } = require("tplink-cloud-api");


  this.config = config;

  const  _getGSI = function(meter) {
    return new Promise( async function (resolve, reject)  {
      let gsidata = {};
      gsidata.zip = meter.location.zip;
      gsidata.externalAccount = meter.administrationNumber;
      if((typeof meter.administrationNumber == "undefined") || (meter.administrationNumber == null) || (meter.administrationNumber.length <1)) {
        gsidata.externalAccount = meter.meterId;
      }
      gsidata.energy = meter["1.8.0"];
      gsidata["1.8.0"] = gsidata.energy;
      gsidata.plz = meter.location.zip;
      gsidata.secret = meter.meterId;
      gsidata.timeStamp = meter.timeStamp;
      http_request.post("https://api.corrently.io/core/reading",{form:gsidata},function(e,r,b) {
        let _gsi = JSON.parse(b);        
        if(typeof _gsi["account"] != "undefined") meter.account = _gsi["account"];
        if(typeof _gsi["1.8.1"] != "undefined") meter["1.8.1"] = _gsi["1.8.1"]*1;
        if(typeof _gsi["1.8.2"] != "undefined") meter["1.8.2"] = _gsi["1.8.2"]*1;
        resolve(meter);
      })
    });
  }

  this.meters = async function() {
    let parent = this;
    return new Promise( async function (resolve, reject)  {
      const tplink = await login(config.TPLINK_ACCOUNT, config.TPLINK_PASSWORD, "TermID");
      let deviceList = await tplink.getDeviceList();
      let meters = [];
      for(let i=0;i<deviceList.length;i++) {
        if( deviceList[i].deviceModel == "HS110(EU)") {
            let meter = deviceList[i];
            let consumption = await tplink.getHS110(meter.alias).getPowerUsage();
            meter["1.8.0"] = consumption.total_wh;
            meter.location = { zip: config.ZIP };
            meter.externalAccount = meter.deviceId;
            meter.meterId = meter.hwId;
            deviceList[i] = await _getGSI(meter);
            meters.push(deviceList[i]);
        }
      }
      resolve(meters);
    });
  }

  this.meter = async function(query) {
    let parent = this;
    return new Promise( async function (resolve, reject)  {
      parent.meters().then(function(meters) {
        for(let i=0; i< meters.length; i++) {
          if(meters[i].meterId==query) resolve(meters[i]);
          if(meters[i].alias==query) resolve(meters[i]);
          if(meters[i].account==query) resolve(meters[i]);
          if(meters[i].deviceId==query) resolve(meters[i]);
          if(meters[i].deviceMac==query) resolve(meters[i]);
        }
      });
    });
  }

  this.REQUIREDCONFIGS = ["TPLINK_ACCOUNT","TPLINK_PASSWORD","ZIP"];
}
