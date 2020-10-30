/**
 * @type {import('../../index').IConfigOptions}
 */
const config = {
    input: [
        'src/test/api/',
        'src/test/strapi/'
    ],
    output: 'src/test/out/',
    enum: true,
    type: (fieldType) => { if(fieldType == 'datetime') return 'string'},
    interfaceName(name){
        return `X${name}`
    },
    enumName(name, interfaceName){
        return `Enum${interfaceName}${name}`
    },
    excludeField: (interfaceName, fieldName) => fieldName === 'email_field',
    addField: (interfaceName) => {
        if(interfaceName === 'Xtestobject') return [
            {
                name: "created_by",
                type: "string"
            }
        ]
    }
}
module.exports = config;