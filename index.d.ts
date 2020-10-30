export interface ICommandOptions {
    /** Strapi folder(s) with models */
    input: string[];
    /** Strapi folder(s) with groups models */
    inputGroup: string;
    /** Output folder */
    output: string;
    /** Put all interfaces in a nested tree instead of directly under the output folder */
    nested: boolean;
    /** Generate enumeration */
    enum: boolean;

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
    type: (fieldType: string, fieldName: string, interfaceName: string) => string | undefined;

    /**
     * Model Strapi info.name => name of typescript interface.
     * (use default, if empty return)
     */
    interfaceName: (name: string) => string | undefined;

    /**
     * Model Strapi attributes name.
     * (use default, if empty return)
     */
    enumName: (name: string, interfaceName: string) => string | undefined;

    /**
     * Exclude field on typescript interface.
     */
    excludeField: (interfaceName: string, fieldName: string) => boolean | undefined;

    /**
     * add your fields on typescript interface.
     */
    addField: (interfaceName: string) => { name: string, type: string }[]
}

declare module 'strapi-to-typescript' {
    export = IConfigOptions
}
