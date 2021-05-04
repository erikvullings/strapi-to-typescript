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

`sts input -g components -o output ...`

### required
* **input**  
Strapi folder(s)/file(s) with models *.settings.json  
You may define multiple inputs. In case your API models have relations to other plugins like 'users-permissions'.
`sts path/to/strapi/api/ path/to/strapi/plugins/users-permissions/models -o path/to/your/types/dir/`  
Order matters, if you have two models with the same name, the last one is used.

* **-g components **  
Strapi folder(s) with components models

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
    components: './components/',
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
    importAsType: (interfaceName) => interfaceName === 'MyInterfaceThatWantsToImportAsTypes' /* or just true */,
    outputFileName: (interfaceName, filename) => interfaceName;
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

## Issue

If you want to create an issue. First of all, be nice. Take the time to explain and format your post.

The better solution to explain your issue (and for me, to fix it) is to create a pull request with your data:

1. fork this repo with the button "fork" on github website. wait a minute.
1. git clone your master branch from the newly created repository.
1. `yarn install` or `npm install`
1. add your api in `src/test/api` `src/test/components` (if necessary)
1. add your test:
  1. `src/test/test<issue id>.config.js` copy an other test and modify `output` conf
  1. `src/test/test<issue id>.assert.ts` copy another assert and modify the import accordingly to your conf `output`
1. run your test with `./node_modules/.bin/ts-node src/test.ts test<issue id>` or run all test `yarn test`
1. create pull request on this repo

## Explanation

The input folder is recursively processed and each model file is read. When done, the expected output folder is generated, and finally, the Strapi models are converted to TypeScript.

## Build

```sh
npm install && npm run build
# output files generated in dist folder
```


console warn deprecated
template handlebrake/...