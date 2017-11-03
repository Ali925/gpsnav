'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('yapp')
  .controller('SectorsCtrl', function($scope, $rootScope, $state, $timeout, $http, AuthService, leafletData, $q) {
	
	var api = AuthService.getApi();
  
	$scope.userType = AuthService.getUserType();
	
	$scope.map = {};
	$scope.sectors = {};
	
	var geocoder, geocontrol, numberMarkers = [], isMarkerClicked = false, selectedSectorID, isFirstSector = true, newSectorID;

    $scope.map.center = {
      lat: 25,
      lng: 50,
      zoom: 2
    };
		$scope.map.defaults = {
				doubleClickZoom: false,
			 	scrollWheelZoom: true,
				attributionControl: true
		};
//  	$scope.map.tiles = {};
		$scope.map.layers = {};
  	$scope.map.height = $(window).height()*0.82 + 'px';

//  	var auth_token = 'pk.eyJ1IjoiYWxpOTI1IiwiYSI6ImNpcHZobHIxMzAwNTZpMWtzcmFrdmk2OXcifQ.7AB_LOCsVI6kUn_vPDUXkg';
//
//  	$scope.map.tiles.url = 'https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + auth_token;
	
		$scope.map.layers.overlays = {};
	
		$scope.map.layers.baselayers = {
				mapboxGlLayer: {
					name: 'Sample',
					type: 'mapboxGL',
					layerOptions: {
						accessToken: 'pk.eyJ1IjoiZ3JlZW5jaDRhbGV4IiwiYSI6ImNpa242d2dtMzAwOGh3YW02dDd6eGIwb28ifQ.V8B9D1mUvD21JCkPRxpKxA',
						style: 'mapbox://styles/greench4alex/cita9atqv000e2hr7v4htiycv'
					}
				}
			};

  	$scope.map.initMap = function(){

      $('.closed-sidebar + .main').addClass('no-scroll');

                  leafletData.getMap().then(function(map) {

                   geocoder = L.Control.Geocoder.google(); 
                   geocontrol = L.Control.geocoder({
                                          geocoder: geocoder
                                        }).addTo(map);

        }); 
     
    };

    $scope.map.paths = {};

    $scope.map.markers = {};
	
		$scope.map.events = {
            map: {
                enable: ['click', 'dblclick'],
                logic: 'emit'
            }
        };
		
		$scope.sectors.loadedSectors = [];
		$scope.sectors.selectedSector = null;
		$scope.sectors.editSectorStarted = false;
		$scope.sectors.isEditable = false;
	
		var sectorPoints = 1; 
		$scope.sectors.sectorNum = 1;
		$scope.sectors.sectorTitle = null;

    $scope.$on('leafletDirectiveMap.click', function(event, args){
        //console.log("Click", args.leafletEvent.latlng);
				var key = false;
				isMarkerClicked = false;
				if($scope.sectors.addNewSectorStarted || $scope.sectors.editSectorStarted){
					if(sectorPoints == 1){
						$scope.map.markers[sectorPoints] = {
									lat: args.leafletEvent.latlng.lat,
									lng: args.leafletEvent.latlng.lng,
									focus: false,
									draggable: false
							};
						$scope.map.paths["p"+$scope.sectors.sectorNum] = {
							color: 'red',
							weight: 4,
							latlngs: []
						};
						$scope.map.paths["p"+$scope.sectors.sectorNum].latlngs.push({
								lat: args.leafletEvent.latlng.lat,
								lng: args.leafletEvent.latlng.lng
							});
						//console.log(sectorPoints);
						sectorPoints++;
					} else {
						for(var i in $scope.map.markers){
							if($scope.map.markers[i].lat == args.leafletEvent.latlng.lat && $scope.map.markers[i].lng == args.leafletEvent.latlng.lng){
								key = true;
								break;
							}
						}
						if(!key){
							$scope.map.markers[sectorPoints] = {
										lat: args.leafletEvent.latlng.lat,
										lng: args.leafletEvent.latlng.lng,
										icon: {
												iconUrl: '../../images/flag.png',
												iconSize: [40, 40],
												iconAnchor: [20, 40],
												popupAnchor: [0, 0],
												shadowSize: [0, 0],
												shadowAnchor: [0, 0]
										},
										focus: false,
										draggable: false
								};
							
							$scope.map.paths["p"+$scope.sectors.sectorNum].latlngs.push({
								lat: args.leafletEvent.latlng.lat,
								lng: args.leafletEvent.latlng.lng
							});
						//console.log(sectorPoints);
						sectorPoints++;
						}
					}
					
				} 
    });
	
		$scope.$on('leafletDirectiveMarker.click', function(event, args){
					//console.log('Marker: ', event, args);
				isMarkerClicked = false;
				if($scope.sectors.addNewSectorStarted || $scope.sectors.editSectorStarted){
					if(args.modelName == "1" && sectorPoints > 3){
						if($scope.sectors.addNewSectorStarted && $scope.sectors.sectorTitle || $scope.sectors.editSectorStarted && $scope.sectors.selectedSector.title){
						$timeout(function(){
							if(!isMarkerClicked){
								$scope.map.paths["p"+$scope.sectors.sectorNum].latlngs.push({
									lat: args.model.lat,
									lng: args.model.lng
								});
							$scope.map.markers = {};

							var centroid = getCentroid($scope.map.paths["p"+$scope.sectors.sectorNum].latlngs);

							numberMarkers.push({
								lat: centroid[0],
								lng: centroid[1],
								icon: {
													 type: 'div',
													 iconSize: [0, 0],
													 html: '<b>'+$scope.sectors.sectorNum+'</b>',
													 iconAnchor:  [0, 0]
											},
								focus: false,
								draggable: false
							});
							for(var i=1;i<=$scope.sectors.sectorNum;i++){
								$scope.map.markers['num'+i] = numberMarkers[i-1];
							}

							sectorPoints = 1;
							$scope.sectors.sectorNum++;
							
							if($scope.sectors.addNewSectorStarted && isFirstSector){
								isFirstSector = false;
									var data = {
										api_token: api,
										sectorTitle: $scope.sectors.sectorTitle,
										sectorCoords: $scope.map.paths
									};

									$http({
										method: 'POST',
										url: $rootScope.apiurl + '/add/sectors',
										data: data
									}).then(function successCallback(response){
											console.log(response);
										if(response.data.message == "You haven't permission!")
												$rootScope.logout();
										else if(response.data.message == 'success'){
											newSectorID = response.data.id;
										}
									}, function errorCallback(error){
											console.log(error);
									});
							} else if($scope.sectors.addNewSectorStarted && !isFirstSector){
								var data = {
									api_token: api,
									sectorID: newSectorID,
									sectorTitle: $scope.sectors.sectorTitle,
									sectorCoords: $scope.map.paths
								};
								$http({
									method: 'POST',
									url: $rootScope.apiurl + '/edit/sectors',
									data: data
								}).then(function successCallback(response){
										console.log(response);
									if(response.data.message == "You haven't permission!")
												$rootScope.logout();
									else if(response.data == 'success'){
											//updateSectors('edit');
										}
								}, function errorCallback(error){
										console.log(error);
								});
							} else {
								var data = {
											api_token: api,
											sectorID: $scope.sectors.selectedSector.id,
											sectorTitle: $scope.sectors.selectedSector.title,
											sectorCoords: $scope.sectors.selectedSector.coords
										};
										selectedSectorID = $scope.sectors.selectedSector.id;
										$http({
											method: 'POST',
											url: $rootScope.apiurl + '/edit/sectors',
											data: data
										}).then(function successCallback(response){
												console.log(response);
											if(response.data.message == "You haven't permission!")
														$rootScope.logout();
											else if(response.data == 'success'){
													//updateSectors('edit');
												}
										}, function errorCallback(error){
												console.log(error);
										});
							}
						} 
						}, 300);
						} else if ($scope.sectors.addNewSectorStarted){
							$scope.sectors.tooltipAddShow = true;
						} else if($scope.sectors.editSectorStarted){
							$scope.sectors.tooltipEditShow = true;
						}
					}
				} 
		});
	
		$scope.$on('leafletDirectivePath.click', function (event, args) {
          //console.log('Path: ', event, args);
					var key = false;
					isMarkerClicked = false;
					if($scope.sectors.addNewSectorStarted || $scope.sectors.editSectorStarted){
						if(sectorPoints == 1){
							$scope.map.markers[sectorPoints] = {
										lat: args.leafletEvent.latlng.lat,
										lng: args.leafletEvent.latlng.lng,
										focus: false,
										draggable: false
								};
							$scope.map.paths["p"+$scope.sectors.sectorNum] = {
								color: 'red',
								weight: 4,
								latlngs: []
							};
							$scope.map.paths["p"+$scope.sectors.sectorNum].latlngs.push({
									lat: args.leafletEvent.latlng.lat,
									lng: args.leafletEvent.latlng.lng
								});
							//console.log(sectorPoints);
							sectorPoints++;
						} else {
							for(var i in $scope.map.markers){
								if($scope.map.markers[i].lat == args.leafletEvent.latlng.lat && $scope.map.markers[i].lng == args.leafletEvent.latlng.lng){
									key = true;
									break;
								}
							}
							if(!key){
								$scope.map.markers[sectorPoints] = {
											lat: args.leafletEvent.latlng.lat,
											lng: args.leafletEvent.latlng.lng,
											icon: {
													iconUrl: '../../images/flag.png',
													iconSize: [40, 40],
													iconAnchor: [20, 40],
													popupAnchor: [0, 0],
													shadowSize: [0, 0],
													shadowAnchor: [0, 0]
											},
											focus: false,
											draggable: false
									};

								$scope.map.paths["p"+$scope.sectors.sectorNum].latlngs.push({
									lat: args.leafletEvent.latlng.lat,
									lng: args.leafletEvent.latlng.lng
								});
							//console.log(sectorPoints);
							sectorPoints++;
							}
						}
				} 
    });
	
		$scope.$on('leafletDirectiveMarker.dblclick', function(event, args){
        //console.log("DoubleClick", args);
				
				if(args.modelName.indexOf('num') == -1 && $scope.sectors.addNewSectorStarted || $scope.sectors.editSectorStarted){
					if(args.modelName == '1')
					 isMarkerClicked = true;
						var key = false;
					for(var i in $scope.map.markers){
						if(i == args.modelName){
							key = true;
							sectorPoints = parseInt(i);
						}
						
						if(key && i.indexOf('num') == -1){
							$scope.map.paths["p"+$scope.sectors.sectorNum].latlngs.splice((sectorPoints-1), 1);
							delete $scope.map.markers[i];
						}
					}
					if(!$scope.map.paths["p"+$scope.sectors.sectorNum].latlngs.length)
						delete $scope.map.paths["p"+$scope.sectors.sectorNum];
				}
    });
	
		$scope.sectors.addNewSectorStarted = false;
	
		$scope.sectors.initSectors = function(type){
			$http({
					method: 'GET',
					url: $rootScope.apiurl + '/get/list/sectors',
					params: {api_token: api}
				}).then(function successCallback(response){
						console.log(response);
						if(response.data.message == "You haven't permission!")
							$rootScope.logout();
						else{
							for(var i in response.data){
								response.data[i].coords = response.data[i].coords;
							}
							$scope.sectors.loadedSectors = response.data;
							
							if(type == 'cancel'){
								for(var s in $scope.sectors.loadedSectors){
											if($scope.sectors.loadedSectors[s].id == selectedSectorID){
												$scope.sectors.selectedSector = $scope.sectors.loadedSectors[s];
												break;
											}
										}

								$scope.sectors.updateMap();
							} else if(type == 'edit'){
								for(var s in $scope.sectors.loadedSectors){
										if($scope.sectors.loadedSectors[s].id == selectedSectorID){
											$scope.sectors.selectedSector = $scope.sectors.loadedSectors[s];
											break;
										}
								}
								$scope.sectors.updateMap();
							}
						}
				}, function errorCallback(error){
						console.log(error);
				});
		};
	
		$scope.sectors.updateMap = function(){
			//console.log($scope.sectors.selectedSector);
			
			$scope.map.paths = {};
			$scope.map.markers = {};
			
			sectorPoints = 1, numberMarkers = [], isMarkerClicked = false; 
			
			$scope.sectors.sectorNum = 1;
			
			$scope.map.paths = $scope.sectors.selectedSector.coords;
			var allCoords = [];
			
			for(var i in $scope.map.paths){
				
				var centroid = getCentroid($scope.map.paths[i].latlngs);
				allCoords.push({
					lat: centroid[0],
					lng: centroid[1]
				});
				var res = i.substring(1);
				
							numberMarkers.push({
								lat: centroid[0],
								lng: centroid[1],
								icon: {
													 type: 'div',
													 iconSize: [0, 0],
													 html: '<b>'+res+'</b>',
													 iconAnchor:  [0, 0]
											},
								focus: false,
								draggable: false
							});

							$scope.map.markers['num'+parseInt(res)] = numberMarkers[parseInt(res)-1];

			}
			
			var centerCoord = getCentroid(allCoords);
			//console.log(centerCoord, allCoords);
			if(allCoords.length < 3)
				centerCoord = [allCoords[0].lat, allCoords[0].lng];
			$scope.map.center = {
				lat: centerCoord[0],
				lng: centerCoord[1],
				zoom: 14
			};
			
			if($scope.sectors.selectedSector.editable)
				$scope.sectors.isEditable = true;
			else
				$scope.sectors.isEditable = false;
		};
	
		$scope.sectors.addNew = function(){
			$scope.sectors.addNewSectorStarted = true;
			$scope.sectors.selectedSector = null;
			isFirstSector = true;
			
			$scope.map.paths = {};
			$scope.map.markers = {};
			
			sectorPoints = 1, numberMarkers = [], isMarkerClicked = false; 
			
			$scope.sectors.sectorNum = 1;
		};
		
		$scope.sectors.saveNew = function(){
			if($scope.sectors.sectorTitle && $scope.map.paths["p1"] && $scope.map.paths["p1"].latlngs.length && !$scope.map.markers[1]){
				var data = {
					api_token: api,
					sectorTitle: $scope.sectors.sectorTitle,
					sectorCoords: $scope.map.paths
				};
				
				$http({
					method: 'POST',
					url: $rootScope.apiurl + '/add/sectors',
					data: data
				}).then(function successCallback(response){
						console.log(response);
					if(response.data.message == "You haven't permission!")
							$rootScope.logout();
					else if(response.data == 'success'){
						updateSectors();
					}
				}, function errorCallback(error){
						console.log(error);
				});
			}
		};
	
		$scope.sectors.cancelAddNew = function(){
			if($scope.sectors.sectorTitle && $scope.map.paths["p1"] && $scope.map.paths["p1"].latlngs.length && !$scope.map.markers[1]){
				if(!isFirstSector){
								var data = {
									api_token: api,
									sectorID: newSectorID,
									sectorTitle: $scope.sectors.sectorTitle,
									sectorCoords: $scope.map.paths
								};
								$http({
									method: 'POST',
									url: $rootScope.apiurl + '/edit/sectors',
									data: data
								}).then(function successCallback(response){
										console.log(response);
									if(response.data.message == "You haven't permission!")
												$rootScope.logout();
									else if(response.data == 'success'){
											//updateSectors('edit');
											$scope.sectors.addNewSectorStarted = false;
											$scope.sectors.selectedSector = null;
											$scope.sectors.sectorTitle = '';

											$scope.map.paths = {};
											$scope.map.markers = {};

											sectorPoints = 1, numberMarkers = [], isMarkerClicked = false; 

											$scope.sectors.sectorNum = 1;
											updateSectors();
										}
								}, function errorCallback(error){
										console.log(error);
								});
				} 
				
			} else {
				$scope.sectors.addNewSectorStarted = false;
				$scope.sectors.selectedSector = null;
				$scope.sectors.sectorTitle = '';

				$scope.map.paths = {};
				$scope.map.markers = {};

				sectorPoints = 1, numberMarkers = [], isMarkerClicked = false; 

				$scope.sectors.sectorNum = 1;
				updateSectors();
			}
		};
	
		$scope.sectors.removeLastSector = function(){
			if($scope.map.markers[1]){
				sectorPoints = 1;
				for(var m in $scope.map.markers){
					if(m.indexOf('num') == -1)
						delete $scope.map.markers[m];
				}
				delete $scope.map.paths["p"+$scope.sectors.sectorNum];
			}
			delete $scope.map.paths["p"+($scope.sectors.sectorNum-1)];
			delete $scope.map.markers["num" + ($scope.sectors.sectorNum-1)];
			numberMarkers.splice((numberMarkers.length-1), 1);
			$scope.sectors.sectorNum--;
		};
	
		$scope.sectors.removeSector = function(){
			$http({
				method: 'POST',
				url: $rootScope.apiurl + '/del/sectors',
				data: {api_token: api, sectorID: $scope.sectors.selectedSector.id}
			}).then(function successCallback(response){
					console.log(response);
				if(response.data.message == "You haven't permission!")
							$rootScope.logout();
				else if(response.data == 'success'){
						updateSectors();
					}
			}, function errorCallback(error){
					console.log(error);
			});
		};
	
		$scope.sectors.editSector = function(){
			$scope.sectors.editSectorStarted = true;
			
			$scope.sectors.sectorNum = Object.keys($scope.sectors.selectedSector.coords).length + 1;
		};
	
		$scope.sectors.saveEdit = function(){
			if($scope.sectors.selectedSector.title && $scope.sectors.selectedSector.coords["p1"] && $scope.map.paths["p1"].latlngs.length && !$scope.map.markers[1]){
				var data = {
					api_token: api,
					sectorID: $scope.sectors.selectedSector.id,
					sectorTitle: $scope.sectors.selectedSector.title,
					sectorCoords: $scope.sectors.selectedSector.coords
				};
				selectedSectorID = $scope.sectors.selectedSector.id;
				$http({
					method: 'POST',
					url: $rootScope.apiurl + '/edit/sectors',
					data: data
				}).then(function successCallback(response){
						console.log(response);
					if(response.data.message == "You haven't permission!")
								$rootScope.logout();
					else if(response.data == 'success'){
							updateSectors('edit');
						}
				}, function errorCallback(error){
						console.log(error);
				});
			}
		};
	
		$scope.sectors.cancelEdit = function(){
			if($scope.sectors.selectedSector.title && $scope.sectors.selectedSector.coords["p1"] && $scope.map.paths["p1"].latlngs.length && !$scope.map.markers[1]){
				
				var data = {
											api_token: api,
											sectorID: $scope.sectors.selectedSector.id,
											sectorTitle: $scope.sectors.selectedSector.title,
											sectorCoords: $scope.sectors.selectedSector.coords
										};
										selectedSectorID = $scope.sectors.selectedSector.id;
										$http({
											method: 'POST',
											url: $rootScope.apiurl + '/edit/sectors',
											data: data
										}).then(function successCallback(response){
												console.log(response);
											if(response.data.message == "You haven't permission!")
														$rootScope.logout();
											else if(response.data == 'success'){
													//updateSectors('edit');
													$scope.sectors.editSectorStarted = false;
													selectedSectorID = $scope.sectors.selectedSector.id;
													$scope.sectors.tooltipEditShow = false;
													updateSectors('edit');
												}
										}, function errorCallback(error){
												console.log(error);
										});
				
					
			} else {
				$scope.sectors.editSectorStarted = false;
				selectedSectorID = $scope.sectors.selectedSector.id;
				$scope.sectors.tooltipEditShow = false;
				updateSectors('edit');
			}
		};
	
		$scope.sectors.updateAddInput = function(){
			if(!$scope.sectors.sectorTitle){
				$scope.sectors.tooltipAddShow = true;
			} else {
				$scope.sectors.tooltipAddShow = false;
			}
		};
	
		$scope.sectors.updateEditInput = function(){
			if(!$scope.sectors.selectedSector.title){
				$scope.sectors.tooltipEditShow = true;
			} else {
				$scope.sectors.tooltipEditShow = false;
			}
		};
	
		function updateSectors(type){
			$scope.sectors.initSectors(type);
			
			$scope.sectors.addNewSectorStarted = false;
			$scope.sectors.editSectorStarted = false;
			$scope.sectors.selectedSector = null;
			
			$scope.map.paths = {};
			$scope.map.markers = {};
			
			sectorPoints = 1, numberMarkers = [], isMarkerClicked = false; 
			
			$scope.sectors.sectorNum = 1;
		}
	
	  function getCentroid(array) {
		
			var arr = [];
			for(var a in array){
				arr.push([array[a].lat, array[a].lng]);
			}

				var twoTimesSignedArea = 0;
				var cxTimes6SignedArea = 0;
				var cyTimes6SignedArea = 0;

				var length = arr.length

				var x = function (i) { return arr[i % length][0] };
				var y = function (i) { return arr[i % length][1] };

				for ( var i = 0; i < arr.length; i++) {
						var twoSA = x(i)*y(i+1) - x(i+1)*y(i);
						twoTimesSignedArea += twoSA;
						cxTimes6SignedArea += (x(i) + x(i+1)) * twoSA;
						cyTimes6SignedArea += (y(i) + y(i+1)) * twoSA;
				}
				var sixSignedArea = 3 * twoTimesSignedArea;
				return [ cxTimes6SignedArea / sixSignedArea, cyTimes6SignedArea / sixSignedArea];        
	}
	
});