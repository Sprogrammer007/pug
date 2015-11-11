;(function() {
  "use strict";
  var sd = angular.module('pugPostsDirectives', [])
    
  sd.directive('postDash', function(Post, Params, $timeout) {
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
        scope.categories = [];    
        if (Params.act) {
          Post.getCategories({}, function(categories) {
            scope.categories = categories;
            if (Params.id) {
              Post.get({id: Params.id }).$promise.then(function(post) {
                loadPost('post', post);
              });
            } else {
              loadPost('post', new Post({categories: [], options: {}}));
            }
          });

        } else {
          Post.query(function(posts) {
            loadPost('posts', posts);
          });
        };

        function loadPost (type, obj) {
          $timeout(function() {
            scope[type] = obj;
            scope.loaded = true;
          }, 1500);
        }
      },
      controller: 'PostDashController',
      controllerAs: "pdashCtrl"
    }
  });

  sd.directive('postEdit', function(Post) {
    return {
      restrict: "E",
      templateUrl: 'PostEdit',
      scope: {
        post: '=',
        categories: '='
      },
      link: function(scope, element) {
        scope.selectedCategories = [];

      },
      controller: 'PostEditController',
      controllerAs: "peCtrl"
    }
  });

  sd.directive('postList', function(Post, $timeout) {
    return {
      restrict: "E",
      templateUrl: 'PostList',
      scope: {
        posts: '='
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