"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Recursively walk a directory asynchronously and obtain all file names (with full path).
 *
 * @param dir Folder name you want to recursively process
 * @param done Callback function to return the results when the processing is done. Returns all files with full path.
 * @param filter Optional filter to specify which files to include, e.g. for json files: (f: string) => /.json$/.test(f)
 */
const walk = (dir, done, filter) => {
    let foundFiles = [];
    fs.readdir(dir, (err, list) => {
        if (err) {
            return done(err);
        }
        let pending = list.length;
        if (!pending) {
            return done(null, foundFiles);
        }
        list.forEach((file) => {
            file = path.resolve(dir, file);
            // tslint:disable-next-line:variable-name
            fs.stat(file, (_err2, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, 
                    // tslint:disable-next-line:variable-name
                    (_err3, res) => {
                        if (res) {
                            foundFiles = foundFiles.concat(res);
                        }
                        if (!--pending) {
                            done(null, foundFiles);
                        }
                    }, filter);
                }
                else {
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
exports.findFiles = (dir) => new Promise((resolve, reject) => {
    const filter = (f) => /.settings.json$/.test(f);
    walk(dir, (err, files) => {
        if (err) {
            reject(err);
        }
        else if (files) {
            resolve(files);
        }
    }, filter);
});
/*
 */
exports.importFiles = (files) => new Promise((resolve, reject) => {
    let pending = files.length;
    const results = [];
    files.forEach((f) => fs.readFile(f, { encoding: 'utf8' }, (err, data) => {
        if (err) {
            reject(err);
        }
        pending--;
        results.push(Object.assign(JSON.parse(data), { _filename: f }));
        if (pending === 0) {
            resolve(results);
        }
    }));
});
//# sourceMappingURL=importer.js.map