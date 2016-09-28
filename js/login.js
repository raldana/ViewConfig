var remote = require('electron').remote;
var ipcRenderer = require('electron').ipcRenderer;
var isFileDone = false;

// connect to db
function connectToDB () {
    // get the server address
    var myServerAddr = document.getElementById("serverAddrText").value;
    var myAuthType = document.getElementById("loginAuthType").getAttribute("data-value");

    // get the user and password
    var myUserName = document.getElementById("userNameText").value;
    var myPasswordText = document.getElementById("userPswdText").value;
    
    // save the config data
    saveConfig(myServerAddr, myAuthType, myUserName, myPasswordText);
};

// save the db config object (server name, db, etc.)
function saveConfig (serverName, authType, userName, userPswd) {
    document.getElementById("loginServerAddr").setAttribute("data-value", serverName);
    document.getElementById("loginAuthType").setAttribute("data-value", authType);
    document.getElementById("loginUserID").setAttribute("data-value", userName);
    document.getElementById("loginUserPswd").setAttribute("data-value", userPswd);

    testConn(authType);
};

function testConn (loginAuthType) {
    var config = buildConfig();
    
    if (loginAuthType == "W" || (config.user && config.password && config.server)) {
        ipcRenderer.send('testConn', config);
    };
    
    ipcRenderer.once('testConnReply', function(event, connectState) {
        myStatus = document.getElementById("connStatusText");
        if (connectState == true) {
            // change the connect status text/color
            myStatus.style.color = "green";
            myStatus.innerHTML = "Connected";
            ipcRenderer.send('closeLogin');
        } else {
            // change the connect status text/color
            myStatus.style.display = "inline-block";
            myStatus.style.color = "red";
            myStatus.innerHTML = "Connect failed";
        };
    });


    ipcRenderer.once('getDBListReply', function() {
        //ipcRenderer.send('populateDBSelector');

        // tell the main process to close the login window
        ipcRenderer.send('closeLogin');
    });

};

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};

function buildConfig () {
    var sqlConfig = {};
    var authType = document.getElementById("loginAuthType").getAttribute("data-value");
    var userName = document.getElementById("loginUserID").getAttribute("data-value");
    var passwordText = document.getElementById("loginUserPswd").getAttribute("data-value");
    var serverName = document.getElementById("loginServerAddr").getAttribute("data-value");
    var dbName = document.getElementById("loginDBName").getAttribute("data-value"); // defaults to "master" at startup
    var dbDriver = document.getElementById("dbDriver").getAttribute("data-value");

    if (authType == "W") {
            sqlConfig = {
                driver: dbDriver,
                server: serverName,
                database: dbName,
                options: {
                    trustedConnection: true
                }
            };
        
    } else {
        if (userName && passwordText && serverName && dbName) {
            sqlConfig = {
                user: userName,
                password: passwordText,
                server: serverName,
                database: dbName
            };

        };
    };

    //ipcRenderer.send('consoleLog', sqlConfig);
    return sqlConfig;
};

function saveOS() {
    var dbDriver = "";

    var platformOS = remote.getGlobal('sharedObj').platformOS;

    if (platformOS == "win32") {
        dbDriver = "msnodesqlv8";
    } else {
        dbDriver = "tedious";
    };

    document.getElementById("platformOS").setAttribute("data-value", platformOS);
    document.getElementById("dbDriver").setAttribute("data-value", dbDriver);
}

function showWindowsAuth() {
    document.getElementById('authSelectorLabel').style.display = 'block';
    document.getElementById('authSelector').style.display = 'block';
    document.getElementById('authSelectorBreak').style.display = 'block';
    $('#userNameText').prop('disabled', true);
    $('#userPswdText').prop('disabled', true); 
}

