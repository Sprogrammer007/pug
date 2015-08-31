;(function() {
  "use strict";
  var sd = angular.module('dfrPostsDirectives', [])
    
  sd.directive('postDash', function(Post, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'PostDash',
      transclude: true,
      scope: {
        loaded: '=',
        pid: '=',
        mainCtrl: '='
      },
      link: function(scope, element) {     
        if (scope.pid) {
          Post.get({id: scope.pid }).$promise.then(function(post) {
            $timeout((function() {
              scope.post = post;
              scope.loaded = true;
            }), 1500);
          });
        } else {

          Post.query(function(posts) {
            $timeout((function() {
              scope.posts = posts;
              scope.loaded = true;
            }), 1500);
          });
        }
    
      },
      controller: 'PostDashController',
      controllerAs: "pdashCtrl"
    }
  });  

  sd.directive('postList', function(Post, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'PostList',
      scope: {
        posts: '=',
        loaded: '='
      },
      link: function(scope, element) {
        scope.selected = [];
        scope.currentOrder = '';
        scope.orderDirection = '';
        scope.massAction = '';
        scope.massActions = ['All Posts', 'Delete']
        
        scope.orderBy = function(item) {
          var direction = (scope.orderDirection === '+') ? '-' : '+'; 
          scope.orderDirection = direction;
          scope.currentOrder = direction + item;
        };   

        scope.sortDirect = function(direction) {
          return scope.orderDirection === direction;
        };

        scope.sortItem = function(item) {
          return scope.currentOrder.replace(/\+|\-/g,'') === item;
        };

      },
      controller: 'PostListController',
      controllerAs: "plistCtrl"
    }
  });

})();