angular.module('sectorinsights.controllers', [])

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
