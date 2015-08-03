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

describe.only('BuyPostage', function () {
  it('should recredit the account of the given amount', function (done) {
    client.buyPostage({
      recreditAmount: 10
    }).then(function (result) {
      var response = result.RecreditRequestResponse;
      assert(!response.ErrorMessage);
      assert(response.Status);
      assert(response.RequesterID);
      assert(response.RequestID);
      done();
    });
  });
});
