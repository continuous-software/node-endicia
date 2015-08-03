'use strict';

var Promise = require('bluebird');
var assert = require('assert');
var assign = require('object-assign');
var request = require('request');
var xmlbuilder = require('xmlbuilder');
var xmlparser = require('xml2js').parseString;
var uuid = require('node-uuid');

module.exports = Endicia;

function Endicia(options) {
  assert(options.REQUESTER_ID, "Requester ID is mandatory");
  assert(options.ACCOUNT_ID, "Account ID is mandatory");
  assert(options.PASSPHRASE, "Passphrase is mandatory");
  this.endpoint = (options.testMode && options.testMode === true)
    ? 'https://elstestserver.endicia.com/LabelService/EwsLabelService.asmx'
    : 'https://www.endicia.com/ELS/ELSServices.cfc?wsd';
  assign(this, options);
  return this;
};

Endicia.prototype.sendRequest = function sendRequest(endpoint) {
  var requestPromisified = Promise.promisify(request);
  var xmlparserPromisified = Promise.promisify(xmlparser);
  return requestPromisified(endpoint)
    .spread(function (response, body) {
      return xmlparserPromisified(body);
    }).then(function (result) {
      if (result.LabelRequestResponse && result.LabelRequestResponse.ErrorMessage && result.LabelRequestResponse.ErrorMessage.length)
        throw { _original: result.LabelRequestResponse }
      return {
        _original: result.LabelRequestResponse,
        id: result.LabelRequestResponse.TransactionID[0],
        trackingCodes: result.LabelRequestResponse.TrackingNumber,
        shippingLabel: result.LabelRequestResponse.Base64LabelImage
      };
    });
};

Endicia.prototype.getPostageLabelRequest = function getPostageLabelRequest(params) {
  params = params || {};
  var getPostageLabelRequestPayload = {
    xml: {
      '@version': '1.0',
      '@encoding': 'utf-8',
      standalone: true
    },
    LabelRequest: {
      '@Test': (this.testMode) ? 'YES' : 'FALSE',
      '@LabelType': params.labelType || 'Default',
      '@LabelSubtype': params.labelSubtype || 'None',
      '@LabelSize': params.labelSize || '6x4',
      '@ImageFormat': params.format || 'PNG',
      RequesterID: this.requesterId,
      AccountID: parseInt(this.accountId),
      PassPhrase: this.passphrase,
      MailClass: params.mailClass || 'First',
      DateAdvance: 0,
      WeightOz: params.weight || 0,
      MailpieceShape: params.mailpieceShape || 'Parcel',
      Stealth: params.stealth || 'TRUE',
      Value: params.value || '0',
      PartnerCustomerID: '0',
      PartnerTransactionID: '0',
      ToName: [params.to.firstName, params.to.lastName].join(' '),
      ToAddress1: params.to.address,
      ToCity: params.to.city,
      ToCountryCode: params.to.country,
      ToState: params.to.region,
      ToPostalCode: params.to.zipCode,
      ToPhone: params.to.phoneNumber,
      FromCompany: params.from.name,
      FromPhone: params.from.phone,
      ReturnAddress1: params.from.address,
      FromCity: params.from.city,
      FromState: params.from.region,
      FromPostalCode: params.from.zipcode,
      ResponseOptions: {
        '@PostagePrice': '123'
      }
    }
  };
  var xml = xmlbuilder.create(getPostageLabelRequestPayload).end({pretty: true});
  return this.sendRequest(this.endpoint + '/GetPostageLabelXML?labelRequestXML=' + xml);
};

Endicia.prototype.recreditRequest = function recreditRequest(params) {
  params = params || {};
  var recreditRequestPayload = {
    xml: {
      '@version': '1.0',
      '@encoding': 'utf-8',
      standalone: true
    },
    RecreditRequest: {
      RequesterID: this.requesterId,
      RequestID: uuid.v4(),
      CertifiedIntermediary: {
        AccountID: parseInt(this.accountId),
        PassPhrase: this.passphrase,
        Token: this.token
      },
      RecreditAmount: params.recreditAmount
    }
  };
  var xml = xmlbuilder.create(recreditRequestPayload).end({pretty: true});
  return this.sendRequest(this.endpoint + '/BuyPostageXML?recreditRequestXML=' + xml);
};

Endicia.prototype.changePassPhraseRequest = function changePassphraseRequest(params) {
  params = params || {};
  var changePassPhrase = {
    xml: {
      '@version': '1.0',
      '@encoding': 'utf-8',
      standalone: true
    },
    RecreditRequest: {
      RequesterID: this.requesterId,
      RequestID: uuid.v4(),
      CertifiedIntermediary: {
        AccountID: parseInt(this.accountId),
        PassPhrase: this.passphrase,
        Token: this.token
      },
      newPassPhrase: params.newPassPhrase
    }
  };
};
