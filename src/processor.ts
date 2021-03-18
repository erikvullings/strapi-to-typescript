import { convert } from './ts-exporter';
import { IConfigOptions } from '..';
import { findFilesFromMultipleDirectories, importFiles, findFiles } from './importer';

const log = console.log;
const logError = console.error;

export const exec = async (options: IConfigOptions) => {
  try{
    // find *.settings.json
    const files = await findFilesFromMultipleDirectories(...options.input);
    if(options.inputGroup) files.push(... await findFiles(options.inputGroup, /.json/));

    // parse files to object
    const { models, components } = await importFiles(files);

    // build and write .ts
    const count = await convert(models, components, options);

    log(`Generated ${count} interfaces.`);
  } catch (e){
    logError(e)
  }
};
