'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('DashboardCtrl', function($scope, $rootScope, $state, $timeout, $http, AuthService) {
	
		var api = AuthService.getApi();
    $scope.$state = $state;
    
    $scope.showDash = true;
    $scope.hideDash = true;
  
  $scope.showClosedDash = function(){
     $scope.showDash = true;
      
     $timeout(function(){$scope.hideDash = true;},500);
  };
  
  $rootScope.logout = function(){

  	$http({
  		method: 'GET',
  		url: $rootScope.apiurl + '/logout',
			params: {api_token: api}
  	});

  	$.removeCookie('gpsnav_api');
		$.removeCookie('gpsnav_usertype');

  	AuthService.setApi('');
  	AuthService.setLogged(false);

  	$state.go('login');

  };

  });
