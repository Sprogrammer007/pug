;(function() { 
  "use strict";
  var sc = angular.module('pugPostsControllers', []);

  sc.controller('PostDashController', function($scope){
  });

  sc.controller('PostEditController', function($scope, Post){
   
    this.publish = function() {;
      console.log("testes")
      // if ($scope.postForm.$invalid) {return}
      if ($scope.post.id) {
        $scope.post.update(function(post) {
          
        });   
      } else {
        Post.save({post: $scope.post, categories: $scope.selectedCategories},function(post) {
          
        });   
      }
    }

    this.toggleSelection = function(id) {
      var i = $scope.selectedCategories.indexOf(id);

      if (i > -1) {
        $scope.selectedCategories.splice(idx, 1);
      } else {
        $scope.selectedCategories.push(id);
      }
    };
  });

  sc.controller('PostListController', function($scope, Post){
    $scope.$watch(function(scope) { return scope.massAction },
      function(n, o) {
        $scope.plistCtrl.massUpdate(n);
      }
    );

    this.massUpdate = function(action) {
      if (!this.isSelectedAll()) {
        if (action != 'All Posts') {$scope.massAction = 'All Posts'}
      }
    };

    this.isPublished = function(status) {
      return status === 'Published'
    };

    this.toggleStatus = function(i) {
      var s = ($scope.surveys[i].status === 'Published') ? 'Unpublished' : 'Published';      
      Post.update({id: $scope.surveys[i].id}, {status: s}, function(r) {
        $scope.surveys[i].status = s;
      });
    };

    this.updateSelection = function($event, id) {
      var action = (event.target.checked ? 'add' : 'remove');
      updateSelected(action, id);
    };

    this.selectAll = function($event) {
      var action = (event.target.checked ? 'add' : 'remove');
      $scope.surveys.forEach(function(e, i, a) {
        updateSelected(action, e.id);
      });
    };

    this.getSelectedClass = function(s) {
      return $scope.isSelected(s.id) ? 'selected' : '';
    };

    this.isSelected = function(id) {
      return $scope.selected.indexOf(id) >= 0;
    };

    //something extra I couldn't resist adding :)
    this.isSelectedAll = function() {
      if (!$scope.surveys) { return }
      return $scope.selected.length === $scope.surveys.length;
    };

    function updateSelected(action, id) {
      var index = $scope.selected.indexOf(id);
      if (action === 'add' && index  === -1) {
        $scope.selected.push(id);
      }
      if (action === 'remove' && index !== -1) {
        $scope.selected.splice(index, 1);
      }
    };
  });

})();