# Strapi-to-TypeScript


<span><a href="https://www.npmjs.com/package/strapi-to-typescript" title="View this project on NPM"><img src="https://img.shields.io/npm/v/strapi-to-typescript.svg" alt="NPM version" /></a></span>
<span><a href="https://www.npmjs.com/package/strapi-to-typescript" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/strapi-to-typescript.svg" alt="NPM download" /></a></span>
<span><a href="https://github.com/erikvullings/strapi-to-typescript/" title="View this project on Github"><img src="https://img.shields.io/github/contributors/erikvullings/strapi-to-typescript" alt="contributors" /></a></span>


Convert the Strapi models to TypeScript interfaces by processing each of the `./api/**/models/*.settings.json` recursively.

# Install and Run

```console
npm install -g strapi-to-typescript

sts path/to/strapi/api/ -o path/to/your/types/dir/

# see all doc
sts -h

# external conf. see: strapi-to-typescript/index.d.ts for format
sts -c .stsconfig.js
```

You may define multiple inputs. In case your API models have relations to other plugins like 'users-permissions'.

```sh
sts path/to/strapi/api/ path/to/strapi/plugins/users-permissions/models -o path/to/your/types/dir/
```

## Enumeration
You may generate **enumeration** or **string literal** with option **-e**

```sh
sts ./api ./extensions/users-permissions/models/ -e -g ./components/ -o path/to/your/types/dir/
```

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

# Advanced configuration

.stsconfig
```javascript

/**
 * @type {import('strapi-to-typescript')}
 */
const config = {
    input: [
      'api',
      './node_modules/strapi-plugin-users-permissions/models/',
      './node_modules/strapi-plugin-upload/models/',
      './extensions/users-permissions/models/'
    ],
    inputGroup: './components/',
    output: './sts/',
    enum: true,
    nested: false,
    type: (fieldType) => { if(fieldType == 'datetime') return 'string' },
    interfaceName: (name) => `X${name}`,
    enumName: (name, interfaceName) => `Enum${interfaceName}${name}`,
    excludeField: (interfaceName, fieldName) => fieldName === 'hide_field',
    addField: (interfaceName) => [{ name: "created_by", type: "string" }]
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

# Build

```sh
npm install && npm run build
# output files generated in dist folder
```

## Explanation

The input folder is recursively processed and each model file is read. When done, the expected output folder is generated, and finally, the Strapi models are converted to TypeScript.
