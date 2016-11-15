angular.module('sectorinsights', ['ionic', 'sectorinsights.controllers', 'sectorinsights.routes', 'sectorinsights.services', 'sectorinsights.api', 'nvd3ChartDirectives', 'angularMoment'])

  .config(
  [function () {
  }]
  )

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
    });
  });
