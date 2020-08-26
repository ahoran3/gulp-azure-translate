### Gulp Azure Translate
Streaming Translation tool using Azure's Cognitive Services


## Installation

You know the drill...
```
$ npm i gulp-azure-translate
```

## Api
```js
translateAzure(config)
```
The config consist of:

- `apiKey` - _required_ - the api key from your azure congnitive services instance
- `endpoint` - _required_ - the endpoint from azure congnitive services
- `region` - _required_ - the region from your azure congnitive services instance
- `toLangs` - _required_ - array of locale codes to translate the source content to
- `fromLang` - _optional_ - the locale code that will be used as the source language


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
      endpoint: 'https://api.cognitive.microsofttranslator.com/',
      region: 'canadacentral',
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
