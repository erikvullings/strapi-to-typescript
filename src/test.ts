import * as child_process from 'child_process';
import * as fs from 'fs';

async function execCmd(cmd: string) {
    return new Promise((r, e) => {
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`error: ${stderr || error && error.message}`);
                e(cmd)
            }
            console.log(`$ ${cmd}\n${stdout}`);
            r(null)
        })
    })
}

async function runTest(file: string) {
    try {
        const testConf = require(`./test/${file}.config.js`)
        if (testConf.output && (testConf.output as string).startsWith('src/test')) {
            await execCmd(`rm -rf ./${testConf.output}`)
        } else {
            console.error(`output of test '${file}' is wrong: ${testConf.output}`)
            process.exit(1)
        }
        await execCmd(`./node_modules/.bin/ts-node src/cli.ts -c ./src/test/${file}.config.js`);
        await execCmd(`./node_modules/.bin/ts-node src/test/${file}.assert.ts`)
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

async function runTestSuite(files: string[]) {
    for (let file of files) {
        await runTest(file);
    }
}

if (process.argv.length > 2)
    runTestSuite(process.argv.slice(2))
else
    runTestSuite(
        fs.readdirSync('./src/test')
            .filter(f => /.config.js$/.test(f))
            .map(f => f.replace('.config.js', ''))
    );

