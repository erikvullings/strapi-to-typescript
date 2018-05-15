import { convert } from './ts-exporter';
import { ICommandOptions } from './cli';
import { findFiles, importFiles } from './importer';

export const exec = async (options: ICommandOptions) => {
  const files = await findFiles(options.input);
  const strapiModels = await importFiles(files);
  // tslint:disable-next-line:no-console
  // strapiModels.forEach((m) => console.log(JSON.stringify(m, null, 2)));
  await convert(options.output, strapiModels);
};
