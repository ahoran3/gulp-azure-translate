### Gulp Azure Translate
Streaming Translation tool using Azure's Cognitive Services


## Installation

You know the drill...
```
$ npm i gulp-azure-translate
```

## Setup
To use this tool, you'll first need to create an instance of [Microsoft Azure's Cognitive Services](https://docs.microsoft.com/en-us/azure/cognitive-services/) in your Azure account.

This plugin calls the [v3 translate api](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-reference).

## Api
```js
translateAzure(config)
```
The config is an object consisting of:

- `apiKey` - _required_ - _string_ - the api key from your azure congnitive services instance
- `region` - _required_ - _string_ - the region from your azure congnitive services instance
- `toLangs` - _required_ - _string_ - array of locale codes to translate the source content to
- `fromLang` - _optional_ - _string[]_ - the locale code that will be used as the source language (default: determined)
- `slowMode` - _optional_ - _boolean_ - requests all translations in series. (default: false
- `showErrors` - _optional_ - _boolean_ - displays network errors when encountered. (default false)

_Note: `apiKey` and `region` are values from the Congnitive Services instance you create in your Azure account. Once created, Check the "Keys and Endpoint" tab to get these values._

A list of [supported languages can be found here](https://api.cognitive.microsofttranslator.com/languages?api-version=3.0).

## Example Gulp Usage

#### Gulpfile
```js
// gulpfile.js
const task = require('gulp');
const translateAzure = require('gulp-azure-translate');

task('translate', () => {
  return src(['src/en.json'])
    .pipe(translateAzure({
      apiKey: '00000000-00000000-00000000-00000000-0000000000',
      region: 'eastus',
      fromLang: 'en',
      toLangs: ['es', 'ja']
    }))
    .pipe(dest(`./src/translations`))
})
```

#### Source Language File
```js
// src/en.json
{
  "org": "Organization",
  "currOrg": "Current Organization",
  "account": "Account"
}
```

#### Language Ouptut File(s)
```js
// src/translations/es.json
{
  "org": "Organización",
  "currOrg": "Organización actual",
  "account": "Cuenta"
}
```

```js
// src/translations/ja.json
{
  "org": "組織",
  "currOrg": "現在の組織",
  "account": "アカウント"
}

```
