'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('ReportsCtrl', function($scope, $rootScope, $state, $timeout, $http, AuthService, leafletData, $q) {
	
	var api = AuthService.getApi();
  
	$scope.userType = AuthService.getUserType();
	
	$scope.reports = {};
	
	$scope.reports.couriers = {};
	$scope.reports.sectors = {};
	
	$scope.reports.coordinates = [];
	$scope.reports.products = {};
	
	$scope.reports.startDates = [];
	$scope.reports.endDates = [];
	
	$scope.reports.selectedCourier = null;
	$scope.reports.selectedStartDate = null;
	$scope.reports.selectedEndDate = null;
	$scope.reports.selectedSector = null;
	$scope.reports.productsCount = null;
	$scope.reports.traceDistance = null;
	$scope.reports.closedSectors = null;
	
	$scope.reports.startReports = function(){
		$http({
          method: 'GET',
          url: $rootScope.apiurl + '/get/list/courier',
          params: {api_token: api}
        }).then(function successCallback(response){
            console.log('couriers list: ', response);
				
					if(response.data.message == "You haven't permission!")
							$rootScope.logout();
				else{
					$http({
						method: 'GET',
						url: $rootScope.apiurl + '/get/list/sectors',
						params: {api_token: api}
					}).then(function successCallback(sectors){
							console.log(sectors);
						if(sectors.data.message == "You haven't permission!")
							$rootScope.logout();
						else{
							$scope.reports.sectors = sectors.data;
							
							$scope.reports.couriers = response.data;

							for(var i in $scope.reports.couriers){

								$scope.reports.couriers[i].fullName = $scope.reports.couriers[i].username + ' (' + $scope.reports.couriers[i].last_name + ' ' + $scope.reports.couriers[i].first_name + ' ' + $scope.reports.couriers[i].middle_name + ')';
								}
							
							
						}
					}, function errorCallback(error){
							console.log(error);
					});
            
				}
        });
	};
	
	$scope.reports.updateCoords = function(){
		$http({
  			method: 'GET',
  			url: $rootScope.apiurl + '/get/list/coordinates',
  			params: {api_token: api, user_id: $scope.reports.selectedCourier.id}
  		}).then(function(response){
				console.log('coords: ', response);
				if(response.data.message == "You haven't permission!")
							$rootScope.logout();
				else{
					console.log(response.data);
					var coords = response.data.coordResults;
					$scope.reports.coordinates = [];
					$scope.reports.products = {};
					$scope.reports.startDates = [];
					$scope.reports.endDates = [];
					var latitudes = [], longitudes = [], date, time, oldDate, oldLat, oldLng, coordNum = 0, latlngs = [];

				for(var coord in coords){
							var coordTime = new Date(coords[coord].date); 
							var formatTime = coordTime.getFullYear() + '-';
					
							if(parseInt(coordTime.getMonth()+1) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getMonth()+1) + '-';
							else
								formatTime = formatTime + parseInt(coordTime.getMonth()+1) + '-';
							if(parseInt(coordTime.getDate()) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getDate()) + 'T';
							else
								formatTime = formatTime + parseInt(coordTime.getDate()) + 'T';
					
							if(parseInt(coordTime.getHours()) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getHours()) + ':';
							else
								formatTime = formatTime + parseInt(coordTime.getHours()) + ':';
							if(parseInt(coordTime.getMinutes()) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getMinutes()) + ':';
							else
								formatTime = formatTime + parseInt(coordTime.getMinutes()) + ':';
							if(parseInt(coordTime.getSeconds()) < 10)
								formatTime = formatTime + '0' + parseInt(coordTime.getSeconds());
							else
								formatTime = formatTime + parseInt(coordTime.getSeconds());
					
							date = formatTime.substring(0, 10);
							time = formatTime.substring(11);

							if(date!==oldDate && coord!=0 && latlngs.length){
								latitudes = [];
								longitudes = [];
								latlngs = [];
								coordNum++;
							}


							if(parseFloat(coords[coord].latitude))
								latitudes.push(parseFloat(coords[coord].latitude));
							if(parseFloat(coords[coord].longitude))
								longitudes.push(parseFloat(coords[coord].longitude));
							if(parseFloat(coords[coord].latitude) && parseFloat(coords[coord].longitude)){
								latlngs.push({
									lat: parseFloat(coords[coord].latitude),
									lng: parseFloat(coords[coord].longitude),
									time: time,
									comment: coords[coord].comment,
									newsNum: coords[coord].news_num,
									isManual: coords[coord].isManual,
									isSuccess: coords[coord].isSuccess
								});

								$scope.reports.coordinates[coordNum] = {
									date: date,
									lat: latitudes,
									lng: longitudes,
									latlngs: latlngs,
									id: coordNum,
									disabled: false
								};

								$scope.reports.startDates[coordNum] = {
									date: date,
									lat: latitudes,
									lng: longitudes,
									latlngs: latlngs,
									id: coordNum,
									disabled: false
								};
								$scope.reports.endDates[coordNum] = {
									date: date,
									lat: latitudes,
									lng: longitudes,
									latlngs: latlngs,
									id: coordNum,
									disabled: false
								};	

							}

							oldDate = date;
					}
					
					console.log('all coords: ', $scope.reports.coordinates);
					
					var productsResults = response.data.prodResults, allProducts = [], cDate = "";
							
					for(var p in productsResults){
						if(productsResults[p].courier_id == $scope.reports.selectedCourier.id){
							productsResults[p].date = productsResults[p].date.substr(0, 10);
							allProducts.push(productsResults[p]);
						}
					}
					
					for(var p in allProducts){
						if(cDate != allProducts[p].date)
							cDate = allProducts[p].date;
						
						$scope.reports.products[cDate] = allProducts[p];
					}
					
					console.log($scope.reports.products);
				}
		});
	};
	
	$scope.reports.updateStartDate = function(){
		console.log($scope.reports.selectedStartDate, $scope.reports.selectedEndDate);
		if($scope.reports.selectedEndDate < $scope.reports.selectedStartDate)
			$scope.reports.selectedEndDate = null;
		for(var d in $scope.reports.endDates){
			if($scope.reports.endDates[d].id < $scope.reports.selectedStartDate.id){
				$scope.reports.endDates[d].disabled = true;
			} else{
				$scope.reports.endDates[d].disabled = false;
			}
		}
	};
	
	$scope.reports.updateEndDate = function(){
		if($scope.reports.selectedEndDate > $scope.reports.selectedStartDate)
			$scope.reports.selectedStartDate = null;
		for(var d in $scope.reports.startDates){
			if($scope.reports.startDates[d].id > $scope.reports.selectedEndDate.id){
				$scope.reports.startDates[d].disabled = true;
			} else{ 
				$scope.reports.startDates[d].disabled = false;
			}
		}
	};
	
	$scope.reports.showReport = function(){
		var productsC = 0, latlngs = 0, closedSectors = [];
		$scope.reports.productsCount = null;
		$scope.reports.closedSectors = null;
		$scope.reports.traceDistance = null;
		
		for(var d in $scope.reports.products){
			if(d >= $scope.reports.selectedStartDate.date && d <= $scope.reports.selectedEndDate.date && $scope.reports.products[d].courier_id == $scope.reports.selectedCourier.id && $scope.reports.selectedSector.id == $scope.reports.products[d].sector_id){
				productsC += $scope.reports.products[d].count;
			
				if(closedSectors.indexOf($scope.reports.products[d].sector_num) == -1){
					closedSectors.push($scope.reports.products[d].sector_num);
				}
			}
		}
		
		$scope.reports.productsCount = productsC;
		$scope.reports.closedSectors = closedSectors.join();
		
		for(var c in $scope.reports.coordinates){
			if($scope.reports.coordinates[c].id >= $scope.reports.selectedStartDate.id && $scope.reports.coordinates[c].id <= $scope.reports.selectedEndDate.id){
				latlngs += countLength($scope.reports.coordinates[c].latlngs);
			}
		}
		
		$scope.reports.traceDistance = Math.round(latlngs)/1000 + " км";
	};
	
	
	function countLength(coords){	
		var firstC = null, secondC = null, allCoords = [], R = 6371, length = 0;
		for(var c in coords){
			if(!coords[c].isManual)
				allCoords.push(coords[c]);
		}
		
		for(var a in allCoords){
			var index = (parseInt(a)+1).toString();
			if(a < (allCoords.length-1)){
				var R = 6371e3; // metres
				var f1 = allCoords[a].lat * Math.PI / 180;
				var f2 = allCoords[index].lat * Math.PI / 180;
				var lf = (allCoords[index].lat-allCoords[a].lat) * Math.PI / 180;
				var ll = (allCoords[index].lng-allCoords[a].lng) * Math.PI / 180;

				var a = Math.sin(lf/2) * Math.sin(lf/2) +
								Math.cos(f1) * Math.cos(f2) *
								Math.sin(ll/2) * Math.sin(ll/2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

				length += R * c;
			}
			
		}
		
		return length;
	}
	
});