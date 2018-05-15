import * as npmPackage from '../package.json';
import commandLineUsage from 'command-line-usage';
import commandLineArgs from 'command-line-args';
import { OptionDefinition } from 'command-line-args';
import { exec } from './processor';

const log = console.log;

export interface ICommandOptions {
  /** Strapi folder with models */
  input: string;
  /** Output folder */
  output: string;
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
      typeLabel: '{underline String}',
      defaultOption: true,
      description: 'Input folder with the Strapi models (api folder).',
    },
    {
      name: 'output',
      alias: 'o',
      type: String,
      typeLabel: '{underline String}',
      defaultValue: '.',
      description: 'Output folder with the TypeScript models.',
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
          desc: '01. Log the css-demo topic.',
          example: '$ kafka-topics-logger css-demo',
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
