# Strapi-to-TypeScript


<span><a href="https://www.npmjs.com/package/strapi-to-typescript" title="View this project on NPM"><img src="https://img.shields.io/npm/v/strapi-to-typescript.svg" alt="NPM version" /></a></span>
<span><a href="https://www.npmjs.com/package/strapi-to-typescript" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/strapi-to-typescript.svg" alt="NPM download" /></a></span>
<span><a href="https://github.com/erikvullings/strapi-to-typescript/" title="View this project on Github"><img src="https://img.shields.io/github/contributors/erikvullings/strapi-to-typescript" alt="contributors" /></a></span>


Convert the Strapi models to TypeScript interfaces by processing each of the `./api/**/models/*.settings.json` recursively.

## Install and Run

```shell
npm install -g strapi-to-typescript

sts path/to/strapi/api/ -o path/to/your/types/dir/

# see all doc
sts -h

# external conf. see: strapi-to-typescript/index.d.ts for format
sts -c .stsconfig.js
```

## Command line option

`sts input -g inputGroup -o output ...`

### required
* **input**  
Strapi folder(s) with models *.settings.json
You may define multiple inputs. In case your API models have relations to other plugins like 'users-permissions'.
`sts path/to/strapi/api/ path/to/strapi/plugins/users-permissions/models -o path/to/your/types/dir/`

* **-g inputGroup**  
Strapi folder(s) with groups models

### optional
* **-o output**  
Output folder
* **-n nested**  
Put all interfaces in a nested tree instead of directly under the output folder
* **-u collectionCanBeUndefined**  
By default, all collection can not be undefined. You can turn this off, so only unrequired collections may be undefined.
* **-e Enumeration**  
You may generate **enumeration** or **string literal**
Example:
```typescript
// enumeration (with -e option) 
export interface IOrder {
    payment: IOrderPayment;
}
export enum IOrderPayment {
    card = "card",
    check = "check",
}
// OR string literal types (by default)
export interface IOrder {
    payment: "card" | "check";
}
```

* **-c Advanced configuration**  
path to configuration file

# Advanced configuration

.stsconfig
```javascript

/**
 * @type {import('strapi-to-typescript')}
 */
const config = {

    //required 
    input: [
      'api',
      './node_modules/strapi-plugin-users-permissions/models/',
      './node_modules/strapi-plugin-upload/models/',
      './extensions/users-permissions/models/'
    ],
    inputGroup: './components/',
    output: './sts/',

    // optional
    enum: true,
    nested: false,
    excludeField: (interfaceName, fieldName) => fieldName === 'hide_field',
    addField: (interfaceName) => [{ name: "created_by", type: "string" }],

    // optional, builtin function used if undefined return
    fieldType: (fieldType, fieldName, interfaceName) => { if(fieldType == 'datetime') return 'string' },
    fieldName: (fieldName) => fieldName.replace('_', ''),
    interfaceName: (name) => `X${name}`,
    enumName: (name, interfaceName) => `Enum${interfaceName}${name}`,

}
module.exports = config;
```

package.json
```json
{
  "//" : "...",

  "scripts": {
    "sts": "sts -c .stsconfig"
  },

  "///" : "..."
}
```

## Explanation

The input folder is recursively processed and each model file is read. When done, the expected output folder is generated, and finally, the Strapi models are converted to TypeScript.

## Build

```sh
npm install && npm run build
# output files generated in dist folder
```
