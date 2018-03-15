'use strict';

/**
 * @ngdoc overview
 * @name yapp
 * @description
 * # yapp
 *
 * Main module of the application.
 */
angular
  .module('yapp', [
    'ui.router',
    'ngAnimate',
    'angular-table',
    'ui.bootstrap',
    'nemLogging',
    'ui-leaflet',
    'ngLoadingSpinner',
		'btford.socket-io'
  ])
  .provider('AuthService', function(){

    var self = this;

    this.api = $.cookie('gpsnav_api');
    this.user_type = $.cookie('gpsnav_usertype');

    if(this.api!==undefined)
      this.logged = true;
    else
      this.logged = false;

    this.$get = function() {

        return {
            getApi: function() {
                return  self.api;
            },
            isLogged: function(){
                return self.logged;
            },
            setApi: function(api){
              self.api = api;
              return 'ok';
            },
            setLogged: function(logged){
              self.logged = logged;
              return 'ok';
            },
            getUserType: function(){
              return self.user_type;
            },
            setUserType: function(type){
              self.user_type = type;
            }
        }
    };

  })
  .config(function($stateProvider, $urlRouterProvider, AuthServiceProvider) {

    $urlRouterProvider.when('/dashboard', function($injector, $location){
      if(AuthServiceProvider.logged)
        $location.path('/dashboard/maps');
      else
        $location.path('/login');
    });

    $urlRouterProvider.when('/dashboard/maps', function($state, $stateParams){
      if(AuthServiceProvider.logged){
        $state.transitionTo('maps');
      }
      else
        $state.transitionTo('login');
    });

    $urlRouterProvider.when('/dashboard/workers', function($state, $stateParams){
      if(AuthServiceProvider.logged){
        $state.transitionTo('workers');
      }
      else
        $state.transitionTo('login');
    });
	
		$urlRouterProvider.when('/dashboard/sectors', function($state, $stateParams){
      if(AuthServiceProvider.logged){
        $state.transitionTo('sectors');
      }
      else
        $state.transitionTo('login');
    });
	
		$urlRouterProvider.when('/dashboard/reports', function($state, $stateParams){
      if(AuthServiceProvider.logged){
        $state.transitionTo('reports');
      }
      else
        $state.transitionTo('login');
    });

    $urlRouterProvider.when('', function($injector, $location){
      if(AuthServiceProvider.logged)
        $location.path('/dashboard');
      else
        $location.path('/login');
    });

    $urlRouterProvider.when('/', function($injector, $location){
      if(AuthServiceProvider.logged)
        $location.path('/dashboard');
      else
        $location.path('/login');
    });

    $urlRouterProvider.when('/login', function($state, $stateParams){
      if(AuthServiceProvider.logged)
        $state.transitionTo('dashboard');
      else
        $state.transitionTo('login');
    });

    $urlRouterProvider.otherwise(function($injector, $location){
      if(AuthServiceProvider.logged)
        $location.path('/dashboard');
      else
        $location.path('/login');
    });

    $stateProvider
      .state('base', {
        abstract: true,
        url: '',
        templateUrl: 'views/base.html'
      })
        .state('login', {
          url: '/login',
          parent: 'base',
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .state('dashboard', {
          url: '/dashboard',
          parent: 'base',
          templateUrl: 'views/dashboard.html',
          controller: 'DashboardCtrl'
        })
          .state('maps', {
            url: '/maps',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/maps.html',
            controller: 'MapsCtrl'
          })
          .state('workers', {
            url: '/workers',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/workers.html',
            controller: 'WorkersCtrl'
          })
					.state('sectors', {
            url: '/sectors',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/sectors.html',
            controller: 'SectorsCtrl'
          })
					.state('reports', {
            url: '/reports',
            parent: 'dashboard',
            templateUrl: 'views/dashboard/reports.html',
            controller: 'ReportsCtrl'
          });

  }) 
	.factory('mySocket', function (socketFactory) {
		return function(){
		var myIoSocket = io.connect('http://193.124.44.82:5000', {forceNew: true});
		 //var myIoSocket = io.connect('http://localhost:5000', {forceNew: true});

			return socketFactory({
				ioSocket: myIoSocket
			});
		}

	})
    .controller('MainCtrl', function($scope, $rootScope){
      $rootScope.apiurl = 'http://193.124.44.82:5000';
			//$rootScope.apiurl = 'http://localhost:5000';
    })
	.directive('sgOptionsDisabled', function ($parse) {
        var disableOptions = function (scope, attr, element, data, fnDisableIfTrue) {
            // refresh the disabled options in the select element.
            var containsEmptyOption = element.find("option[value='']").length != 0;
            angular.forEach(element.find("option"), function (value, index) {
                var elem = angular.element(value);
                if (elem.val() != "") {
                    var locals = {};
                    //ST-Software modification (index-1 because of the initial empty option)
                    var i = containsEmptyOption ? index - 1 : index;
                    locals[attr] = data[i];
                    elem.attr("disabled", fnDisableIfTrue(scope, locals));
                }
            });
        };
        return {
            priority: 0,
            require: 'ngModel',
            link: function (scope, iElement, iAttrs, ctrl) {
                // parse expression and build array of disabled options
                var expElements = iAttrs.sgOptionsDisabled.match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
                var attrToWatch = expElements[3];
                var fnDisableIfTrue = $parse(expElements[1]);
                scope.$watch(attrToWatch, function (newValue, oldValue) {
                    if (newValue)
                        disableOptions(scope, expElements[2], iElement, newValue, fnDisableIfTrue);
                }, true);
                // handle model updates properly
                scope.$watch(iAttrs.ngModel, function (newValue, oldValue) {
                    var disOptions = $parse(attrToWatch)(scope);
                    if (newValue)
                        disableOptions(scope, expElements[2], iElement, disOptions, fnDisableIfTrue);
                });
            }
        };
    });



