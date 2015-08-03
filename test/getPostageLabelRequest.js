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

describe('getPostageLabelRequest', function () {
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
      var label = result.LabelRequestResponse;
      assert(!label.ErrorMessage);
      assert(label.Status);
      assert(label.Base64LabelImage);
      assert(label.PIC);
      assert(label.TrackingNumber);
      assert(label.FinalPostage);
      assert(label.TransactionID);
      assert(label.TransactionDateTime);
      assert(label.PostmarkDate);
      assert(label.PostageBalance);
      assert(label.CostCenter);
      assert(label.RequesterID);
      done();
    });
  });
});
