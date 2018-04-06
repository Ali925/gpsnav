'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('WorkersCtrl', function($scope, $rootScope, $state, $timeout, $http, AuthService) {

  	var api = AuthService.getApi();
  	$scope.userType = AuthService.getUserType();

    $scope.initWorkersPage = function(){

      $('.closed-sidebar + .main').removeClass('no-scroll');
    };

  	$scope.workers = {};

  	$scope.workers.configM = {
	    itemsPerPage: 5,
	    fillLastPage: true
	  };

    $scope.workers.configC = {
      itemsPerPage: 5,
      fillLastPage: true
    };

	 $scope.workers.managerScreen = '1';
	 $scope.workers.courierScreen = '1';

	 $scope.workers.managersList = [];
	 $scope.workers.couriersList = [];

	 $scope.workers.showEditManagerForm = false;
	 $scope.workers.showEditCourierForm = false;

	 $scope.workers.newManager = {};

	 $scope.workers.newCourier = {}; 

	 $scope.workers.datepickerOptionsM = {
    	 showWeeks: false,
    	 opened: false,
    	 open: function(){
    	 	this.opened = true;
    	 }
	 };

   $scope.workers.datepickerOptionsC = {
       showWeeks: false,
       opened: false,
       open: function(){
        this.opened = true;
       }
   };

  	$scope.workers.addNewManager = function(){

      if($scope.workers.newManager.username && $scope.workers.newManager.name && $scope.workers.newManager.middlename && $scope.workers.newManager.surname && $scope.workers.newManager.branch && $scope.workers.newManager.email && $scope.workers.newManager.phone && $scope.workers.newManager.date){
        var date = new Date($scope.workers.newManager.date).getTime();

        var params = {
          api_token: api,
          email: $scope.workers.newManager.email,
          phone: $scope.workers.newManager.phone,
          username: $scope.workers.newManager.username,
          password: $scope.workers.newManager.password,
          first_name: $scope.workers.newManager.name,
          middle_name: $scope.workers.newManager.middlename,
          last_name: $scope.workers.newManager.surname,
          filial_id: $scope.workers.newManager.branch,
          date_start_work: date.toString()
        };

      $http({
        method: 'POST',
        url: $rootScope.apiurl + '/add/manager',
        data: params
      }).then(function successCallback(response){
        console.log(response);  
				if(response.data.message == "You haven't permission!")
							$rootScope.logout();
        else if(response.data==="success"){
          $scope.workers.managerScreen = '1';
          $scope.workers.newManager = {};

          $scope.updateWorkers();
        }

      }, function errorCallback(response){
        console.log(response);
      });  

      }
      else {
        if(!$scope.workers.newManager.username)
          $scope.workers.newManager.usernameE = true;
        else
          $scope.workers.newManager.usernameE = false;
        if(!$scope.workers.newManager.name)
          $scope.workers.newManager.nameE = true;
        else
          $scope.workers.newManager.nameE = false;
        if(!$scope.workers.newManager.middlename)
          $scope.workers.newManager.middlenameE = true;
        else
          $scope.workers.newManager.middlenameE = false;
        if(!$scope.workers.newManager.surname)
          $scope.workers.newManager.surnameE = true;
        else
          $scope.workers.newManager.surnameE = false;
        if(!$scope.workers.newManager.branch)
          $scope.workers.newManager.branchE = true;
        else
          $scope.workers.newManager.branchE = false;
        if(!$scope.workers.newManager.email)
          $scope.workers.newManager.emailE = true;
        else
          $scope.workers.newManager.emailE = false;
        if(!$scope.workers.newManager.phone)
          $scope.workers.newManager.phoneE = true;
        else
          $scope.workers.newManager.phoneE = false;
        if(!$scope.workers.newManager.date) 
          $scope.workers.newManager.dateE = true;
        else
          $scope.workers.newManager.dateE = false;
      }

  				


  	};


  	$scope.workers.addNewCourier = function(){
if($scope.workers.newCourier.username && $scope.workers.newCourier.name && $scope.workers.newCourier.middlename && $scope.workers.newCourier.surname && $scope.workers.newCourier.branch && $scope.workers.newCourier.passcode && $scope.workers.newCourier.email && $scope.workers.newCourier.phone && $scope.workers.newCourier.date && ($scope.userType!=='manager' && $scope.workers.newCourier.manager || $scope.userType=='manager')){
  		var date = new Date($scope.workers.newCourier.date).getTime();

  		var params = {
  			api_token: api,
  			email: $scope.workers.newCourier.email,
				passcode: $scope.workers.newCourier.passcode,
  			phone: $scope.workers.newCourier.phone,
  			username: $scope.workers.newCourier.username,
  			password: $scope.workers.newCourier.password,
  			first_name: $scope.workers.newCourier.name,
  			middle_name: $scope.workers.newCourier.middlename,
  			last_name: $scope.workers.newCourier.surname,
  			filial_id: $scope.workers.newCourier.branch,
  			date_start_work: date.toString()
  		};

  		if($scope.userType!=='manager')
  			params.manager_id = $scope.workers.newCourier.manager.id;

		$http({
			method: 'POST',
			url: $rootScope.apiurl + '/add/courier',
			data: params
		}).then(function successCallback(response){
			console.log(response);	
			if(response.data.message == "You haven't permission!")
							$rootScope.logout();
			else if(response.data==="success"){
				$scope.workers.courierScreen = '1';
				$scope.workers.newCourier = {};

				$scope.updateWorkers();
			}

		}, function errorCallback(response){
			console.log(response);
		});  
}
else {
        if(!$scope.workers.newCourier.username)
          $scope.workers.newCourier.usernameE = true;
        else
          $scope.workers.newCourier.usernameE = false;
        if(!$scope.workers.newCourier.name)
          $scope.workers.newCourier.nameE = true;
        else
          $scope.workers.newCourier.nameE = false;
        if(!$scope.workers.newCourier.middlename)
          $scope.workers.newCourier.middlenameE = true;
        else
          $scope.workers.newCourier.middlenameE = false;
        if(!$scope.workers.newCourier.surname)
          $scope.workers.newCourier.surnameE = true;
        else
          $scope.workers.newCourier.surnameE = false;
        if(!$scope.workers.newCourier.branch)
          $scope.workers.newCourier.branchE = true;
        else
          $scope.workers.newCourier.branchE = false;
        if(!$scope.workers.newCourier.email)
          $scope.workers.newCourier.emailE = true;
        else
          $scope.workers.newCourier.emailE = false;
				if(!$scope.workers.newCourier.passcode)
          $scope.workers.newCourier.passcodeE = true;
        else
          $scope.workers.newCourier.passcodeE = false;
        if(!$scope.workers.newCourier.phone)
          $scope.workers.newCourier.phoneE = true;
        else
          $scope.workers.newCourier.phoneE = false;
        if(!$scope.workers.newCourier.date) 
          $scope.workers.newCourier.dateE = true;
        else
          $scope.workers.newCourier.dateE = false;
        if($scope.userType!=='manager' && !$scope.workers.newCourier.manager)
          $scope.workers.newCourier.managerE = true;
        else
          $scope.workers.newCourier.managerE = false;
      }

  	};

  	$scope.workers.removeManager = function(id){
  		
  		$http({
  			method: 'POST',
  			url: $rootScope.apiurl + '/del/manager',
  			data: {api_token: api, user_id: id}
  		}).then(function successCallback(response){
  			console.log(response);
				if(response.data.message == "You haven't permission!")
							$rootScope.logout();
  			else if(response.data == 'success'){
  				$scope.workers.managerScreen = '1';

				$scope.updateWorkers();
  			}

  		}, function errorCallback(response){

  		});
  	};

  	$scope.workers.removeCourier = function(id){
  		
  		$http({
  			method: 'POST',
  			url: $rootScope.apiurl + '/del/courier',
  			data: {api_token: api, user_id: id}
  		}).then(function successCallback(response){
  			console.log(response);
				if(response.data.message == "You haven't permission!")
							$rootScope.logout();
  			else if(response.data == 'success'){
  				$scope.workers.courierScreen = '1';

				$scope.updateWorkers();
  			}
  			
  		}, function errorCallback(response){

  		});
  	};

  	$scope.workers.showEditManager= function(id){

  		for(var i in $scope.workers.managersList){
  			if($scope.workers.managersList[i].id == id){
  				$scope.workers.currentManager = $scope.workers.managersList[i];
  				break;
  			}
  		}
  		
  		$scope.workers.editManager = {
  			username: $scope.workers.currentManager.username,
  			password: '',
  			name: $scope.workers.currentManager.first_name,
  			surname: $scope.workers.currentManager.last_name,
  			middlename: $scope.workers.currentManager.middle_name,
  			email:$scope.workers.currentManager.email,
  			phone: $scope.workers.currentManager.phone,
  			branch: $scope.workers.currentManager.filial_id,
  			date: $scope.workers.currentManager.date_start_work
  		};

  		$scope.workers.showEditManagerForm = true;
  	
  	};

  	$scope.workers.editCurrentManager = function(){

      if($scope.workers.editManager.username && $scope.workers.editManager.name && $scope.workers.editManager.middlename && $scope.workers.editManager.surname && $scope.workers.editManager.branch && $scope.workers.editManager.email && $scope.workers.editManager.phone && $scope.workers.editManager.date){
  		var date = new Date($scope.workers.editManager.date).getTime();

  		var params = {
  			api_token: api,
  			user_id: $scope.workers.currentManager.id,
  			email: $scope.workers.editManager.email,
  			phone: $scope.workers.editManager.phone,
  			username: $scope.workers.editManager.username,
  			password: $scope.workers.editManager.password,
  			first_name: $scope.workers.editManager.name,
  			middle_name: $scope.workers.editManager.middlename,
  			last_name: $scope.workers.editManager.surname,
  			filial_id: $scope.workers.editManager.branch,
  			date_start_work: date.toString()
  		};

		$http({
			method: 'POST',
			url: $rootScope.apiurl + '/edit/manager',
			data: params
		}).then(function successCallback(response){
			console.log(response);	
			if(response.data.message == "You haven't permission!")
							$rootScope.logout();
			else if(response.data==="success"){
				$scope.workers.managerScreen = '1';
				$scope.workers.showEditManagerForm = false;

				$scope.updateWorkers();
			}

		}, function errorCallback(response){
			console.log(response);
		});
      }
      else {
        if(!$scope.workers.editManager.username)
          $scope.workers.editManager.usernameE = true;
        else
          $scope.workers.editManager.usernameE = false;
        if(!$scope.workers.editManager.name)
          $scope.workers.editManager.nameE = true;
        else
          $scope.workers.editManager.nameE = false;
        if(!$scope.workers.editManager.middlename)
          $scope.workers.editManager.middlenameE = true;
        else
          $scope.workers.editManager.middlenameE = false;
        if(!$scope.workers.editManager.surname)
          $scope.workers.editManager.surnameE = true;
        else
          $scope.workers.editManager.surnameE = false;
        if(!$scope.workers.editManager.branch)
          $scope.workers.editManager.branchE = true;
        else
          $scope.workers.editManager.branchE = false;
        if(!$scope.workers.editManager.email)
          $scope.workers.editManager.emailE = true;
        else
          $scope.workers.editManager.emailE = false;
        if(!$scope.workers.editManager.phone)
          $scope.workers.editManager.phoneE = true;
        else
          $scope.workers.editManager.phoneE = false;
        if(!$scope.workers.editManager.date) 
          $scope.workers.editManager.dateE = true;
        else
          $scope.workers.editManager.dateE = false;
      }

  	};

  	$scope.workers.showCourierEdit= function(id){

  		for(var i in $scope.workers.couriersList){
  			if($scope.workers.couriersList[i].id == id){
  				$scope.workers.currentCourier = $scope.workers.couriersList[i];
  				break;
  			}
  		}
  		
  		$scope.workers.editCourier = {
  			username: $scope.workers.currentCourier.username,
  			password: '',
  			name: $scope.workers.currentCourier.first_name,
  			surname: $scope.workers.currentCourier.last_name,
  			middlename: $scope.workers.currentCourier.middle_name,
  			email:$scope.workers.currentCourier.email,
				passcode: $scope.workers.currentCourier.passcode,
  			phone: $scope.workers.currentCourier.phone,
  			branch: $scope.workers.currentCourier.filial_id,
  			date: $scope.workers.currentCourier.date_start_work
  		};

  		if($scope.userType!=='manager'){
  			for(var i in $scope.workers.managersList){
  				if($scope.workers.managersList[i].id==$scope.workers.currentCourier.manager_id){
  					$scope.workers.editCourier.manager = $scope.workers.managersList[i];
  					break;
  				}
  			}
  		}

  		$scope.workers.showCourierEditForm = true;
  	
  	};

  	$scope.workers.editCurrentCourier = function(){
      
      if($scope.workers.editCourier.username && $scope.workers.editCourier.name && $scope.workers.editCourier.middlename && $scope.workers.editCourier.surname && $scope.workers.editCourier.branch && $scope.workers.editCourier.email && $scope.workers.editCourier.phone && $scope.workers.editCourier.date){
  
      if($scope.userType!=='manager' && $scope.workers.editCourier.manager || $scope.userType=='manager'){

  		var date = new Date($scope.workers.editCourier.date).getTime();

  		var params = {
  			api_token: api,
  			user_id: $scope.workers.currentCourier.id,
  			email: $scope.workers.editCourier.email,
				passcode: $scope.workers.editCourier.passcode,
  			phone: $scope.workers.editCourier.phone,
  			username: $scope.workers.editCourier.username,
  			password: $scope.workers.editCourier.password,
  			first_name: $scope.workers.editCourier.name,
  			middle_name: $scope.workers.editCourier.middlename,
  			last_name: $scope.workers.editCourier.surname,
  			filial_id: $scope.workers.editCourier.branch,
  			date_start_work: date.toString()
  		};

  		if($scope.userType!=='manager')
  			params.manager_id = $scope.workers.editCourier.manager.id;

		$http({
			method: 'POST',
			url: $rootScope.apiurl + '/edit/courier',
			data: params
		}).then(function successCallback(response){
			console.log(response);	
			if(response.data.message == "You haven't permission!")
							$rootScope.logout();
			else if(response.data==="success"){
				$scope.workers.courierScreen = '1';
				$scope.workers.showCourierEditForm = false;

				$scope.updateWorkers();
			}

		}, function errorCallback(response){
			console.log(response);
		});
        
        }
  else{
    if(!$scope.workers.editCourier.manager)
          $scope.workers.editCourier.managerE = true;
        else
          $scope.workers.editCourier.managerE = false;
  }
}
else {
        if(!$scope.workers.editCourier.username)
          $scope.workers.editCourier.usernameE = true;
        else
          $scope.workers.editCourier.usernameE = false;
        if(!$scope.workers.editCourier.name)
          $scope.workers.editCourier.nameE = true;
        else
          $scope.workers.editCourier.nameE = false;
        if(!$scope.workers.editCourier.middlename)
          $scope.workers.editCourier.middlenameE = true;
        else
          $scope.workers.editCourier.middlenameE = false;
        if(!$scope.workers.editCourier.surname)
          $scope.workers.editCourier.surnameE = true;
        else
          $scope.workers.editCourier.surnameE = false;
        if(!$scope.workers.editCourier.branch)
          $scope.workers.editCourier.branchE = true;
        else
          $scope.workers.editCourier.branchE = false;
        if(!$scope.workers.editCourier.email)
          $scope.workers.editCourier.emailE = true;
        else
          $scope.workers.editCourier.emailE = false;
				if(!$scope.workers.editCourier.passcode)
          $scope.workers.editCourier.passcodeE = true;
        else
          $scope.workers.editCourier.passcodeE = false;
        if(!$scope.workers.editCourier.phone)
          $scope.workers.editCourier.phoneE = true;
        else
          $scope.workers.editCourier.phoneE = false;
        if(!$scope.workers.editCourier.date) 
          $scope.workers.editCourier.dateE = true;
        else
          $scope.workers.editCourier.dateE = false;
        if($scope.userType!=='manager' && !$scope.workers.editCourier.manager)
          $scope.workers.editCourier.managerE = true;
        else
          $scope.workers.editCourier.managerE = false;
      }

  	};

  	$scope.updateWorkers = function(){
		 if($scope.userType == 'administrator'){
	  	$http({
	  		method: 'GET',
	  		url: $rootScope.apiurl + '/get/list/manager',
	  		params: {api_token: api}
	  	}).then(function successCallback(response){
	  		console.log(response);
				if(response.data.message == "You haven't permission!")
							$rootScope.logout();
				else{
					if(response.data.message!='Permission denied'){
						$scope.workers.managersList = response.data;

						for(var i in $scope.workers.managersList){

							$scope.workers.managersList[i].fullName = $scope.workers.managersList[i].last_name + ' ' + $scope.workers.managersList[i].first_name + ' ' + $scope.workers.managersList[i].middle_name;
							var date = new Date(parseInt($scope.workers.managersList[i].date_start_work));
							$scope.workers.managersList[i].date_start_work = $.format.date(date, "yyyy/MM/dd");

						}
				}

					$http({
						method: 'GET',
						url: $rootScope.apiurl + '/get/list/courier',
						params: {api_token: api}
					}).then(function successCallback(response){
						console.log(response);
						if(response.data.message == "You haven't permission!")
							$rootScope.logout();
						else if(response.data.message!='Permission denied'){
							$scope.workers.couriersList = response.data;

							for(var i in $scope.workers.couriersList){

								$scope.workers.couriersList[i].fullName = $scope.workers.couriersList[i].last_name + ' ' + $scope.workers.couriersList[i].first_name + ' ' + $scope.workers.couriersList[i].middle_name;
								var date = new Date(parseInt($scope.workers.couriersList[i].date_start_work));
								$scope.workers.couriersList[i].date_start_work = $.format.date(date, "yyyy/MM/dd");

								for(var j in $scope.workers.managersList){
									if($scope.workers.managersList[j].id == $scope.workers.couriersList[i].manager_id){
										$scope.workers.couriersList[i].managerName = $scope.workers.managersList[j].fullName;
										break;
									}
								}

							}

					 }
					}, function errorCallback(response){
						console.log(response);
					});
				}
	  	}, function errorCallback(response){
	  		console.log(response);
	  	});
		 } else {
			 
			 $http({
						method: 'GET',
						url: $rootScope.apiurl + '/get/list/courier',
						params: {api_token: api}
					}).then(function successCallback(response){
						console.log(response);
						if(response.data.message == "You haven't permission!")
							$rootScope.logout();
						else if(response.data.message!='Permission denied'){
							$scope.workers.couriersList = response.data;

							for(var i in $scope.workers.couriersList){

								$scope.workers.couriersList[i].fullName = $scope.workers.couriersList[i].last_name + ' ' + $scope.workers.couriersList[i].first_name + ' ' + $scope.workers.couriersList[i].middle_name;
								var date = new Date(parseInt($scope.workers.couriersList[i].date_start_work));
								$scope.workers.couriersList[i].date_start_work = $.format.date(date, "yyyy/MM/dd");

								for(var j in $scope.workers.managersList){
									if($scope.workers.managersList[j].id == $scope.workers.couriersList[i].manager_id){
										$scope.workers.couriersList[i].managerName = $scope.workers.managersList[j].fullName;
										break;
									}
								}

							}

					 }
					}, function errorCallback(response){
						console.log(response);
					});
			 
		 }
	  };

  	
  });