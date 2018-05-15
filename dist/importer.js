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
    let results = [];
    fs.readdir(dir, (err, list) => {
        if (err) {
            return done(err);
        }
        let pending = list.length;
        if (!pending) {
            return done(null, results);
        }
        list.forEach((file) => {
            file = path.resolve(dir, file);
            fs.stat(file, (err2, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (err3, res) => {
                        if (res) {
                            results = results.concat(res);
                        }
                        if (!--pending) {
                            done(null, results);
                        }
                    }, filter);
                }
                else {
                    if (typeof filter === 'undefined' || (filter && filter(file))) {
                        results.push(file);
                    }
                    if (!--pending) {
                        done(null, results);
                    }
                }
            });
        });
    });
};
exports.importer = (dir) => new Promise((resolve, reject) => {
    const filter = (f) => /.settings.json$/.test(f);
    const files = walk(dir, (err, results) => {
        if (err) {
            reject(err);
        }
        else if (results) {
            resolve(results);
        }
    }, filter);
});
//# sourceMappingURL=importer.js.map