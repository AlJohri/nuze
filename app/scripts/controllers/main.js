'use strict';

/**
 * @ngdoc function
 * @name nuzeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the nuzeApp
 */
angular.module('nuzeApp')
  .controller('MainCtrl', function ($scope, Ref, $firebaseArray, $timeout) {

    $scope.messages = $firebaseArray(Ref.child('messages').limitToLast(10));
    $scope.messages.$loaded().catch(alert);

    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }

  });
