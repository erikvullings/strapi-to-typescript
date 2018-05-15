import * as fs from 'fs';
import * as path from 'path';
import {
  IStrapiModel,
  StrapiType,
  IStrapiModelAttribute,
} from './models/strapi-model';

/**
 * Convert a camelCase name to a TypeScript interface name, e.g.
 * camelCase => ICamelCase.
 *
 * @param name camelCase name
 */
const toInterfaceName = (name: string) =>
  `I${name.replace(/^./, (str: string) => str.toUpperCase())}`;

/**
 * Convert a Strapi type to a TypeScript type.
 *
 * @param propType Strapi type
 */
const toPropertyType = (propType: StrapiType) =>
  propType === 'text' || propType === 'email'
    ? 'string'
    : propType === 'date'
      ? 'Date'
      : propType;

/**
 * Convert a Strapi Attribute to a TypeScript property.
 *
 * @param name Name of the property
 * @param a Attributes of the property
 */
const strapiModelAttributeToProperty = (
  name: string,
  a: IStrapiModelAttribute
) => {
  const required = a.required ? '' : '?';
  const collection = a.collection ? '[]' : '';
  const propType = a.collection
    ? toInterfaceName(a.collection)
    : a.model
      ? a.model === 'file'
        ? 'Blob'
        : toInterfaceName(a.model)
      : a.type
        ? toPropertyType(a.type)
        : 'unknown';
  return `${name}${required}: ${propType}${collection};`;
};

const strapiModelExtractImports = (m: IStrapiModel) => {
  const onlyUnique = <T>(value: T, index: number, self: T[]) =>
    self.indexOf(value) === index;

  const imports: string[] = [];
  if (m.attributes) {
    for (const aName in m.attributes) {
      if (!m.attributes.hasOwnProperty(aName)) {
        continue;
      }
      const a = m.attributes[aName];
      if (a.collection) {
        imports.push(a.collection);
      }
      if (a.model && a.model !== 'file') {
        imports.push(a.model);
      }
    }
  }
  if (imports.length === 0) {
    return '';
  }
  return imports
    .filter(onlyUnique)
    .sort()
    .map((i) => `import ${toInterfaceName(i)} from '../${i}/${i}';`)
    .join('\n');
};

const strapiModelToInterface = (m: IStrapiModel) => {
  const name = m.info.name;
  const interfaceName = toInterfaceName(name);
  const result: string[] = [];
  const imports = strapiModelExtractImports(m);
  if (imports) {
    result.push(imports + '\n');
  }
  result.push('/**');
  result.push(` * Model definition for ${name}`);
  result.push(' */');
  result.push(`export interface ${interfaceName} {`);
  result.push('  id: string;');
  if (m.attributes) {
    for (const aName in m.attributes) {
      if (!m.attributes.hasOwnProperty(aName)) {
        continue;
      }
      result.push(
        `  ${strapiModelAttributeToProperty(aName, m.attributes[aName])}`
      );
    }
  }
  result.push('}\n');
  return result.join('\n');
};

/**
 * Export a StrapiModel to a TypeScript interface
 */
export const convert = (outputFolder: string, strapiModels: IStrapiModel[]) =>
  new Promise<number>((resolve, reject) => {
    let count = strapiModels.length;
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }
    strapiModels.forEach((m) => {
      const name = m.info.name;
      const snakeName = name
        .split(/(?=[A-Z])/)
        .join('-')
        .toLowerCase();
      const folder = path.resolve(outputFolder, name);
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      const outputFile = path.resolve(folder, `${snakeName}.ts`);
      fs.writeFile(
        outputFile,
        strapiModelToInterface(m),
        { encoding: 'utf8' },
        (err) => {
          count--;
          if (err) {
            reject(err);
          }
          if (count === 0) {
            resolve(strapiModels.length);
          }
        }
      );
    });
  });
