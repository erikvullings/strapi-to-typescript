const { interfaceName } = require('./test1.config');

/**
 * @type {import('../../index').IConfigOptions}
 */
const config = {
    input: [
        'src/test/api/',
        'src/test/strapi/'
    ],
    inputGroup: 'src/test/components/content/',
    output: 'src/test/out3/',
    enum: true,
    fieldType: (fieldType) => { if(fieldType === 'datetime') return 'string'},
    // fieldName: (fieldName) => fieldName.replace('_', '-'),
    interfaceName: name => `X${name}`.replace(/ /g, ''),
    outputFileName: (interfaceName, filename) => filename.indexOf('test/components/content/') !== -1 ? `content/${interfaceName}` : interfaceName,
    enumName: (name, interfaceName) =>`Enum${interfaceName}${name}`,
    excludeField: (interfaceName, fieldName) => fieldName === 'email_field',
    addField: (interfaceName) => {
        if(interfaceName === 'Xtestobject') return [
            {
                name: "created_by",
                type: "string"
            }
        ]
    },
    importAsType: (interfaceName) => interfaceName !== 'Xuser'
}
module.exports = config;
