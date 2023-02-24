/**
 * Import File externals dependacies
 */
const fs = require('fs');
const path = require("path");
const chalk = require('chalk');

/**
 * Import Internal dependencies
 */
const { bytesToSize } = require('../../utils');

const Scan = {

    config: {
        
    },

    states: {
        //MaxFilesProcess
    },

    //  Retreave the yarg library object
    get: () => {
        return {
            command: 'scan',
            aliases: ['s'],
            desc: 'Scan directory for hidden file',
            handler: (argv) => Scan.boot(argv),
        }
    },

    // Call when cmd lunch
    boot: (argv) => {
        const MaxFilesProcess = 100000;
        let totalFileNumber = 0;

        let start = process.hrtime();
        
        const ExtentionNotFound = [];
        const ScanningFolder = argv._[1];

        if(!ScanningFolder){
            console.log(`${chalk.red('You must provide a directory path')}`);
            return;
        }

        fs.stat(ScanningFolder, (err, data) => {
            if(err){
                console.log(`${chalk.red('INVALIDE PATH - TRY ANOTHER DIRECTORY')}`);
                console.log('INVALIDE PATH');
            }else{
                let finaleSize = 0;
                let FilesArray = {
                    images: { size: 0, files: []},
                    videos: { size: 0, files: []},
                    documents: { size: 0, files: []},
                    designs: { size: 0, files: []},
                    codes: { size: 0, files: []},
                    fonts: { size: 0, files: []},
                    sounds: { size: 0, files: []},
                    hiddens: { size: 0, files: []},
                    others: { size: 0, files: []},
                    groupes: { size: 0, files: []},
                }


                process.stdout.write("Loading ...");

                const getFilesRecursively = (directory) => {
                    try {
                        if(totalFileNumber > MaxFilesProcess)return;
                        fs.accessSync(directory, fs.constants.R_OK);
                        const filesInDirectory = fs.readdirSync(directory);

                        for (const file of filesInDirectory) {
                            if(totalFileNumber > MaxFilesProcess)break;
                            const absolute = path.join(directory, file);
                            const data = fs.statSync(absolute);
                            if (data.isDirectory()) {
                                getFilesRecursively(absolute);
                            } else {
                                finaleSize += data.size;
                                pushFileToArray(FilesArray, data, file); 
                            }
                        }

                      } catch (err) {
                        console.log(err);
                        console.log(`${chalk.red('Cannot Access directory')}`);
                      }     
    
                }
            
                getFilesRecursively(ScanningFolder);
                
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write("\n");
                // stop the progress bar
                let stop = process.hrtime(start);

               

                console.log(`|----------------------------|`);
                console.log(`|--------- ${chalk.green('RESULTS')} ----------|`);
                console.log(`|----------------------------|`);

                Object.entries(FilesArray).forEach(array => {
                    const [key, value] = array;
                    logLine(key, value);
                });
               
                function logLine(name, array){
                    const {size, files}= array;
                    const PFiles = `${(files.length * 100 / totalFileNumber).toFixed(2)}%`;
                    const PSize = `${(size * 100 / finaleSize).toFixed(2)}%`
                    console.log(`${chalk.blue(files.length)} ${name} - ${chalk.blue(PFiles)} - ${chalk.magenta(PSize)} Directory space`);
                }

                console.log(`|----------------------------|`);
                console.log(`Total: ${chalk.blue(bytesToSize(finaleSize))}, including ${chalk.blue(totalFileNumber)} files`);
                console.log(`Time Taken to execute: ${(stop[0] * 1e9 + stop[1])/1e9} seconds`);
                // console.log(ExtentionNotFound);
                
            }

            function pushFileToArray(array, data, file){
                totalFileNumber += 1;

                const Extname = path.extname(`${ScanningFolder}/${file}`).toLowerCase();
                const FileObject = {
                    "size": data.size,
                    "readable_size": bytesToSize(data.size),
                    "path": `${ScanningFolder}/${file}`,
                    "ext": Extname,
                    "name": file,
                    "last_modification": data.mtime,
                }
                
                const ExtentionsType = {
                    images: ['.jpeg', '.jpg', '.svg', '.png', ".heic", ".ico", '.icloud', '.webp'],
                    designs: ['.psd', '.ai', '.fig', '.sketch', '.xd', '.eps'],
                    documents: ['.pages', '.docx', '.doc', '.key', '.pdf', '.xlsx', '.csv', '.txt'],
                    videos: ['.mp4', '.mov', ".gif"],
                    codes: ['.html', ".js", ".ts", ".php", ".css", ".scss", ".json", ".md", ".yml", ".vue", '.xml', '.lock', '.yaml'],
                    groupes: ['.zip',".rar"],
                    fonts: ['.otf',".ttf",".woff",".woff2", '.eot'],
                    sounds: ['.mp3', '.m4a', '.wav']
                }
               
                if(ExtentionsType.images.includes(Extname)){
                    array.images.size += data.size;
                    array.images.files.push(FileObject);
                }else if(ExtentionsType.designs.includes(Extname)){
                    array.designs.size += data.size;
                    array.designs.files.push(FileObject);
                }else if(ExtentionsType.documents.includes(Extname)){
                    array.documents.size += data.size;
                    array.documents.files.push(FileObject);
                }else if(ExtentionsType.videos.includes(Extname)){
                    array.videos.size += data.size;
                    array.videos.files.push(FileObject);
                }else if(ExtentionsType.codes.includes(Extname)){
                    array.codes.size += data.size;
                    array.codes.files.push(FileObject);
                }else if(ExtentionsType.groupes.includes(Extname)){
                    array.groupes.size += data.size;
                    array.groupes.files.push(FileObject);
                    
                }else if(ExtentionsType.fonts.includes(Extname)){
                    array.fonts.size += data.size;
                    array.fonts.files.push(FileObject);
                }else if(ExtentionsType.sounds.includes(Extname)){
                    array.sounds.files.push(FileObject);
                } else if(Extname == ''){
                    array.hiddens.size += data.size;
                    array.hiddens.files.push(FileObject);
                }else{
                    if(!ExtentionNotFound.includes(Extname))ExtentionNotFound.push(Extname);
                    array.others.size += data.size;
                    array.others.files.push(FileObject);
                }
            }  
        });
    }
};

module.exports = { 
    Scan: Scan
};