# Strapi-to-TypeScript

Convert the Strapi models to TypeScript interfaces by processing each of the `./api/**/models/*.settings.json` recursively.

# Install and Run

```console
npm install -g strapi-to-typescript
sts path/to/strapi/api/ -o path/to/your/types/dir/
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
```js
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

# Build

```sh
npm i
npm run build
```

## Explanation

The input folder is recursively processed and each model file is read. When done, the expected output folder is generated, and finally, the Strapi models are converted to TypeScript.
