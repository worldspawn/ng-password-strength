(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ngPasswordStrengthApp.directive:ngPasswordStrength
   * @description
   * # ngPasswordStrength
   */
  angular.module('ngPasswordStrength', [])
    .directive('ngPasswordStrength', function() {
      //TODO: make a provider for the directive or a service so these sets can be extended by the consumer
      function add(label, exp, score) {
        sets.push({label : label, regex: exp, score: score});
      }

      var sets = [];

      add('ASCII Lowercase', /[a-z]/, 26);
      add('ASCII Uppercase', /[A-Z]/, 26);
      add('ASCII Numbers', /\d/, 10);
      add('ASCII Top Row Symbols', /[!@£#\$%\^&\*\(\)\-_=\+]/, 15);
      add('ASCII Other Symbols', /[\?\/\.>\,<`~\\|"';:\]\}\[\{\s]/, 19);

      // Unicode Latin Subset
      add('Unicode Latin 1 Supplement', /[\u00A1-\u00FF]/, 94);
      add('Unicode Latin Extended A', /[\u0100-\u017F]/, 128);
      add('Unicode Latin Extended B', /[\u0180-\u024F]/, 208);
      add('Unicode Latin Extended C', /[\u2C60-\u2C7F]/, 32);
      add('Unicode Latin Extended D', /[\uA720-\uA7FF]/, 29);

      // Unicode Cyrillic Subset
      add('Unicode Cyrillic Uppercase', /[\u0410-\u042F]/, 32);
      add('Unicode Cyrillic Lowercase', /[\u0430-\u044F]/, 32);

      return {
        template: '<div class="progress"><div class="progress-bar progress-bar-{{class}}" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="100" ng-style="{width : ( value + \'%\' ) }"><span class="sr-only">{{value}}% Secure</span></div></div>',
        restrict: 'AE',
        scope: {
          password: '=ngPasswordStrength',
          value: '=strength',
          goal: '@?goal'
        },
        link: function($scope /*, elem, attrs*/ ) {
          var goal = parseInt($scope.goal || '96');

          function calculateEntropy(password) {
            var characters = 0;

            for(var i = 0; i< sets.length; i++){
              var match = password.match(sets[i].regex);
              if (match){
                characters += sets[i].score;
              }
            }

            var entropy = (Math.log(characters) / Math.LN2) * password.length;
            return entropy;
          }

          function strengthAsMeasureOfGoal(entropy, goal) {
            var goalAchieved = entropy / goal;
            if (goalAchieved > 1){
              goalAchieved = 100;
            }
            else{
              goalAchieved = Math.round(goalAchieved * 100);
            }

            return goalAchieved;
          }

          function getClass(s) {
            switch (Math.round(s / 33)) {
              case 0:
              case 1:
                return 'danger';
              case 2:
                return 'warning';
              case 3:
                return 'success';
            }
          }

          $scope.$watch('password', function(password) {
            if (password && password.length) {
              var entropy = calculateEntropy(password);
              var goalAchievement = strengthAsMeasureOfGoal(entropy, goal);
              $scope.value = goalAchievement;
              $scope.class = getClass(goalAchievement);
            }
            else {
              $scope.value = 0;
              $scope.class = getClass(0);
            }
          });
        },
      };
    });
})();
