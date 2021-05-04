/**
 * @type {import('../../index').IConfigOptions}
 */
const config = {
    input: [
        'src/test/api/',
        'src/test/strapi/',
        
    ],
    components: 'src/test/components/content/',
    output: 'src/test/out2/',
    enum: true,
    nested: true,
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
