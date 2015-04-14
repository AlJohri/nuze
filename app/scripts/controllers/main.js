'use strict';

/**
 * @ngdoc function
 * @name nuzeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the nuzeApp
 */
angular.module('nuzeApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
