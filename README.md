### Gulp Azure Translate
Streaming Translations tool using Azure Congnitive Services

## Api
```js
translateAzure(config)
```
The config must consist of:
`apiKey` - the api key from your azure congnitive services instance
`endpoint` - the endpoint from azure congnitive services
`region` - the region from your azure congnitive services instance
`fromLang` - the locale code that will be used as the source language
`toLangs` - array of locale codes to translate the source content to


## Example Gulp Usage

#### Gulpfile
```js
// gulpfile.js
import { task } from 'gulp';
import { translateAzure } from 'gulp-azure-translate'

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
