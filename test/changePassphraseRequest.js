'use strict';

var casual = require('casual');
var assert = require('assert');
var Promise = require('bluebird');
var Endicia = require('../index');
var client = new Endicia({
  REQUESTER_ID: '2503326',
  ACCOUNT_ID: '2503326',
  PASSPHRASE: 'dewdew423432!frS',
  testMode: true
});

describe('ChangePassPhrase', function () {
  xit('should change the passphrase of the account, then restore it back to original by changing it 4 times then changing it one more time to the original passphrase for later usage', function (done) {
    client.changePassphrase({
      newPassPhrase: 'pika222'
    }).then(function (result) {
      client = new Endicia({
        REQUESTER_ID: '2503326',
        ACCOUNT_ID: '2503326',
        PASSPHRASE: 'pika222',
        testMode: true
      });
      var response = result.ChangePassPhraseRequestResponse;
      assert(!response.ErrorMessage);
      assert(response.Status);
      assert(response.RequesterID);
      assert(response.RequestID);
      return Promise.reduce([
        'pika333',
        'pika3333',
        'pika33333',
        'pika333333'
      ], function (total, temporaryPassphrase) {
        return client.changePassphrase({
          newPassPhrase: temporaryPassphrase
        }).then(function (result) {
          var response = result.ChangePassPhraseRequestResponse;
          assert(!response.ErrorMessage);
          assert(response.Status);
          assert(response.RequesterID);
          assert(response.RequestID);
          client = new Endicia({
            REQUESTER_ID: '2503326',
            ACCOUNT_ID: '2503326',
            PASSPHRASE: temporaryPassphrase,
            testMode: true
          });
        });
      });
    }).then(function () {
      return client.changePassphrase({
        newPassPhrase: '3ekqjsCkhotgWFFQgxpC'
      }).then(function () {
        client = new Endicia({
          REQUESTER_ID: '2503326',
          ACCOUNT_ID: '2503326',
          PASSPHRASE: 'dewdew423432!frS',
          testMode: true
        });
      });
    }).then(function () {
      done();
    });
  });
});
