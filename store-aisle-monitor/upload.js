//Setup the nodejs environment

const path = require('path');
const args = require('yargs').argv;
const storage = require('azure-storage');

//Specify the container name & the access key in the argument space. Please create an Azure account first before heading to the next step.
const blobService = storage.createBlobService('heatmapblob', 'n84Y4utI/X991Ydyc/coHOLILQkgME1N810dNz/4G5UEh5ytJjD2YFX641dg8wqdgRGUD6YC0se7DFu+H751OA==');
const containerName = 'images';
const sourceFilePath = path.resolve('./image.png');
const blobName = path.basename(sourceFilePath, path.extname(sourceFilePath));
console.log("blobName " +blobName);
//const createContainer = () => {
//	console.log("test2");
//    return new Promise((resolve, reject) => {
//	console.log("test3");
        blobService.createContainerIfNotExists(containerName,  {publicAccessLevel : 'blob'}, function(err) {
            if(err) {
                console.log("Error creating events table: " + err.stack);
		reject(err);
            } else {
		console.log("Created container")
                //resolve({ message: `Container '${containerName}' created` });
            }
        });
//    });
//};

//const upload = () => {
//    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromLocalFile(containerName, blobName, sourceFilePath, function(err)  {
            if(err) {
                console.log("Error " + err.stack);
            } else {
                console.log("Upload success")
            }
        });
 //   });
//};
