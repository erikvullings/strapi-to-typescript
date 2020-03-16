import * as npmPackage from '../package.json';
import commandLineUsage from 'command-line-usage';
import commandLineArgs from 'command-line-args';
import { OptionDefinition } from 'command-line-args';
import { exec } from './processor';

const log = console.log;

export interface ICommandOptions {
  /** Strapi folder(s) with models */
  input: string[];
  /** Strapi folder(s) with groups models */
  inputGroup: string;
  /** Output folder */
  output: string;
  /** Put all interfaces in a nested tree instead of directly under the output folder */
  nested: boolean;
  /** Display help output */
  help: boolean;
}

interface IOptionDefinition extends OptionDefinition {
  typeLabel: string;
  description: string;
}

export class CommandLineInterface {
  public static optionDefinitions: IOptionDefinition[] = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      typeLabel: '{underline Boolean}',
      description: 'Show help text.',
    },
    {
      name: 'input',
      alias: 'i',
      type: String,
      multiple:true,
      typeLabel: '{underline String}',
      defaultOption: true,
      description: 'Input folder with the Strapi models (api folder).',
    },
    {
      name: 'inputGroup',
      alias: 'g',
      type: String,
      typeLabel: '{underline String}',
      defaultValue: undefined,
      description: 'Input folder with the Strapi models (groups folder).',
    },
    {
      name: 'output',
      alias: 'o',
      type: String,
      typeLabel: '{underline String}',
      defaultValue: '.',
      description: 'Output folder with the TypeScript models.',
    },
    {
      name: 'nested',
      alias: 'n',
      type: Boolean,
      typeLabel: '{underline Boolean}',
      defaultValue: false,
      description: 'If true, add each interface in its own folder.',
    },
  ];

  public static sections = [
    {
      header: `${npmPackage.name.toUpperCase()}, v${npmPackage.version}`,
      content: `${npmPackage.license} license.

    ${npmPackage.description}`,
    },
    {
      header: 'Options',
      optionList: CommandLineInterface.optionDefinitions,
    },
    {
      header: 'Examples',
      content: [
        {
          desc: '01. Convert the Strapi API folder and write the results to current folder.',
          example: '$ sts [PATH\\TO\\API]',
        },
        {
          desc: '02. Convert the Strapi API folder and write the results to output folder.',
          example: '$ sts [PATH\\TO\\API] -o [PATH\\TO\\OUTPUT]',
        },
        {
          desc: '03. Add each interface to its own folder.',
          example: '$ sts [PATH\\TO\\API] -o [PATH\\TO\\OUTPUT] -n',
        },
        {
          desc: '04. Define multiple input folders.',
          example: '$ sts [PATH\\TO\\API] [PATH\\TO\\Plugin] [PATH\\TO\\Another_Plugin]',
        },
      ],
    },
  ];
}

const options = commandLineArgs(CommandLineInterface.optionDefinitions) as ICommandOptions;

if (options.help || !options.input) {
  const usage = commandLineUsage(CommandLineInterface.sections);
  log(usage);
  process.exit(0);
} else {
  // Do your thing
  exec(options);
}
