import { convert } from './ts-exporter';
import { ICommandOptions } from './cli';
import { findFiles, importFiles } from './importer';

const log = console.log;
const logError = console.error;

export const exec = async (options: ICommandOptions) => {
  const files = await findFiles(options.input);
  const strapiModels = await importFiles(files);
  convert(options.output, strapiModels)
    .then((count) => {
      log(`Generated ${count} interfaces.`);
      process.exit(0);
    })
    .catch((err) => logError(err));
};
