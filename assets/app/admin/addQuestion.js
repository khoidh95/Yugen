var answerPopup = '<div class="div-in-grid ui-grid-cell-contents" ng-class="(row.entity[col.field].length != 4)?\'invalid\':\'\'">' +
				'	<button class="btn btn-default w-100" uib-popover-template="\'answer.html\'" type="button" popover-append-to-body="true" popover-placement="bottom">{{row.entity[col.field].length}} answers</button>'+
				'</div>' +
				'<script type="text/ng-template" id="answer.html" >' +
				'	<div class="form-group" ng-repeat="an in row.entity[col.field]">' +
				'		<div class="input-group">' +
				'			<div class="input-group-addon">' +
				'				<div class="checkbox check-correct-answer">' +
				'				    <label>' +
				'				        <input type="checkbox" ng-model="an.isCorrect">' +
				'				        <span class="cr"><i class="cr-icon fa fa-check"></i></span>' +
				'				    </label>' +
				'				</div>' +
				'			</div>' +
				'			<input type="text" ng-model="an.content" class="form-control h-36" placeholder="Answer">' +
				'			<div class="input-group-addon btn-remove-answer-in-table" ng-click="grid.appScope.removeAnswer(row.entity[col.field], $index)"><i class="fa fa-times" aria-hidden="true"></i></div>' +
				'		</div>' +
				'	</div>' +
				'   <button ng-if="row.entity[col.field].length != 4" class="btn btn-success" ng-click="grid.appScope.addAnswer(row.entity[col.field])">Add a answer</button>'
				'</script>';

var contentPopup = '<div  class="h-36 ui-grid-cell-contents" ng-class="(row.entity[col.field].trim().length == 0)?\'invalid\':\'\'" ng-bind-html="row.entity[col.field]" uib-popover-template="\'content.html\'" popover-append-to-body="true" popover-placement="bottom" popover-trigger="\'mouseenter\'"></div>'+
'<script type="text/ng-template" id="content.html" >' +
' 	<span class="font-2em" ng-bind-html="row.entity[col.field]">' +
'	</span>'
'</script>';

