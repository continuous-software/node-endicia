'use strict';

var casual = require('casual');
var assert = require('assert');
var Endicia = require('../index');
var client = new Endicia({
  REQUESTER_ID: '2503326',
  ACCOUNT_ID: '2503326',
  PASSPHRASE: 'dewdew423432!frS',
  testMode: true
});

describe('BuyPostage', function () {
  it('should recredit the account of the given amount', function (done) {
    client.buyPostage({
      recreditAmount: 10
    }).then(function (result) {
      var response = result.RecreditRequestResponse;
      assert(!response.ErrorMessage);
      assert(response.Status);
      assert(response.RequesterID);
      assert(response.RequestID);
      assert(response.CertifiedIntermediary[0]);
      assert(response.CertifiedIntermediary[0].AccountID);
      assert(response.CertifiedIntermediary[0].SerialNumber);
      assert(response.CertifiedIntermediary[0].PostageBalance);
      assert(response.CertifiedIntermediary[0].AscendingBalance);
      assert(response.CertifiedIntermediary[0].AccountStatus);
      assert(response.CertifiedIntermediary[0].DeviceID);
      done();
    });
  });
});
