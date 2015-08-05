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

describe('resetSuspendedAccount', function () {
  it('should get the challenge question', function (done) {
    client.getChallengeQuestion({
      email: 'max@continuous.in.th'
    }).then(function (result) {
      var response = result.ChallengeQuestionResponse;
      assert(!response.ErrorMessage);
      assert(response.Question);
      assert(response.Status);
      assert(response.RequesterID);
      assert(response.RequestID);
      done();
    });
  });

  xit('should reset suspended account by answering challenge question and setting a new passphrase', function (done) {
    client.resetSuspendedAccount({
      challengeAnswer: 'pringle',
      newPassPhrase: 'dewdew423432!frS'
    }).then(function (result) {
      var response = result.ResetSuspendedAccountRequestResponse;
oassert(!response.ErrorMessage);
      assert(response.Status);
      assert(response.RequesterID);
      assert(response.RequestID);
      done();
    });
  });
});
