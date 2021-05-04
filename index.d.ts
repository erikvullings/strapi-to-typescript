export interface ICommandOptions {
    /** Strapi folder(s)/file(s) with models (*.settings.json) */
    input: string[];
    /** Strapi folder(s) with components models (*.json) */
    components: string;
    /** @deprecated use components */
    inputGroup: string;
    /** Output folder */
    output: string;
    /** Put all interfaces in a nested tree instead of directly under the output folder */
    nested: boolean;
    /** Generate enumeration */
    enum: boolean;
    /** By default, all collection can not be undefined. You can turn this off, so only unrequired collections may be undefined. */
    collectionCanBeUndefined: boolean

    /** configuration file*/
    config: string;
    /** Display help output */
    help: boolean;
}

export interface IConfigOptions extends ICommandOptions {
    /**
     * Model Strapi attributes type and name => type of field.
     * (use default, if empty return)
     * example:
     *      (fieldType) => { if(fieldType == 'datetime') return 'string'}
     */
    fieldType: (fieldType: string, fieldName: string, interfaceName: string) => string | undefined;
    /** @deprecated use fieldType */
    type: (fieldType: string, fieldName: string, interfaceName: string) => string | undefined;

    /**
     * Model Strapi attributes name => name of field.
     * (use default, if empty return)
     * example:
     *      (fieldName) => fieldName.replace('_', '')
     */
    fieldName: (fieldName: string, interfaceName: string) => string | undefined;

    /**
     * Model Strapi info.name => name of typescript interface.
     * (use default, if empty return)
     * example:
     *      (name) => name.charAt(0).toUpperCase() + name.slice(1)
     */
    interfaceName: (name: string, filename: string) => string | undefined;

    /**
     * Model Strapi attributes name.
     * (use default, if empty return)
     * example:
     *      (name) => 'Enum' + name.charAt(0).toUpperCase() + name.slice(1)
     */
    enumName: (name: string, interfaceName: string) => string | undefined;

    /**
     * outputfile .ts path.
     */
    outputFileName: (interfaceName: string, filename: string) => string | undefined;

    /**
     * Exclude field on typescript interface.
     * example:
     *      (interfaceName, fieldName) => fieldName === 'hide_field'
     */
    excludeField: (interfaceName: string, fieldName: string) => boolean | undefined;

    /**
     * Use `import type` in import statements in generated files.
     * ()
     * example:
     *      (interfaceName) => true
     *      (interfaceName) => interfaceName === 'MyInterface'
     */
    importAsType: (interfaceName: string) => boolean | undefined;

    /**
     * add your fields on typescript interface.
     * example:
     *      () => [{ name: "created_by", type: "string" }, { name: "updated_by", type: "string" }]
     */
    addField: (interfaceName: string) => { name: string, type: string }[]
}

declare module 'strapi-to-typescript' {
    export = IConfigOptions
}
