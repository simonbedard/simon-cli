#! /usr/bin/env node
const yargs = require("yargs");
const inquirer = require('inquirer');

const usage = "\nUsage: simon <action> to call";
const { Scan } = require('./commands/scan/Scan');

console.log(Scan.get());

// All command in single array
const config = {
    cmd: [
        {
        command: 'test',
        aliases: ['t'],
        desc: 'Set a test',
        handler: (argv) => {
          console.log(` Test command successfull!`)
        }
    },
    Scan.get(),]
}

yargs.usage(usage)
    .option("a", {alias:"actions", describe: "List all possible actions.", type: "boolean", demandOption : false })
    .command(config.cmd)
    .help(true)
    .middleware(argv => {
       
    })
    .argv;



