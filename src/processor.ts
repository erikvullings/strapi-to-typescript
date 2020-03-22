import { convert } from './ts-exporter';
import { ICommandOptions } from './cli';
import { findFilesFromMultipleDirectories, importFiles, findFiles } from './importer';

const log = console.log;
const logError = console.error;

export const exec = async (options: ICommandOptions) => {
  const files = await findFilesFromMultipleDirectories(...options.input);
  if(options.inputGroup){
    files.push(... await findFiles(options.inputGroup, /.json/));
  }
  const strapiModels = await importFiles(files);
  convert(options.output, strapiModels, options.nested, options.enum)
    .then((count) => {
      log(`Generated ${count} interfaces.`);
      process.exit(0);
    })
    .catch((err) => logError(err));
};
