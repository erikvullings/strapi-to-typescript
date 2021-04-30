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

export const findFiles = (dir: string, ext: RegExp = /(.json)$/) =>
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
  let results: string[] = []

  for (let input of files) {
    const actions = await findFiles(input);

    results = [...actions, ...results];
  }

  return results
}

/*
 */
export const importFiles = (files: string[]) =>
  new Promise<{ components: IStrapiModel[], models: IStrapiModel[] }>((resolve, reject) => {

    let pending = files.length;

    const models: IStrapiModel[] = [];
    const modelNames: string[] = [];

    const components: IStrapiModel[] = [];
    const componentNames: string[] = [];

    files.forEach(f => {
      try {
        const data = fs.readFileSync(f, { encoding: 'utf8' });
        
        pending--;

        let strapiModel = Object.assign(JSON.parse(data), { _filename: f })

        if (strapiModel.info && strapiModel.info.name && strapiModel.collectionName && strapiModel.collectionName.startsWith("component")) {
          const sameNameIndex = componentNames.indexOf(strapiModel.info.name);
          const componentCollectionName = f.split("/").slice(0, -1).pop();
          const componentModelName = f.split("/").pop()!.slice(0, -5);
          if (sameNameIndex === -1) {
            components.push({
              ...strapiModel,
              info: {
                ...strapiModel.info,
                name: `${componentCollectionName}.${componentModelName}`
              }
            });
            componentNames.push(strapiModel.info.name)
          } else {
            console.warn(`Already have component '${strapiModel.info.name}' => skip ${components[sameNameIndex]._filename} use ${strapiModel._filename}`)
            components.push({
              ...strapiModel,
              info: {
                ...strapiModel.info,
                name: `${componentCollectionName}.${componentModelName}`
              }
            });
          }
        } else if (strapiModel.info && strapiModel.info.name) {
          const sameNameIndex = modelNames.indexOf(strapiModel.info.name);
          if (sameNameIndex === -1) {
            models.push(strapiModel);
            modelNames.push(strapiModel.info.name)
          } else {
            console.warn(`Already have model '${strapiModel.info.name}' => skip ${models[sameNameIndex]._filename} use ${strapiModel._filename}`)
            models[sameNameIndex] = strapiModel;
          }
        }

        if (pending === 0) {
          resolve({ models, components });
        }
      } catch (err) {
        reject(err);
      }
    })
  });