(function(){
	
    /*MODULE ANGULAR for side bar*/
    angular.module('addQuestionApp', ['ui.bootstrap','ui.grid','ui.grid.edit','ui.grid.validate', 'ngSanitize'])
    .controller('addQuestionCtr', function($scope){
    	$scope.ruby = $scope.rubyDown = $scope.rubyUp = $scope.nomalText = '';
    	$scope.onDecoration = false;
    	$scope.rubyHistory = [];
    	$scope.addRuby = function(){
    		if($scope.nomalText.length != 0){
    			$scope.rubyHistory.push($scope.ruby);
    			if ($scope.onDecoration) 
					$scope.ruby += '<u>' + $scope.decode($scope.nomalText) + '</u>';
				else
					$scope.ruby += $scope.decode($scope.nomalText);
    			$scope.nomalText = '';
    			return;
    		}
    		if($scope.rubyDown.length == 0 || $scope.rubyUp.length == 0) return;
			$scope.rubyHistory.push($scope.ruby);
			var x;
			if($scope.onDecoration) 
				x = '<u><ruby>' + $scope.decode($scope.rubyDown) + '<rt>' + $scope.decode($scope.rubyUp) + '</rt>' + '</ruby></u>';
			else
				x = '<ruby>' + $scope.decode($scope.rubyDown) + '<rt>' + $scope.decode($scope.rubyUp) + '</rt>' + '</ruby>';
    		$scope.ruby += x;
    		$scope.rubyDown = $scope.rubyUp = '';
    	}
    	$scope.decoration = function(){
    		$scope.onDecoration = !$scope.onDecoration;
    	}
    	$scope.addSpace = function(){
    		$scope.ruby += ' ';
    	}
    	$scope.undo = function(){
    		if($scope.rubyHistory.length == 0) return;
    		$scope.ruby = $scope.rubyHistory.pop();
    	}
    	$scope.clearAllHistory = function(){
    		$scope.ruby = $scope.rubyDown = $scope.rubyUp = $scope.nomalText = '';
    		$scope.rubyHistory = [];
    	}
    	$scope.decode = function(str){
			var arr = str.split(/\s*(<[^>]*>)/g);
    		var result = '';
    		for(var i = 0; i < arr.length; i++){
    			arr[i] = arr[i].replace("<", "&lt;");
    			arr[i] = arr[i].replace(">", "&gt;");
    			result += arr[i];
    		}
    		return result;
    	}
    	$scope.$watch(function(scope) { return scope.rubyDown },
			function(newValue, oldValue) {
				if(newValue.length > 0)	$scope.nomalText = '';
			}
		);

    	$scope.$watch(function(scope) { return scope.rubyUp },
			function(newValue, oldValue) {
				if(newValue.length > 0)	$scope.nomalText = '';
			}
		);
		$scope.$watch(function(scope) { return scope.nomalText },
			function(newValue, oldValue) {
				if(newValue.length > 0)	$scope.rubyUp = $scope.rubyDown = '';
			}
		);

		//UI- GRID 
    	$scope.gridOptions = {
    		enableColumnMenus:false,
    		enableSorting:false,
    		rowHeight:36,
		    columnDefs: [
		    	{
					name:"#", displayName: '#', width: 50,enableCellEdit: false,
					cellTemplate: '<div class="index-in-grid">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>'
				},
				{
					name:"content", displayName: 'Question Content', width: 300,
					validators:{required: true},
					cellTemplate: contentPopup
				},
				{
					name:"explain", displayName: 'Question Explain', width: 300,
					validators:{required: true},
					cellTemplate: contentPopup
				},
				{
					name:"jlpt", displayName: 'JLPT', width: 70,
					enableCellEdit: false,
					validators:{required: true},
					cellTemplate:'<div class="form-group div-in-grid  ui-grid-cell-contents" ng-class="(row.entity[col.field].length == 0)?\'invalid\':\'\'">'+
									'<select class="form-control" ng-model="row.entity[col.field]">' +
									'	<option value="N1">N1</option>' +
									'	<option value="N2">N2</option>' +
									'	<option value="N3">N3</option>' +
									'	<option value="N4">N4</option>' +
									'	<option value="N5">N5</option>' +
									'</select>'+
								'</div>'
				},
				{
					name:"isTest", displayName: 'Is Test', width: 70,
					enableCellEdit: false,
					cellTemplate:'<div class="checkbox">' +
								'    <label>' +
								'        <input type="checkbox" ng-model="row.entity[col.field]">' +
								'        <span class="cr"><i class="cr-icon fa fa-check"></i></span>' +
								'    </label>' +
								'</div>' ,
				},
				{
					name:"type", displayName: 'Type', width: 130,
					enableCellEdit: false,
					validators:{required: true},
					cellTemplate:'<div class="form-group div-in-grid  ui-grid-cell-contents" ng-class="(row.entity[col.field].length == 0)?\'invalid\':\'\'">'+
									'<select class="form-control" ng-model="row.entity[col.field]">' +
									'	<option value="kanji">Kanji</option>' +
									'	<option value="grammar">Grammar</option>' +
									'	<option value="vocabulary">Vocabulary</option>' +
									'</select>'+
								'</div>' 
				},
				{
					name:"answer", displayName: 'Answer', width:100,
					enableCellEdit: false,
					cellTemplate:answerPopup

				},
				{
					name:"action", displayName: 'Action', width:100,enableCellEdit: false,
					cellTemplate:'<a class="btn btn-danger w-100" ng-click="grid.appScope.deleteRecord(grid.renderContainers.body.visibleRowCache.indexOf(row))"><i class="fa fa-times" aria-hidden="true"></i></a>'
				},
		    ]
	  	};
	  	$scope.gridOptions.onRegisterApi = function(gridApi){
          //set gridApi on scope
          $scope.gridApi = gridApi;
          gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
          	if(rowEntity.content == newValue){
          		rowEntity.content = $scope.faker(rowEntity.content);
          	}
          	if(rowEntity.explain == newValue){
          		rowEntity.explain = $scope.faker(rowEntity.explain);
          	}
            $scope.$apply();
          });
        };
	  	$scope.addRecord = function(){
	  		$scope.gridOptions.data.push({
		  		content:'',
		  		explain:'',
		  		jlpt:'',
		  		isTest:false,
		  		type:'',
		  		answer:[]
		  	});
	  	}
	  	$scope.addAnswer = function(ans){
	  		ans.push({
		  			content:'',
		  			isCorrect:false
	  		});
	  	}
	  	$scope.removeAnswer = function(ans, i){
	  		ans.splice (i, 1);
	  	}
	  	$scope.deleteRecord = function(i){
	  		$scope.gridOptions.data.splice (i, 1);
	  	}
	  	$scope.submit = function(){
	  		if($scope.gridOptions.data.length == 0){
	  			utils.alert({
                    title:'Error',
                    msg: 'Please enter more information!'
                });
                return;
	  		}
	  		for(var i = 0; i < $scope.gridOptions.data.length; i++){
	  			var data = $scope.gridOptions.data[i];
	  			if(data.content.trim().length == 0 || data.explain.trim().length == 0 || data.jlpt.trim().length == 0 || data.type.trim().length == 0 || data.answer.length != 4){
	  				utils.alert({
                        title:'Error',
						msg: 'Please enter more information!'
                    });
                    return;
	  			}
	  			var isCorrectAnswerFlag = 0;
	  			for(var j = 0 ; j < data.answer.length; j++){
	  				var ans = data.answer;
	  				if(ans[j].content.trim().length==0){
	  					var x = i + 1;
	  					utils.alert({
	                        title:'Error',
	                        msg: 'Record no' + x + ' must contain 4 answer!'
	                    });
	                    return;
	  				}
	  				if(ans[j].isCorrect){
	  					isCorrectAnswerFlag++;
	  				} 
	  			}
	  			if(isCorrectAnswerFlag == 0) {
	  				var x = i + 1;
	  				utils.alert({
                        title:'Error',
						msg: 'Record no' + x + ' must contain one correct answer!'
                    });
                    return;
  				}
  				if(isCorrectAnswerFlag > 1) {
	  				var x = i + 1;
	  				utils.alert({
                        title:'Error',
						msg: 'Record no' + x + ' must contain one correct answer!'
                    });
                    return;
  				}
	  		}
	  		$.post("/question/add",{data:$scope.gridOptions.data}, function(data, status){
	  			if(data.message == 'success'){
	  				utils.confirm({
                        title:'Notice',
                        msg: 'Insert questions success! Do you want to clear the table?',
                        okText:'Yes', cancelText:'No',
                        callback: function(){
                        	$scope.gridOptions.data = [];
                        	$scope.$apply();
                        }
                    });
	  			}else{
	  				utils.alert({
                        title:'Thông báo',
                        msg: 'Có lỗi gì đó xảy ra.'
                    });
	  			}
	  		});
	  	}
    })
})();
