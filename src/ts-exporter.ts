import * as fs from 'fs';
import * as path from 'path';
import { IStrapiModel, IStrapiModelAttribute } from './models/strapi-model';
import { IConfigOptions } from '..';

interface IStrapiModelExtended extends IStrapiModel {
  // use to output filename
  ouputFile: string;
  // interface name
  interfaceName: string;
  // model name extract from *.settings.json filename. Use to link model.
  modelName: string;
}

const util = {

  // InterfaceName
  defaultToInterfaceName: (name: string) => name ? `I${name.replace(/^./, (str: string) => str.toUpperCase()).replace(/[ ]+./g, (str: string) => str.trimLeft().toUpperCase()).replace(/\//g, '')}` : 'any',
  overrideToInterfaceName: undefined as IConfigOptions['interfaceName'] | undefined,
  toInterfaceName(name: string, filename: string) {
    return util.overrideToInterfaceName ? util.overrideToInterfaceName(name, filename) || util.defaultToInterfaceName(name) : this.defaultToInterfaceName(name);
  },

  // EnumName
  defaultToEnumName: (name: string, interfaceName: string) => name ? `${interfaceName}${name.replace(/^./, (str: string) => str.toUpperCase())}` : 'any',
  overrideToEnumName: undefined as IConfigOptions['enumName'] | undefined,
  toEnumName(name: string, interfaceName: string) {
    return this.overrideToEnumName ? this.overrideToEnumName(name, interfaceName) || this.defaultToEnumName(name, interfaceName) : this.defaultToEnumName(name, interfaceName);
  },

  // OutputFileName
  defaultOutputFileName: (modelName: string, isComponent?: boolean, configNested?: boolean) => isComponent ?
    modelName.replace('.', path.sep) :
    configNested ? modelName.toLowerCase() + path.sep + modelName.toLowerCase() : modelName.toLowerCase(),
  overrideOutputFileName: undefined as IConfigOptions['outputFileName'] | undefined,
  toOutputFileName(modelName: string, isComponent: boolean | undefined, configNested: boolean | undefined, interfaceName: string, filename: string) {
    return this.overrideOutputFileName ? this.overrideOutputFileName(interfaceName, filename) || this.defaultOutputFileName(modelName, isComponent, configNested) : this.defaultOutputFileName(modelName, isComponent, configNested);
  },

  /**
   * Convert a Strapi type to a TypeScript type.
   *
   * @param interfaceName name of current interface
   * @param fieldName name of the field
   * @param model Strapi type
   * @param enumm Use Enum type (or string literal types)
   */
  defaultToPropertyType: (interfaceName: string, fieldName: string, model: IStrapiModelAttribute, enumm: boolean) => {
    const pt = model.type ? model.type.toLowerCase() : 'any';
    switch (pt) {
      case 'text':
      case 'richtext':
      case 'email':
      case 'password':
      case 'uid':
      case 'time':
        return 'string';
      case 'enumeration':
        if (enumm) {
          return model.enum ? util.toEnumName(fieldName, interfaceName) : 'string';
        } else {
          return model.enum ? `"${model.enum.join(`" | "`)}"` : 'string';
        }
      case 'date':
      case 'datetime':
      case 'timestamp':
        return 'Date';
      case 'media':
        return 'Blob';
      case 'json':
        return '{ [key: string]: any }';
      case 'dynamiczone':
        return 'any[]'
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
  },
  overrideToPropertyType: undefined as IConfigOptions['fieldType'] | undefined,
  toPropertyType(interfaceName: string, fieldName: string, model: IStrapiModelAttribute, enumm: boolean) {
    return this.overrideToPropertyType ? this.overrideToPropertyType(`${model.type}`, fieldName, interfaceName) || this.defaultToPropertyType(interfaceName, fieldName, model, enumm) : this.defaultToPropertyType(interfaceName, fieldName, model, enumm);
  },

  // PropertyName
  defaultToPropertyName: (fieldName: string) => fieldName,
  overrideToPropertyName: undefined as IConfigOptions['fieldName'] | undefined,
  toPropertyName(fieldName: string, interfaceName: string) {
    return this.overrideToPropertyName ? this.overrideToPropertyName(fieldName, interfaceName) || this.defaultToPropertyName(fieldName) : this.defaultToPropertyName(fieldName);
  },


  excludeField: undefined as IConfigOptions['excludeField'] | undefined,

  addField: undefined as IConfigOptions['addField'] | undefined,
}

const findModel = (structure: IStrapiModelExtended[], name: string): IStrapiModelExtended | undefined => {
  return structure.filter((s) => s.modelName === name.toLowerCase()).shift();
};

class Converter {

  strapiModels: IStrapiModelExtended[] = [];

  constructor(strapiModelsParse: IStrapiModel[], private config: IConfigOptions) {

    if (!fs.existsSync(config.output)) fs.mkdirSync(config.output);

    if (config.enumName && typeof config.enumName === 'function') util.overrideToEnumName = config.enumName;
    if (config.interfaceName && typeof config.interfaceName === 'function') util.overrideToInterfaceName = config.interfaceName;
    if (config.fieldType && typeof config.fieldType === 'function') util.overrideToPropertyType = config.fieldType;
    else if (config.type && typeof config.type === 'function') {
      console.warn("option 'type' is depreated. use 'fieldType'");
      util.overrideToPropertyType = config.type;
    }
    if (config.excludeField && typeof config.excludeField === 'function') util.excludeField = config.excludeField;
    if (config.addField && typeof config.addField === 'function') util.addField = config.addField;
    if (config.fieldName && typeof config.fieldName === 'function') util.overrideToPropertyName = config.fieldName;
    if (config.outputFileName && typeof config.outputFileName === 'function') util.overrideOutputFileName = config.outputFileName;

    this.strapiModels = strapiModelsParse.map((m): IStrapiModelExtended => {

      const modelName = m._isComponent ?
        path.dirname(m._filename).split(path.sep).pop() + '.' + path.basename(m._filename, '.json')
        : path.basename(m._filename, '.settings.json');
      const interfaceName = util.toInterfaceName(m.info.name, m._filename);
      const ouputFile = util.toOutputFileName(modelName, m._isComponent, config.nested, interfaceName, m._filename)
      return {
        ...m,
        interfaceName,
        modelName: modelName.toLowerCase(),
        ouputFile
      }
    })

  }

  async run() {
    return new Promise<number>((resolve, reject) => {

      // Write index.ts
      const outputFile = path.resolve(this.config.output, 'index.ts');

      const output = this.strapiModels
        .map(s => `export * from './${s.ouputFile.replace('\\', '/')}';`)
        .sort()
        .join('\n');
      fs.writeFileSync(outputFile, output + '\n');

      // Write each interfaces
      let count = this.strapiModels.length;
      this.strapiModels.forEach(g => {
        const folder = path.resolve(this.config.output, g.ouputFile);
        if (!fs.existsSync(path.dirname(folder))) fs.mkdirSync(path.dirname(folder));
        fs.writeFile(`${folder}.ts`, this.strapiModelToInterface(g), { encoding: 'utf8' }, (err) => {
          count--;
          if (err) reject(err);
          if (count === 0) resolve(this.strapiModels.length);
        });
      });
    })
  }

  strapiModelToInterface(m: IStrapiModelExtended) {
    const result: string[] = [];

    result.push(...this.strapiModelExtractImports(m));
    if (result.length > 0) result.push('')

    result.push('/**');
    result.push(` * Model definition for ${m.info.name}`);
    result.push(' */');
    result.push(`export interface ${m.interfaceName} {`);

    result.push(`  ${this.strapiModelAttributeToProperty(m.interfaceName, 'id', {
      type: 'string',
      required: true
    })}`);

    if (m.attributes) for (const aName in m.attributes) {
      if ((util.excludeField && util.excludeField(m.interfaceName, aName)) || !m.attributes.hasOwnProperty(aName)) continue;
      result.push(`  ${this.strapiModelAttributeToProperty(m.interfaceName, aName, m.attributes[aName])}`);
    }

    if (util.addField) {
      let addFields = util.addField(m.interfaceName);
      if (addFields && Array.isArray(addFields)) for (let f of addFields) {
        result.push(`  ${f.name}: ${f.type};`)
      }
    }

    result.push('}');

    if (this.config.enum) result.push('', ...this.strapiModelAttributeToEnum(m.interfaceName, m.attributes));

    return result.join('\n');
  };

  /**
   * Find all required models and import them.
   *
   * @param m Strapi model to examine
   * @param structure Overall output structure
   */
  strapiModelExtractImports(m: IStrapiModelExtended) {
    const toImportDefinition = (name: string) => {
      const found = findModel(this.strapiModels, name);
      const toFolder = (f: IStrapiModelExtended) => {
        let rel = path.normalize(path.relative(path.dirname(m.ouputFile), path.dirname(f.ouputFile)));
        rel = path.normalize(rel + path.sep + path.basename(f.ouputFile))
        if (!rel.startsWith('..')) rel = '.' + path.sep + rel;
        return rel.replace('\\', '/').replace('\\', '/');
      }
      return found ? `import ${(this.config.importAsType && this.config.importAsType(m.interfaceName) ? 'type ' : '')}{ ${found.interfaceName} } from '${toFolder(found)}';` : '';
    };

    const imports: string[] = [];
    if (m.attributes) for (const aName in m.attributes) {

      if (!m.attributes.hasOwnProperty(aName)) continue;

      const a = m.attributes[aName];
      if ((a.collection || a.model || a.component) === m.modelName) continue;

      const proposedImport = toImportDefinition(a.collection || a.model || a.component || '')
      if (proposedImport) imports.push(proposedImport);

      imports.push(...(a.components || [])
        .filter(c => c !== m.modelName)
        .map(toImportDefinition));
    }

    return imports
      .filter((value, index, arr) => arr.indexOf(value) === index) // is unique
      .sort()
  };

  /**
   * Convert a Strapi Attribute to a TypeScript property.
   *
   * @param interfaceName name of current interface
   * @param name Name of the property
   * @param a Attributes of the property
   * @param structure Overall output structure
   * @param enumm Use Enum type (or string literal types)
   */
  strapiModelAttributeToProperty(
    interfaceName: string,
    name: string,
    a: IStrapiModelAttribute
  ) {
    const findModelName = (n: string) => {
      const result = findModel(this.strapiModels, n);
      if (!result && n !== '*') console.debug(`type '${n}' unknown on ${interfaceName}[${name}] => fallback to 'any'. Add in the input arguments the folder that contains *.settings.json with info.name === '${n}'`)
      return result ? result.interfaceName : 'any';
    };
    const buildDynamicZoneComponent = (n: string) => {
      const result = findModel(this.strapiModels, n);
      if (!result && n !== '*') console.debug(`type '${n}' unknown on ${interfaceName}[${name}] => fallback to 'any'. Add in the input arguments the folder that contains *.settings.json with info.name === '${n}'`)
      return result ? `    | ({ __component: '${result.modelName}' } & ${result.interfaceName})\n` : 'any';
    };

    const required = !a.required && !(!this.config.collectionCanBeUndefined && (a.collection || a.repeatable)) && a.type !== 'dynamiczone' ? '?' : '';
    const collection = a.collection || a.repeatable ? '[]' : '';

    let propType = 'unknown';
    if (a.collection) {
      propType = findModelName(a.collection);
    } else if (a.component) {
      propType = findModelName(a.component);
    } else if (a.model) {
      propType = findModelName(a.model);
    } else if (a.type === "dynamiczone") {
      propType = `(\n${a.components!.map(buildDynamicZoneComponent).join('')}  )[]`
    } else if (a.type) {
      propType = util.toPropertyType(interfaceName, name, a, this.config.enum)
    }

    return `${util.toPropertyName(name, interfaceName)}${required}: ${propType}${collection};`;
  };

  /**
   * Convert all Strapi Enum to TypeScript Enumeration.
   *
   * @param interfaceName name of current interface
   * @param a Attributes
   */
  strapiModelAttributeToEnum(interfaceName: string, attributes: { [attr: string]: IStrapiModelAttribute }): string[] {
    const enums: string[] = []
    for (const aName in attributes) {
      if (!attributes.hasOwnProperty(aName)) continue;
      if (attributes[aName].type === 'enumeration') {
        enums.push(`export enum ${util.toEnumName(aName, interfaceName)} {`);
        attributes[aName].enum!.forEach(e => {
          enums.push(`  ${e} = "${e}",`);
        })
        enums.push(`}\n`);
      }
    }
    return enums
  }

}

/**
 * Export a StrapiModel to a TypeScript interface
 */
export const convert = async (strapiModels: IStrapiModel[], config: IConfigOptions) => {
  return new Converter(strapiModels, config).run()
}
