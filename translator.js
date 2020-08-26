const Promise = require('bluebird');
const axios = require('axios');
class AzureTranslator {
  // options are:
  // - apiKey - required
  // - text - require
  // - toLang - required
  // - fromLang - optional
  // - resourceUrl - optional
  constructor(options) {
    this.config = options;
    // this.t = require('azure-translate')(options.apiKey);
    console.log('setting up azure translate');
  }

  // translates the content string(s) to the given language
  // content - strings to translate
  // langTo - desired translation locale code
  translateItem(itemLabel, text, toLocale) {
    const requestBody = [{text}];
    return axios({
      method: 'POST',
      url: this.config.resourceUrl || 'https://api.cognitive.microsofttranslator.com/translate',
      params: {
        'api-version': '3.0',
        'to': toLocale
      },
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
        'Ocp-Apim-Subscription-Region': this.config.region,
        'Content-Type': 'application/json'
      },
      data: [
        {
          text
        }
      ]
    }).then(response => {
      return {
        text: response.data[0].translations[0].text,
        confidence: response.data[0].detectedLanguage.score
      };
    });
  }

  // translates the content string(s) to the given language
  // content - strings to translate
  translateFile(fileContents, toLocale) {
    console.log(`attempting to translate to ${toLocale}`);
    const fileContentKeys = Object.keys(fileContents);
    return Promise.reduce(fileContentKeys, (translatedFileContents, itemName, itemIndex, numItems) => {
      const percentComplete = `${(itemIndex/numItems*100).toFixed(2)}%`;
      return this.translateItem(itemName, fileContents[itemName], toLocale).then(translated => {
        console.log(`[ ${percentComplete} ]\t ${toLocale} translating: ${itemName.slice(0,10)} ${translated.confidence < .5 ? '(low confidence)' : ''}`);
        translatedFileContents.contents[itemName] = translated.text;
        translatedFileContents.meta.confidenceSum += translated.confidence;
        return translatedFileContents;

      });
    }, {
      contents: {},
      meta: {
        numItems: fileContentKeys.length,
        confidenceSum: 0
      }
    })
    .then(fullFile => {
      const percentConfidence = `${(fullFile.meta.confidenceSum/fullFile.meta.numItems*100).toFixed(5))}%`;
      console.log(`Finished translating ${toLocale} file with ${percentConfidence} confidence.`);
      return fullFile.contents;
    })
    .catch(console.log);
  }

}

module.exports = AzureTranslator;
