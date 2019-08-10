#!/usr/bin/env node

const colog = require("colog");
const util = require("util");
const process = require("process");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const { name, version, description } = require("./package.json");

console.log(name, version);

const args = process.argv.slice(2);

let command = [];
let ignore = [];
let writingCommand = false;

for (let i = 0; i < args.length; i++) {
    let a = args[i];

    if (a == "--") {
        writingCommand = true;
    }
    else if (writingCommand) {
        command.push(a);
    }
    else if (a == "--help" || a == "-h") {
        showHelp();
    }
    else if (a == "--ignore" || a == "-i") {
        ignore.push(args[++i]);
    }
    else {
        console.error("Invalid command");
        break;
    }
}

runCommand().catch(err => colog.error(err));

async function runCommand() {
    if (command.length > 0) {

        const initialDir = process.cwd();
        let cmd = command.join(" ");
        const dirs = walk(process.cwd(), ignore);

        let errors = 0;

        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            colog.question("Executing " + cmd + " on " + dir);

            process.chdir(dir);

            while (cmd.indexOf("[dir]") !== -1) {
                cmd = cmd.replace("[dir]", dir);
            }

            try {
                const { stdout, stderr } = await exec(cmd);
                if (stdout && stdout !== "") {
                    colog.log(stdout);
                }
                if (stderr && stderr !== "") {
                    colog.error(stderr);
                    errors++;
                }
            }
            finally {
                process.chdir(initialDir);
            }
        }

        if (!errors) {
            colog.success("Finished");
        }
        else {
            colog.error("Finished with errors");
        }

        colog.log(" ");
    }
}

function walk(dir, ignoreFolders, search) {
    let results = [];
    let list = fs.readdirSync(dir);

    ignoreFolders = ignoreFolders || [];

    list.forEach(function (file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);

        if (ignoreFolders.some(m => file.indexOf("/" + m) !== -1)) {
            console.log(file + " ignored");
        }
        else {
            if (stat && stat.isDirectory()) {
                /* Recurse into a subdirectory */
                results.push(file);
                results = results.concat(walk(file, ignoreFolders, search));
            } else {
                /* Is a file */
                // results.push(file);
            }
        }
    });
    return results;
}

function showHelp() {
    colog.log(name, version);
    colog.log(description);
    colog.log(" ");
    colog.log("recursive *.json -- npm i");
    colog.log(" ");
}