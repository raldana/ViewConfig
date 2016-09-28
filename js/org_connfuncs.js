// update the global config object
function updateGlobalConfig(config) {
  global.sharedObj.sqlConfig = config;
  console.log('New config object is: ' + global.sharedObj.sqlConfig + '\n');
}


// test the sql server connection
function testConn(config, event) {
  var remote = require('electron').remote;
  var sql = require('mssql');
  var isConnected = true;
  var connection = new sql.Connection(config);
  
  // try making a connection with this config
  connection.connect(function(err) {
    if (err !== null) {
      isConnected = false;
      console.log(err);
    };
    connection.close();
    notifyConnState(event, isConnected);
  });
};

// test the sql server connection
function getJobs(config, startDate, stopDate, event) {
  var remote = require('electron').remote;
  var sql = require('mssql');
  var isConnected = true;
  var connection = new sql.Connection(config);
  
  // try making a connection with this config
  connection.connect(function(err) {
    if (err !== null) {
      isConnected = false;
      console.log(err);
    } else {
      var request = new sql.request();
      request.input('StartDate', sql.DateTime, startDate);
      request.input('StopDate', sql.DateTime, stopDate);
      request.input('JobType', sql.Char(1), 'A');
      request.execute('odJobQueueSelectAP', function (err, recordsets) {
        console.log(recordsets[0].Job);
        console.log(recordsets[0].Job);
      });
    };


    connection.close();
  });
};


// test connection using alternative sql library to get sql server with windows authentication
function testConnV8(config, event) {
  
  var sql = require('.sqlserver.native');
  var conn_str = "Driver={SQL Server Native Client 11.0};Server={WS08TEST};Database={RA_BDC};Trusted_Connection=Yes;";
  var isConnected = true;

  console.log(config);

  sql.open(conn_str, function(err, new_conn) {
    if (err) {
      console.log("error connecting with v8");
    } else {
      console.log("connection successful with v8");
      sql.close();
    };
  });
 
};

// reply that we have finished our connection test
function notifyConnState (event, connState) {
  event.sender.send('testConnReply', connState);
  console.log('Connection state: ' + connState);
};



exports.testConn = testConn;
exports.testConnV8 = testConnV8;
