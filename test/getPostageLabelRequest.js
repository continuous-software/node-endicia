'use strict';

var casual = require('casual');
var assert = require('assert');
var Endicia = require('../index');
var client = new Endicia({
  REQUESTER_ID: '2503326',
  ACCOUNT_ID: '2503326',
  PASSPHRASE: 'K3w6@47V5x3vE0J',
  testMode: true
});

describe('GetPostageLabelRequest', function () {
  it('should get a label with minimum configuration (from, to, weight)', function (done) {
    client.getPostageLabel({
      to: {
        address1: '4341 Watson Street', // casual.address1,
        city: 'Camden', // casual.city,
        state: 'NJ', // casual.state,
        postalCode: '08102' // casual.zip
      },
      from: {
        company: 'Turtur Car Inc.', // casual.company_name,
        returnAddress1: '1997 Elliott Street', // casual.address1,
        city: 'Manchester', // casual.city,
        state: 'NH', // casual.state,
        postalCode: '03101' // casual.zip
      },
      weightOz: 1
    }).then(function (result) {
      var response = result.LabelRequestResponse;
      assert(!response.ErrorMessage);
      assert(response.Status);
      assert(response.Base64LabelImage);
      assert(response.PIC);
      assert(response.TrackingNumber);
      assert(response.FinalPostage);
      assert(response.TransactionID);
      assert(response.TransactionDateTime);
      assert(response.PostmarkDate);
      assert(response.PostageBalance);
      assert(response.CostCenter);
      assert(response.RequesterID);
      done();
    });
  });
});
