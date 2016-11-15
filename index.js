var express = require('express');
var bodyParser = require('body-parser');

var fs = require('fs')
var app = express();
var sectorInsights = require('mastercard-sector-insights');
var MasterCardAPI = sectorInsights.MasterCardAPI;

var dummyData = [];
var dummyDataFiles = ['www/data/params.json', 'www/data/quarterly.json', 'www/data/monthly.json', 'www/data/weekly.json'];
dummyDataFiles.forEach(function (file) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        dummyData[file] = JSON.parse(data);
    });
});

var config = {
    p12file: process.env.KEY_FILE || null,
    p12pwd: process.env.KEY_FILE_PWD || 'keystorepassword',
    p12alias: process.env.KEY_FILE_ALIAS || 'keyalias',
    apiKey: process.env.API_KEY || null,
    sandbox: process.env.SANDBOX || 'true',
}

var useDummyData = null == config.p12file;
if (useDummyData) {
    console.log('p12 file info missing, using dummy data')
} else {
    console.log('has p12 file info, using MasterCardAPI')
    var authentication = new MasterCardAPI.OAuth(config.apiKey, config.p12file, config.p12alias, config.p12pwd);
    MasterCardAPI.init({
        sandbox: 'true' === config.sandbox,
        authentication: authentication
    });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('www'));

app.post('/parameters', function (req, res) {
    if (useDummyData) {
        res.json(dummyData[dummyDataFiles[0]]);
    } else {
        var requestData = {
            "CurrentRow": "1"
        };

        sectorInsights.Parameters.query(requestData, function (error, data) {
            if (error) {
                console.error("An error occurred");
                console.dir(error, { depth: null });
                res.json({
                    ParameterList: {
                        Count: 0,
                        Message: 'Success',
                        ParameterArray: {
                            Parameter: [
                            ]
                        }
                    }
                });
            }
            else {
                res.json(data);
            }
        });

    }
});

app.post('/insights', function (req, res) {
    if (useDummyData) {
        res.json(dummyData['www/data/' + req.body.period.toLowerCase() + '.json']);
    } else {
        var requestData = {
            "CurrentRow": "1",
            "Country": req.body.country,
            "Sector": req.body.sector,
            "Period": req.body.period
        };

        sectorInsights.Insights.query(requestData, function (error, data) {
            if (error) {
                console.error("An error occurred");
                console.dir(error, { depth: null });
                res.json({
                    SectorRecordList: {
                        Count: 0,
                        Message: 'Success',
                        SectorRecordArray: {
                            SectorRecord: [
                            ]
                        }
                    }
                });
            }
            else {
                res.json(data);
            }
        });

    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
