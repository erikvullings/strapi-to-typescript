const { interfaceName } = require('./test1.config');
const path = require('path');
/**
 * @type {import('../../index').IConfigOptions}
 */
const config = {
    input: [
        'src/test/api/',
        'src/test/strapi/strapi-plugin-upload/models/File.settings.json',
        'src/test/strapi/strapi-plugin-users-permissions/models/User.settings.json'
    ],
    inputGroup: 'src/test/components/content/',
    output: 'src/test/out3/',
    enum: true,
    fieldType: (fieldType) => { if (fieldType === 'datetime') return 'string' },
    // fieldName: (fieldName) => fieldName.replace('_', '-'),
    interfaceName: name => `X${name}`.replace(/ /g, ''),
    outputFileName: (interfaceName, filename) => filename.indexOf(`test${path.sep}components${path.sep}content${path.sep}`) !== -1 ? `content${path.sep}${interfaceName}` : interfaceName,
    enumName: (name, interfaceName) => `Enum${interfaceName}${name}`,
    excludeField: (interfaceName, fieldName) => fieldName === 'email_field',
    addField: (interfaceName) => {
        if (interfaceName === 'Xtestobject') return [{
            name: "created_by",
            type: "string"
        }]
    },
    importAsType: (interfaceName) => interfaceName !== 'Xuser'
}
module.exports = config;