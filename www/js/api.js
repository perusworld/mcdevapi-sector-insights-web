angular.module('sectorinsights.api', [])


    .service('InsightsApi', ['$http', function ($http) {
        var ret = {
            getJson: function (file, callback) {
                $http.get('/data/' + file).then(function successCallback(response) {
                    callback(response.data)
                }, function errorCallback(response) {
                    callback(null);
                });
            },
            getReports: function (callback) {
                var data = {
                }
                $http.post('/parameters', data).then(function successCallback(response) {
                    callback(response.data)
                }, function errorCallback(response) {
                    ret.getJson("params.json", callback);
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
                }, function errorCallback(response) {
                    ret.getJson(report.Period.toLowerCase() + '.json', callback);
                });
            }
        };
        return ret;

    }]);

