const fs = require('fs');
const spawn = require('child_process').spawn;
const exec  = require('child_process').exec;
const async = require('async');
module.exports = (res, roomID, code) => {
    let filename = 'pythonFiles/' + roomID + ".py";
    let runCommand = "./" + filename;
    fs.writeFileSync(filename, code, function(err){
        if(err) { console.log(err);}
        else { console.log("WriteFile Finished."); }
    });
    let process = spawn('python3',[runCommand]);
    let ret = {};
    process.stdout.on('data', function(data) {
        ret['output'] = data.toString();
    });
    process.stderr.on('data', function(data) {
        ret['err'] = data.toString();
    });
    process.on('exit', function() {
        res.json(ret);
    });
};

