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
      assert(response.CertifiedIntermediary);
      assert(response.CertifiedIntermediary.AccountID);
      assert(response.CertifiedIntermediary.SerialNumber);
      assert(response.CertifiedIntermediary.PostageBalance);
      assert(response.CertifiedIntermediary.AscendingBalance);
      assert(response.CertifiedIntermediary.AccountStatus);
      assert(response.CertifiedIntermediary.DeviceID);
      done();
    });
  });
});
