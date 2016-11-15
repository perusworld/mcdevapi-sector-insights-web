# Mastercard Developer API - Sector Insights - Reference Implementation - Angular/Express #

## [Demo](https://perusworld.github.io/mcdevapi-sector-insights-web/) ##

## Setup ##

1.Checkout the code
```bash
git clone https://github.com/perusworld/mcdevapi-sector-insights-web.git
```
2.Run bower install
```bash
bower install
```
3.Run npm install
```bash
npm install
```

## Running using dummy data ##
1.Start the app
```bash
node index.js
```
2.Open browser and goto [http://localhost:3000](http://localhost:3000)

## Running using MasterCard API ##
Make sure you have registered and obtained the API keys and p12 files from [https://developer.mastercard.com/](https://developer.mastercard.com/)

1.Start the app
```bash
export KEY_FILE=<your p12 file location>
export API_KEY=<your api key>
node index.js
```
2.Open browser and goto [http://localhost:3000](http://localhost:3000)

#### Some of the other options ####
```bash
export KEY_FILE_PWD=<p12 key password defaults to keystorepassword>
export KEY_FILE_ALIAS=<p12 key alias defaults to keyalias>
export SANDBOX=<sandbox or not defaults to true>
```
## Code ##
### Backend API Initialization ###
```javascript
var sectorInsights = require('mastercard-sector-insights');
var MasterCardAPI = sectorInsights.MasterCardAPI;
var config = {
    p12file: process.env.KEY_FILE || null,
    p12pwd: process.env.KEY_FILE_PWD || 'keystorepassword',
    p12alias: process.env.KEY_FILE_ALIAS || 'keyalias',
    apiKey: process.env.API_KEY || null,
    sandbox: process.env.SANDBOX || 'true',
}
 var authentication = new MasterCardAPI.OAuth(config.apiKey, config.p12file, config.p12alias, config.p12pwd);
    MasterCardAPI.init({
        sandbox: 'true' === config.sandbox,
        authentication: authentication
    });
```
### Backend API Call (query available reports) ###
```javascript
app.post('/parameters', function (req, res) {
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
});

```
### Backend API Call (query insights using sector/period/country sent as part of JSON post) ###
```javascript
app.post('/insights', function (req, res) {
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

});

```
### Angular Service to query list of reports and insights ###
```javascript
angular.module('sectorinsights.api', [])


    .service('InsightsApi', ['$http', function ($http) {
        var ret = {
            getReports: function (callback) {
                var data = {
                }
                $http.post('/parameters', data).then(function successCallback(response) {
                    callback(response.data)
                });
            },
            getInsights: function (report, callback) {
                var data = {
                    "CurrentRow": "1",
                    country: report.Country,
                    sector: report.Sector,
                    period: report.Period
                }
                $http.post('/insights', data).then(function successCallback(response) {
                    callback(response.data)
                });
            }
        };
        return ret;

    }])

    .factory('Reports', function (InsightsApi) {
        var ret = {
            all: function (callback) {
                InsightsApi.getReports(function (data) {
                    if (null != data) {
                        callback(data.ParameterList.ParameterArray.Parameter);
                    }
                });
            },
            get: function (reportIndex, callback) {
                ret.all(function (reports) {
                    callback(reports[reportIndex]);
                });
            },
            insights: function (report, callback) {
                InsightsApi.getInsights(report, function(data) {
                    if (null != data) {
                        callback(data.SectorRecordList.SectorRecordArray.SectorRecord);
                    }
                });
            }
        };
        return ret;
    });
```
### Angular Controller to get list of reports as well as detailed insights ###
```javascript
    .controller('ReportsCtrl', function ($scope, Reports) {
        $scope.reports = {};
        Reports.all(function (data) {
            $scope.reports = data;
        });
    })
    .controller('ReportDetailCtrl', function ($window, $scope, $stateParams, Reports, moment) {
        $scope.report = {
            Period: 'Period',
            Sector: 'Sector'
        };
        $scope.chartData = [];
        $scope.chart = {
            height: $window.innerHeight - 100
        }
        var format = "MMM";
        Reports.get($stateParams.reportId, function (report) {
            $scope.report = report;
            if (report.Period == "Weekly") {
                format = "wo";
            }
            Reports.insights(report, function (details) {
                $scope.chartData = [
                    {
                        "key": "Sales Index Value",
                        "values": details.map(function (dtl) {
                            return [moment(dtl.BeginDate, 'MM/DD/YYYY').valueOf(), dtl.SalesIndexValue];
                        })
                    },
                    {
                        "key": "Sales Index",
                        "bar": true,
                        "values": details.map(function (dtl) {
                            return [moment(dtl.BeginDate, 'MM/DD/YYYY').valueOf(), dtl.SalesIndex];
                        })
                    },
                    {
                        "key": "Average Ticket Index",
                        "bar": true,
                        "values": details.map(function (dtl) {
                            return [moment(dtl.BeginDate, 'MM/DD/YYYY').valueOf(), dtl.AverageTicketIndex];
                        })
                    }
                ];
            });
        });
        $scope.xAxisTickFormat = function () {
            return function (value) {
                return moment(value).format(format);
            };
        }
        $scope.y1AxisTickFormat = function () {
            return function (value) {
                return value;
            };
        }
        $scope.y2AxisTickFormat = function () {
            return function (value) {
                return value;
            };
        }
    });
```
### Angular Template to display the list of reports ###
```html
    <ion-list>
      <ion-item class="item item-icon-right" ng-repeat="report in reports" type="item-text-wrap" href="#/tab/reports/{{$index}}">
        <h2>{{report.Sector}}</h2>
        <p>{{report.Country}} / {{report.Period}}</p>
        <i class="icon ion-chevron-right icon-accessory"></i>
      </ion-item>
    </ion-list>
```

### Angular Template to display the insights chart ###
```html
        <nvd3-line-plus-bar-chart 
            data="chartData" 
            id="chartData" 
            staggerLabels="true" 
            showXAxis="true" 
            showYAxis="true" 
            interactive="true"
            tooltips="true" 
            showControls="true" 
            showLegend="true" 
            clipEdge="true" 
            height="{{chart.height}}" 
            xAxisTickFormat="xAxisTickFormat()"
            y1AxisTickFormat="y1AxisTickFormat()" 
            y2AxisTickFormat="y2AxisTickFormat()" 
            noData="Please wait loading data...">
            <svg></svg>
        </nvd3-line-plus-bar-chart>
```