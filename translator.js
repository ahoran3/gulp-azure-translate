const Promise = require('bluebird');
const axios = require('axios');

class AzureTranslator {
  // config values are:
  // - apiKey - required
  // - text - required
  // - toLang - required
  // - fromLang - optional
  // - endpoint - optional
  constructor(config) {
    this.config = config;
  }

  // translates the content string(s) to the given language
  translateItem(itemLabel, text, toLocale) {
    const requestBody = [{text}];
    return axios({
      method: 'POST',
      url: `${this.config.endpoint || 'https://api.cognitive.microsofttranslator.com'}/translate`,
      params: {
        'api-version': '3.0',
        'to': toLocale
      },
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
        'Ocp-Apim-Subscription-Region': this.config.region,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: requestBody
    }).then(response => {
      return {
        text: response.data[0].translations[0].text,
        confidence: response.data[0].detectedLanguage.score
      };
    }, (err) => {
      console.log(err.toJSON());
      return err;
    });
  }

  // translates the content string(s) to the given language
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
      const percentConfidence = `${(fullFile.meta.confidenceSum/fullFile.meta.numItems*100).toFixed(5)}%`;
      console.log(`Finished translating ${toLocale} file with ${percentConfidence} confidence.`);
      return fullFile.contents;
    })
    .catch(err => {
      console.log(err);
      return err;
    });
  }

}

module.exports = AzureTranslator;
