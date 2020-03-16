import * as fs from 'fs';
import * as path from 'path';
import { IStrapiModel, IStrapiModelAttribute } from './models/strapi-model';

interface IStructure {
  name: string;
  folder: string;
  snakeName: string;
  m: IStrapiModel;
  nested: boolean;
}

/**
 * Convert a camelCase name to a TypeScript interface name, e.g.
 * camelCase => ICamelCase.
 *
 * @param name camelCase name
 */
const toInterfaceName = (name: string) => name ? `I${name.replace(/^./, (str: string) => str.toUpperCase())}` : 'any';

/**
 * Convert a name to a Pascal case name
 * pascalCase => PascalCase.
 *
 * @param name name
 */
const toPascalCase = (name: string) => name ? `${name.replace(/^./, (str: string) => str.toUpperCase())}` : 'any';


/**
 * Convert name to snake name, e.g. camelCase => camel-case
 *
 * @param name input name
 */
export const toSnakeName = (name: string) =>
  name
    .split(/(?=[A-Z])/)
    .join('-')
    .toLowerCase();

/**
 * Convert a Strapi type to a TypeScript type.
 *
 * @param interfaceName name of current interface
 * @param fieldName name of the field
 * @param model Strapi type
 * @param enumm Use Enum type (or string literal types)
 */
const toPropertyType = (interfaceName: string, fieldName: string, model: IStrapiModelAttribute, enumm: boolean) => {
  const pt = model.type ? model.type.toLowerCase() : "any";
  switch (pt) {
    case 'text':
    case 'email':
    case 'password':
      return 'string';
    case 'enumeration':
      if(enumm){
        return model.enum ? `${interfaceName}${toPascalCase(fieldName)}` : "string";
      } else {
        return model.enum ? `"${model.enum.join(`" | "`)}"` : "string";
      }
    case 'date':
      return 'Date';
    case 'media':
      return 'Blob';
    case 'json':
      return '{ [key: string]: any }';
    case 'decimal':
    case 'float':
    case 'biginteger':
    case 'integer':
        return 'number';
    case 'string':
    case 'number':
    case 'boolean':
    default:
      return pt;
  }
};

/**
 * Transform a Strapi Attribute of group.
 *
 * @param attr IStrapiModelAttribute
 */
const componentCompatible = (attr: IStrapiModelAttribute) => {
  return (attr.type === 'component')
    ? attr.repeatable ? { collection: attr.component!.split('.')[1] } : { model: attr.component!.split('.')[1] }
    : attr;
}
/**
 * Convert a Strapi Attribute to a TypeScript property.
 *
 * @param interfaceName name of current interface
 * @param name Name of the property
 * @param a Attributes of the property
 * @param structure Overall output structure
 * @param enumm Use Enum type (or string literal types)
 */
const strapiModelAttributeToProperty = (
  interfaceName: string,
  name: string,
  a: IStrapiModelAttribute,
  structure: Array<{
    name: string;
    folder: string;
    snakeName: string;
    m: IStrapiModel;
  }>,
  enumm: boolean
) => {
  const findModelName = (n: string) => {
    const result = structure.filter((s) => s.name.toLowerCase() === n).shift();
    return result ? result.name : '';
  };
  const required = !a.required && !(a.collection || a.repeatable)  ? '?' : '';
  a = componentCompatible(a);
  const collection = a.collection ? '[]' : '';

  const propType = a.collection
    ? toInterfaceName(findModelName(a.collection))
    : a.model
      ? a.model === 'file'
        ? 'Blob'
        : toInterfaceName(findModelName(a.model))
      : a.type
        ? toPropertyType(interfaceName, name, a, enumm)
        : 'unknown';
  return `${name}${required}: ${propType}${collection};`;
};

/**
 * Convert all Strapi Enum to TypeScript Enumeration.
 *
 * @param interfaceName name of current interface
 * @param a Attributes
 */
const strapiModelAttributeToEnum = (interfaceName: string, attributes: { [attr: string]: IStrapiModelAttribute }): string[] => {
  const enums: string[] = []
  for (const aName in attributes) {
    if (!attributes.hasOwnProperty(aName)) {
      continue;
    }
    if(attributes[aName].type === 'enumeration'){
      enums.push(`export enum ${interfaceName}${toPascalCase(aName)} {`);
      attributes[aName].enum!.forEach( e => {
        enums.push(`  ${e} = "${e}",`); 
      })
      enums.push(`}\n`);
    }
  }

  return enums
}

/**
 * Find all required models and import them.
 *
 * @param m Strapi model to examine
 * @param structure Overall output structure
 */
const strapiModelExtractImports = (m: IStrapiModel, structure: IStructure[]) => {
  const isUnique = <T>(value: T, index: number, arr: T[]) => arr.indexOf(value) === index;
  const toImportDefinition = (name: string) => {
    const found = structure.filter((s) => s.name.toLowerCase() === name).shift();
    const toFolder = (f: IStructure) => (f.nested ? `../${f.snakeName}/${f.snakeName}` : `./${f.snakeName}`);
    return found ? `import { ${toInterfaceName(found.name)} } from '${toFolder(found)}';` : '';
  };

  const imports: string[] = [];
  if (m.attributes) {
    for (const aName in m.attributes) {
      if (!m.attributes.hasOwnProperty(aName)) {
        continue;
      }
      const a = componentCompatible(m.attributes[aName]);

      const proposedImport = a.collection
        ? toImportDefinition(a.collection)
        : a.model && a.model !== 'file'
          ? toImportDefinition(a.model)
          : '';
      if (proposedImport) {
        imports.push(proposedImport);
      }
    }
  }
  if (imports.length === 0) {
    return '';
  }
  return imports
    .filter(isUnique)
    .sort()
    .join('\n');
};

const strapiModelToInterface = (m: IStrapiModel, structure: IStructure[], enumm: boolean) => {
  const name = m.info.name;
  const interfaceName = toInterfaceName(name);
  const result: string[] = [];
  const imports = strapiModelExtractImports(m, structure);
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
      result.push(`  ${strapiModelAttributeToProperty(interfaceName, aName, m.attributes[aName], structure, enumm)}`);
    }
  }
  result.push('}\n');
  return enumm ? result.concat(strapiModelAttributeToEnum(interfaceName, m.attributes)).join('\n') : result.join('\n');
};

const writeIndex = (folder: string, structure: IStructure[]) => {
  const outputFile = path.resolve(folder, 'index.ts');
  const output = structure
    .map((s) => (s.nested ? `export * from './${s.snakeName}/${s.snakeName}';` : `export * from './${s.snakeName}';`))
    .join('\n');
  fs.writeFileSync(outputFile, output + '\n');
};

/**
 * Export a StrapiModel to a TypeScript interface
 */
export const convert = (outputFolder: string, strapiModels: IStrapiModel[], nested = false, enumm = false) =>
  new Promise<number>((resolve, reject) => {
    let count = strapiModels.length;
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }
    const structure = strapiModels.map((m) => {
      const name = m.info.name;
      const snakeName = toSnakeName(name);
      const folder = nested ? path.resolve(outputFolder, snakeName) : outputFolder;
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      return { name, folder, snakeName, m, nested };
    });
    writeIndex(outputFolder, structure);
    structure.forEach((g) => {
      const { folder, snakeName, m } = g;
      const outputFile = path.resolve(folder, `${snakeName}.ts`);
      fs.writeFile(outputFile, strapiModelToInterface(m, structure, enumm), { encoding: 'utf8' }, (err) => {
        count--;
        if (err) {
          reject(err);
        }
        if (count === 0) {
          resolve(strapiModels.length);
        }
      });
    });
  });
