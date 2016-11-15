angular.module('sectorinsights.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  .state('tab.reports', {
      url: '/reports',
      views: {
        'tab-reports': {
          templateUrl: 'templates/tab-reports.html',
          controller: 'ReportsCtrl'
        }
      }
    })
    .state('tab.report-detail', {
      url: '/reports/:reportId',
      views: {
        'tab-reports': {
          templateUrl: 'templates/report-detail.html',
          controller: 'ReportDetailCtrl'
        }
      }
    });

  $urlRouterProvider.otherwise('/tab/reports');

});
