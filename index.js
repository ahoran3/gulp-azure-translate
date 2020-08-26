
const PluginError = require('plugin-error');
const through = require('through2');
const jsonic = require('jsonic');
const gutil = require('gulp-util');
const Promise = require('bluebird');
const AzureTranslator = require('./translator');

var PLUGIN_NAME = 'gulp-azure-translate';

module.exports = function(options) {
    const translator = new AzureTranslator(options);

    return through.obj(function(file, encoding, callback) {
        if (file.isNull()) {
            // nothing to do
            return callback(null, file);
        }

        if (file.isStream()) {
            // file.contents is a Stream - https://nodejs.org/api/stream.html
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
            return callback(null, file);

        } else if (file.isBuffer()) {
            // file.contents is a Buffer - https://nodejs.org/api/buffer.html
            // this.emit('error', NEW PluginError(PLUGIN_NAME, 'Buffers not supported!'));
            const inputJsonContents = jsonic(file.contents.toString());
            return Promise.map(options.toLangs, currLanguage => {
              return translator.translateFile(inputJsonContents, currLanguage).then(outputFileContents => {
                var newFileContent = JSON.stringify(outputFileContents, null, '\t');
                this.push(new gutil.File({
                    cwd: "./",
                    path: currLanguage + ".json",
                    contents: new Buffer.from(newFileContent)
                }));
                return;
              })
            }).then(() => {
              return callback(null, file);
            });
        }
    });
};
