'use strict';

var Promise = require('bluebird');
var assert = require('assert');
var assign = require('object-assign');
var request = require('request');
var xmlbuilder = require('xmlbuilder');
var xmlparser = require('xml2js').parseString;

var prototype = {
  sendRequest: function sendRequest(target) {
    var requestPromisified = Promise.promisify(request);
    var xmlparserPromisified = Promise.promisify(xmlparser);
    return requestPromisified(target)
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
  shipOrder: function shipOrder(pakkage, shipping, options) {
    options = options || {};
    var shipOrderPayload = {
      xml: {
        '@version': '1.0',
        '@encoding': 'utf-8',
        standalone: true
      },
      LabelRequest: {
        '@Test': (this.testMode) ? 'YES' : 'FALSE',
        '@LabelType': options.labelType || 'Default',
        '@LabelSubtype': options.labelSubtype || 'None',
        '@LabelSize': options.labelSize || '6x4',
        '@ImageFormat': options.format || 'PNG',
        RequesterID: this.requesterId,
        AccountID: parseInt(this.accountId),
        PassPhrase: this.passphrase,
        MailClass: options.mailClass || 'First',
        DateAdvance: 0,
        WeightOz: options.weight || 0,
        MailpieceShape: options.mailpieceShape || 'Parcel',
        Stealth: options.stealth || 'TRUE',
        Value: options.value || '0',
        PartnerCustomerID: '0',
        PartnerTransactionID: '0',
        ToName: [shipping.firstName, shipping.lastName].join(' '),
        ToAddress1: shipping.address1,
        ToCity: shipping.city,
        ToCountryCode: shipping.country,
        ToState: shipping.region,
        ToPostalCode: shipping.zipCode,
        ToPhone: shipping.phoneNumber,
        FromCompany: options.from.name,
        FromPhone: options.from.phone,
        ReturnAddress1: options.from.addresses[0].address,
        FromCity: options.from.addresses[0].city,
        FromState: options.from.addresses[0].region,
        FromPostalCode: options.from.addresses[0].zipcode,
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
