'use strict';

var casual = require('casual');
var assert = require('assert');
var Promise = require('bluebird');
var Endicia = require('../index');
var client = new Endicia({
  REQUESTER_ID: '2503326',
  ACCOUNT_ID: '2503326',
  PASSPHRASE: 'K3w6@47V5x3vE0J',
  testMode: true
});

describe('ChangePassPhrase', function () {
  it('should change the passphrase of the account, then restore it back to original by changing it 4 times then changing it one more time to the original passphrase for later usage', function (done) {
    client.changePassphrase({
      newPassPhrase: 'lolipop--'
    }).then(function (result) {
      console.log(result);
      var response = result.ChangePassPhraseRequestResponse;
      assert(!response.ErrorMessage);
      assert(response.Status);
      assert(response.RequesterID);
      assert(response.RequestID);
      return Promise.reduce([
        'lolipop40',
        'lolipop41',
        'lolipop42'
      ], function (total, temporaryPassphrase) {
        return client.changePassphrase({
          newPassPhrase: temporaryPassphrase
        });
      });
    }).then(function () {
      return client.changePassphrase({
        newPassPhrase: 'K3w6@47V5x3vE0J'
      });
    }).then(function () {
      done();
    });
  });
});
