import * as fs from 'fs';
import * as path from 'path';
import { IStrapiModel } from './models/strapi-model';

/**
 * Recursively walk a directory asynchronously and obtain all file names (with full path).
 *
 * @param dir Folder name you want to recursively process
 * @param done Callback function to return the results when the processing is done. Returns all files with full path.
 * @param filter Optional filter to specify which files to include, e.g. for json files: (f: string) => /.json$/.test(f)
 */
const walk = (
  dir: string,
  done: (err: Error | null, files?: string[]) => void,
  filter?: (f: string) => boolean
) => {
  let foundFiles: string[] = [];
  fs.readdir(dir, (err: NodeJS.ErrnoException | null, list: string[]) => {
    if (err) {
      return done(err);
    }
    let pending = list.length;
    if (!pending) {
      return done(null, foundFiles);
    }
    list.forEach((file: string) => {
      file = path.resolve(dir, file);
      // tslint:disable-next-line:variable-name
      fs.stat(file, (_err2, stat) => {
        if (stat && stat.isDirectory()) {
          walk(
            file,
            // tslint:disable-next-line:variable-name
            (_err3, res) => {
              if (res) {
                foundFiles = foundFiles.concat(res);
              }
              if (!--pending) {
                done(null, foundFiles);
              }
            },
            filter
          );
        } else {
          if (typeof filter === 'undefined' || (filter && filter(file))) {
            foundFiles.push(file);
          }
          if (!--pending) {
            done(null, foundFiles);
          }
        }
      });
    });
  });
};

export const findFiles = (dir: string, ext: RegExp = /.settings.json$/) =>
  new Promise<string[]>((resolve, reject) => {
    const filter = (f: string) => ext.test(f);
    walk(
      dir,
      (err, files) => {
        if (err) {
          reject(err);
        } else if (files) {
          resolve(files);
        }
      },
      filter
    );
  });


/**
 * Wrapper around "findFiles".
 * 
 */
export async function findFilesFromMultipleDirectories(...files: string[]): Promise<string[]> {
  const inputs = [... new Set(files)]

  var actions = inputs.map(i => findFiles(i)); // run the function over all items

  // we now have a promises array and we want to wait for it

  var results = await Promise.all(actions); // pass array of promises

  // flatten
  return (new Array<string>()).concat.apply([], results)
}

/*
 */
export const importFiles = (files: string[]) =>
  new Promise<IStrapiModel[]>((resolve, reject) => {

    let pending = files.length;
    const results: IStrapiModel[] = [];
    const names: string[] = [];

    files.forEach(f =>
      fs.readFile(f, { encoding: 'utf8' }, (err, data) => {

        if (err) reject(err);
        pending--;

        let strapiModel = Object.assign(JSON.parse(data), { _filename: f })
        /* Model name in strapiModel.info.name may be overridden by user.
          At this point easy way is to determine it from file name,
          like /extensions/users-permissions/models/User.settings.json - extract "user" (lowercase)
          or /api/rules/models/rules.settings.json - extract "rules" */
        // TODO: for components, parse nearest folder and include into modelName with dot. See ts-exporter.componentCompatible for reason
        const modelNameStep1 = f.slice(f.lastIndexOf('\\') + 1) //windows
        const modelNameStep2 = modelNameStep1.slice(modelNameStep1.lastIndexOf('/') + 1) //linux
        const modelName = modelNameStep2.slice(0, modelNameStep2.indexOf('.')).toLowerCase() //cut all extensions and to lowercase
        strapiModel.modelName = modelName;
        let sameNameIndex = names.indexOf(modelName);
        if (sameNameIndex === -1) {
          results.push(strapiModel);
          names.push(modelName)
        } else if (f.indexOf('node_modules') === -1) {
          // in case model is in node_modules and is overridden in code, priority to take from code
          console.warn(`Already have model '${modelName}' => skip ${results[sameNameIndex]._filename} use ${strapiModel._filename}`)
          results[sameNameIndex] = strapiModel;
        } else {
          console.warn(`Already have model '${modelName}' => use ${results[sameNameIndex]._filename} skip ${strapiModel._filename}`)
        }
        if (pending === 0) {
          resolve(results);
        }
      })
    );
  });
