"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const command_line_args_1 = __importDefault(require("command-line-args"));
const npmPackage = __importStar(require("../package.json"));
const importer_1 = require("./importer");
const log = console.log;
class CommandLineInterface {
}
CommandLineInterface.optionDefinitions = [
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
        type: Number,
        typeLabel: '{underline String}',
        defaultValue: '.',
        description: 'Output folder with the TypeScript models.',
    },
];
CommandLineInterface.sections = [
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
exports.CommandLineInterface = CommandLineInterface;
const options = command_line_args_1.default(CommandLineInterface.optionDefinitions);
if (options.help || !options.input) {
    const usage = command_line_usage_1.default(CommandLineInterface.sections);
    log(usage);
    process.exit(0);
}
else {
    // Do your thing
    importer_1.importer(options.input).then((results) => results.forEach((f) => log(f)));
}
//# sourceMappingURL=cli.js.map