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
    let ret = {};
    let process = spawn('python',[runCommand]);
    async.parallel({
        stdout: function(callback) {
            process.stdout.on('data', function(data) {
                callback(null, data.toString());
            });
        },
        stderr: function(callback) {
            process.stderr.on('data', function(data) {
                callback(null, data.toString());
            });
        }
        }, function(err, results) {
            console.log(results);
            res.json({output: results.stdout, err: results.stderr})
        }
    )
};

//基本完成，剩下文件过滤，import可能有问题？没试过