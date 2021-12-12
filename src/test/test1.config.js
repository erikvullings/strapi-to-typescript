/**
 * @type {import('../../index').IConfigOptions}
 */
const config = {
    input: [
        'src/test/api/',
        'src/test/strapi/',
        '!src/test/strapi/strapi-plugin-users-permissions'
    ],
    components: 'src/test/components/content/',
    output: 'src/test/out1/',
    enum: true,
    nested: false,
    fieldType: (fieldType) => { if(fieldType === 'datetime') return 'string'},
    // fieldName: (fieldName) => fieldName.replace('_', '-'),
    // interfaceName: name => `X${name}`,
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
