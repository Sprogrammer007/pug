;(function() { 
  "use strict";
  var sc = angular.module('dfrPostsControllers', []);

  sc.controller('PostDashController', function($scope){
  });

  sc.controller('NewPostController', function($scope, Survey){
    this.post = new Post();

    this.createSurvey = function() {;
      if ($scope.postForm.$invalid) {return}
      this.post.$save(function(result) {
        if (result.data === 'Not Logged In') {
          window.location.replace(window.location.origin + "/login");
        } else {
          this.post = result;
          // window.location.replace(window.location.origin + "/campaign/survey/" + result.id + "/b");
        }
      });
    }
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