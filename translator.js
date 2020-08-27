const Promise = require('bluebird');
const axios = require('axios');

class AzureTranslator {
  // config values are:
  // - apiKey - required
  // - text - required
  // - toLang - required
  // - fromLang - optional
  // - baseUrl - optional
  // - slowMode - optional
  constructor(config) {
    this.config = config;
  }

  // translates the content string(s) to the given language
  translateItem(label, text, toLocale) {
    const requestBody = [{text}];
    return axios({
      method: 'POST',
      url: `https://api.cognitive.microsofttranslator.com/translate`,
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
      if (this.config.showErrors) {
        console.log(err.toJSON());
      }
      console.log(`[FAILURE]\t ${toLocale} translating: ${label.slice(0,10)}`);
      return {
        text: '',
        confidence: 0,
        failure: true
      };
    });
  }

  // translates the content string(s) to the given language
  translateFile(fileContents, toLocale) {
    console.log(`translating to ${toLocale}`);

    const fileContentKeys = Object.keys(fileContents);
    const requests = [];
    const fullFileContents = {
      contents: {},
      meta: {
        numItems: fileContentKeys.length,
        confidenceSum: 0,
        errors: 0
      }
    };

    return Promise[this.config.slow ? 'mapSeries' : 'map'](fileContentKeys, (itemLabel, itemIndex, numItems) => {
      // when not in slow mode, request in parallel-ish with tiny delay on each request
      // when in slow mode they will run in series, so no delay needed
      const sanityDelay = this.config.slow ? 0 : itemIndex * 20;
      return Promise.delay(sanityDelay, this.translateItem(itemLabel, fileContents[itemLabel], toLocale))
        .then(translated => {
          const percentComplete = `${(itemIndex/numItems*100).toFixed(2)}%`;
          console.log(`[ ${percentComplete} ]\t ${toLocale} translating: ${itemLabel.slice(0,10)} ${translated.confidence < .5 ? '(low confidence)' : ''}`);
          fullFileContents.contents[itemLabel] = translated.text;
          fullFileContents.meta.confidenceSum += translated.confidence;
          if (translated.failure) {
            fullFileContents.meta.errors++;
          }
          return fullFileContents;
        });
    })
    .then(() => {
      const percentConfidence = `${(fullFileContents.meta.confidenceSum/fullFileContents.meta.numItems*100).toFixed(5)}%`;
      console.log(`[  100%  ] Finished translating ${toLocale} file with ${percentConfidence} confidence and ${fullFileContents.meta.errors} errors.`);
      return fullFileContents.contents;
    })
    .catch(err => {
      console.log(err);
      return err;
    });



    // return Promise.all(translatedFileContents, itemLabel, itemIndex, numItems) => {
    //   const percentComplete = `${(itemIndex/numItems*100).toFixed(2)}%`;
    //   // return this.translateItem(itemLabel, fileContents[itemLabel], toLocale).then(translated => {
    //   //   console.log(`[ ${percentComplete} ]\t ${toLocale} translating: ${itemLabel.slice(0,10)} ${translated.confidence < .5 ? '(low confidence)' : ''}`);
    //   //   translatedFileContents.contents[itemLabel] = translated.text;
    //   //   translatedFileContents.meta.confidenceSum += translated.confidence;
    //   //   return translatedFileContents;
    //   //
    //   // });
    // })
    // .then(fullFile => {
    //   const percentConfidence = `${(fullFile.meta.confidenceSum/fullFile.meta.numItems*100).toFixed(5)}%`;
    //   console.log(`Finished translating ${toLocale} file with ${percentConfidence} confidence.`);
    //   return fullFile.contents;
    // })
    // .catch(err => {
    //   console.log(err);
    //   return err;
    // });
  }

}

module.exports = AzureTranslator;
