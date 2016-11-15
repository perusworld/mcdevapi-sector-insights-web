angular.module('sectorinsights.services', [])

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
