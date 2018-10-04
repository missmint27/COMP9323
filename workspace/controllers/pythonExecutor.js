const fs = require('fs');
const spawn = require('child_process').spawn;
const async = require('async');
module.exports = (res, roomID, code) => {
    let filename = 'pythonFiles/' + roomID + ".py";
    let runCommand = "./" + filename;
    console.log("TEST: ", filename);
    fs.writeFileSync(filename, code, function(err){
        if(err) {console.log(err);}
        else { console.log("WriteFile Finished."); }
    });
    let process = spawn('python3',[runCommand]);
    process.stdout.on('data', function(data) {
        if (data) { res.json({output: data.toString()}); }
    });
    process.stderr.on('data', function(data) {
        if (data) { res.json({err: data.toString()}); }
    })
};

//基本完成，剩下文件过滤，import可能有问题？没试过