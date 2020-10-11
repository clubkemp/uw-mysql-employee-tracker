const connection = require("./connection.js")

const allEmployees = () => {
    connection.query("SELECT * FROM songs",function(err,data){
        if(err) throw err;
        console.table(data);
        promptUser();
    })
}

const roles = () =>{
    
}

exports.allEmployees = allEmployees;
exports.roles = roles