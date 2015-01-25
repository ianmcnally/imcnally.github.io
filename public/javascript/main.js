(function() {
  'use strict';
  var FareCalculator;

  angular.module('app', ['ui.router', 'app.fareCalculator', 'app.templates']).config([
    '$locationProvider', '$urlRouterProvider', function($locationProvider, $urlRouterProvider) {
      $locationProvider.html5Mode(true);
      return $urlRouterProvider.otherwise('/');
    }
  ]);

  'use strict';

  angular.module('app.fareCalculator', ['ui.router']).constant('metrocardRates', {
    BONUS_PERCENT: 5,
    RIDE_COST: 2.50
  }).config([
    '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      return $stateProvider.state('calculator', {
        url: '/',
        templateUrl: 'fare_calculator/fare_calculator.html',
        controller: 'FareCalculator',
        controllerAs: 'FareCalculatorController'
      });
    }
  ]).service('fareMaximizer', [
    'metrocardRates', function(metrocardRates) {
      var bonus, getChange;
      bonus = metrocardRates.BONUS_PERCENT / 100 + 1.0;
      getChange = function(cost) {
        return parseInt((cost - Math.trunc(cost)).toFixed(2) * 100);
      };
      return {
        amountsToAdd: function(balanceLeft, maxToAdd) {
          var fare, fareMultiple, fares, purchases, toAdd, _i;
          fareMultiple = 0;
          fares = [];
          purchases = [];
          while (fareMultiple < maxToAdd) {
            fareMultiple += metrocardRates.RIDE_COST;
            fares.push(fareMultiple);
          }
          for (_i = fares.length - 1; _i >= 0; _i += -1) {
            fare = fares[_i];
            toAdd = ((fare - balanceLeft) / bonus).toFixed(2);
            if (!(getChange(toAdd) % 5) && toAdd > 0) {
              purchases.push({
                amount: toAdd,
                rides: fare / metrocardRates.RIDE_COST
              });
            }
          }
          return purchases;
        }
      };
    }
  ]).controller('FareCalculator', FareCalculator = (function() {
    FareCalculator.$inject = ['fareMaximizer'];

    FareCalculator.prototype.purchaseMaximum = 40;

    function FareCalculator(fareMaximizer) {
      this.fareMaximizer = fareMaximizer;
    }

    FareCalculator.prototype.updatePurchaseAmounts = function() {
      return this.purchaseAmounts = this.fareMaximizer.amountsToAdd(Number(this.remainingBalance), Number(this.purchaseMaximum));
    };

    return FareCalculator;

  })());

}).call(this);
