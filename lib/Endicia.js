'use strict';

var Promise = require('bluebird');
var assert = require('assert');
var assign = require('object-assign');
var request = require('request');
var xmlbuilder = require('xmlbuilder');
var xmlparser = require('xml2js').parseString;

var prototype = {
  sendRequest: function sendRequest(endpoint) {
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
  },
  getPostageLabelRequest: function getPostageLabelRequest(params) {
    params = params || {};
    var shipOrderPayload = {
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
    var xml = xmlbuilder.create(shipOrderPayload).end({pretty: true});
    return this.sendRequest(this.endpoint + '/GetPostageLabelXML?labelRequestXML=' + xml);
  }
};

module.exports = function factory(options) {
  var instance = Object.create(prototype);
  instance.endpoint = (options.testMode && options.testMode === true)
    ? 'https://elstestserver.endicia.com/LabelService/EwsLabelService.asmx'
    : 'https://www.endicia.com/ELS/ELSServices.cfc?wsd';
  assert(options.requesterId, "Requester ID is mandatory");
  assert(options.accountId, "Account ID is mandatory");
  assert(options.passphrase, "Passphrase is mandatory");
  assign(instance, options);
  return instance;
};
