'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('LoginCtrl', function($scope, $rootScope, $location, $http, $state, AuthService) {
    
    $scope.$state = $state;
    $scope.loginError = false;
    $scope.passError = false;
    $scope.remember = false;
    $scope.showAlertBox = false;

    var submited = false;
  
    $scope.submit = function() {
      submited = true;
      if($scope.login && $scope.pass){
        var data = {};

        data.username = $scope.login.trim();
        data.password = $scope.pass.trim();

        $http({
          method: 'POST',
          url: $rootScope.apiurl + '/login',
          data: data
        }).then(function successCallback(response){
          console.log(response);
           if(response.data.message==='Something went wrong'){
            $scope.showAlertBox = true;
           }
           else if(response.data.message.api && response.data.message.user_type === "courier"){
            alert('Access denied');
           }
           else if(response.data.message.api && response.data.message.user_type !== "courier"){

            if($scope.remember){
              $.cookie('gpsnav_api', response.data.message.api, { expires: 365 });
              $.cookie('gpsnav_usertype', response.data.message.user_type, { expires: 365 });
            }
            else{
              $.cookie('gpsnav_api', response.data.message.api);
              $.cookie('gpsnav_usertype', response.data.message.user_type);
            }

            AuthService.setApi(response.data.message.api);
            AuthService.setLogged(true);
            AuthService.setUserType(response.data.message.user_type);
            
            $state.go('dashboard');
           }
        }, function errorCallback(response){
              console.log(response);  
                });
      }
      else {
        if(!$scope.login)
          $scope.loginError = true;
        else
          $scope.loginError = false;
        if(!$scope.pass)
          $scope.passError = true;
        else
          $scope.passError = false;
      }
    }
    
    $scope.validate = function(){
      
      if(!$scope.login && submited)
          $scope.loginError = true;
        else
          $scope.loginError = false;
        if(!$scope.pass && submited)
          $scope.passError = true;
        else
          $scope.passError = false;
    }

  });
