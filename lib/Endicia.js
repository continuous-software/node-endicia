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
    });
};

Endicia.prototype.getPostageLabel = function getPostageLabel(params) {
  params = params || {};
  params.to = params.to || {};
  params.from = params.from || {};
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
      '@ImageFormat': params.imageFormat || 'PNG',
      '@ImageResolution': params.imageResolution || '300',
      '@ImageRotation': params.imageRotation || 'None',
      '@LabelTemplate': params.labelTemplate || '',
      RequesterID: this.REQUESTER_ID,
      AccountID: parseInt(this.ACCOUNT_ID),
      PassPhrase: this.PASSPHRASE,
      // Token: '',
      MailClass: params.mailClass || 'First',
      DateAdvance: params.dateAdvance,
      WeightOz: params.weightOz,
      MailpieceShape: params.mailpieceShape || 'Parcel',
      MailpieceDimensions: params.mailpieceDimensions || {},
      packageTypeIndicator: params.packageTypeIndicator || 'Null',
      // Pricing: params.pricing,
      Machinable: params.machinable || 'TRUE',
      POZipCode: params.poZipCode,
      IncludePostage: params.includePostage || 'TRUE',
      PrintConsolidatorLabel: params.printConsolidatorLabel || 'FALSE',
      ReplyPostage: params.replyPostage || 'FALSE',
      PrintScanBasedPaymentLabel: params.PrintScanBasedPaymentLabel || 'FALSE',
      ShowReturnAddress: params.showReturnAddress || 'TRUE',
      Stealth: params.stealth || 'TRUE',
      ValidateAddress: params.validateAddress || 'TRUE',
      // SpecialContents: params.specialContents,
      LiveAnimalSurcharge: params.liveAnimalSurcharge || 'FALSE',
      // To be continued ...
      Value: params.value || '0',
      PartnerCustomerID: '0',
      PartnerTransactionID: '0',
      ToName: [params.to.firstName, params.to.lastName].join(' '),
      ToAddress1: params.to.address1,
      ToCity: params.to.city,
      ToCountryCode: params.to.country,
      ToState: params.to.state,
      ToPostalCode: params.to.postalCode,
      ToPhone: params.to.phoneNumber,
      FromCompany: params.from.company,
      FromPhone: params.from.phone,
      ReturnAddress1: params.from.returnAddress1,
      FromCity: params.from.city,
      FromState: params.from.state,
      FromPostalCode: params.from.postalCode
    }
  };
  var xml = xmlbuilder.create(getPostageLabelRequestPayload).end({pretty: true});
  return this.sendRequest(this.endpoint + '/GetPostageLabelXML?labelRequestXML=' + xml);
};

Endicia.prototype.buyPostage = function buyPostage(params) {
  params = params || {};
  var buyPostageRequestPayload = {
    xml: {
      '@version': '1.0',
      '@encoding': 'utf-8',
      standalone: true
    },
    RecreditRequest: {
      RequesterID: this.REQUESTER_ID,
      RequestID: uuid.v4(),
      CertifiedIntermediary: {
        AccountID: parseInt(this.ACCOUNT_ID),
        PassPhrase: this.PASSPHRASE,
        Token: this.token
      },
      RecreditAmount: params.recreditAmount
    }
  };
  var xml = xmlbuilder.create(buyPostageRequestPayload).end({pretty: true});
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
      RequesterID: this.REQUESTER_ID,
      RequestID: uuid.v4(),
      CertifiedIntermediary: {
        AccountID: parseInt(this.ACCOUNT_ID),
        PassPhrase: this.PASSPHRASE,
        Token: this.token
      },
      newPassPhrase: params.newPassPhrase
    }
  };
};
