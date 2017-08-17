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

var contentPopup = '<div  class="h-36 ui-grid-cell-contents" ng-click="\'grid.appScope.getCurrentFocus()\'" ng-class="(row.entity[col.field].trim().length == 0)?\'invalid\':\'\'" ng-bind-html="row.entity[col.field]" uib-popover-template="\'content.html\'" popover-append-to-body="true" popover-placement="bottom" popover-trigger="\'mouseenter\'"></div>'+
'<script type="text/ng-template" id="content.html" >' +
' 	<span class="font-2em" ng-bind-html="row.entity[col.field]">' +
'	</span>'
'</script>';
(function(){
	
    /*MODULE ANGULAR for side bar*/
    angular.module('addQuestionApp', ['ui.bootstrap','ui.grid','ui.grid.edit', 'ui.grid.validate', 'ngSanitize'])
    .controller('addQuestionCtr', function($scope, $http){
    	$scope.ruby = $scope.rubyDown = $scope.rubyUp = $scope.nomalText = '';
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
		$scope.loading = false;
    	$scope.gridOptions = {
    		enableColumnMenus:false,
    		enableSorting:false,
    		rowHeight:36,
		    columnDefs: [
		    	{
					name:"id", displayName: 'QID', width: 50,enableCellEdit: false
				},
				{
					name:"content", displayName: 'Question Content', width: 300,
					validators:{required: true},
					// enableCellEdit: false,
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
					name:"action", displayName: 'Action', width:150,enableCellEdit: false,
					cellTemplate:'<a class="btn btn-success" ng-click="grid.appScope.resetRecord(row.entity,grid.renderContainers.body.visibleRowCache.indexOf(row))"><i class="fa fa-history" aria-hidden="true"></i></a>'+
								'<a class="btn btn-primary" ng-click="grid.appScope.updateRecord(row.entity,grid.renderContainers.body.visibleRowCache.indexOf(row))"><i class="fa fa-paper-plane" aria-hidden="true"></i></a>'+
								'<a class="btn btn-danger" ng-click="grid.appScope.deleteRecord(row.entity)"><i class="fa fa-times" aria-hidden="true"></i></a>'
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
	  	$scope.reqObj = {
	  		pagging:{
	  			take:10,
	  			takes:[{value:5,name:'5 records'},{value:10,name:'10 records'},{value:15,name:'15 records'},{value:20,name:'20 records'},{value:30,name:'30 records'}],
	  			current:0,
	  			pages:0,
	  		},
	  		search:{
	  			by:'Content',
	  			searchStr:'',
	  			content:'',
	  			explain:'',
	  			jlpt:'',
	  			jlpts:[{value:'',name:'All'},{value:'N1',name:'N1'},{value:'N2',name:'N2'},{value:'N3',name:'N3'},{value:'N4',name:'N4'},{value:'N5',name:'N5'}],
	  			isTest:'',
	  			isTests:[{value:'',name:'All'},{value:true,name:'Is Test'},{value:false, name:'Not Test'}],
	  			type:'',
	  			types:[{value:'',name:'All'},{value:'kanji',name:'Kanji'},{value:'grammar',name:'Grammar'},{value:'vocabulary',name:'Vocabulary'}],
	  		}
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
	  	$scope.deleteRecord = function(row){
	  		utils.confirm({
                title:'Notice',
                msg: 'Do you want to delete question ID: '+row.id+"?",
                okText:'Yes', cancelText:'No',
                callback: function(){
			  		$http.post("/question/delete",{id:row.id},{}).then(function(res){
			  			if(res.data.message == 'success'){
			  				utils.alert({
		                        title:'Notice',
		                        msg: 'Deleted question ID: ' + row.id
		                    });
		                    $scope.search(function(err){})
			  			}else{
			  				utils.alert({
		                        title:'Error',
		                        msg: 'Something went wrong!'
		                    });
			  			}
			  		}).catch(function(err){
			  			utils.alert({
		                    title:'Error',
							msg: 'Something went wrong!'
		                });
			  		});
                }
            });
	  	}
	  	$scope.resetRecord = function(row, i){
	  		$http.post("/question/getone",{id:row.id},{}).then(function(res){
	  			if(res.data.message == 'success'){
	  				$scope.gridOptions.data[i] = res.data.question;
	  			}else{
	  				utils.alert({
	                    title:'Error',
						msg: 'Something went wrong!'
	                });
	  			}
	  		}).catch(function(err){
	  			utils.alert({
	                title:'Error',
					msg: 'Something went wrong!'
	            });
	  		});
	  	}
	  	$scope.updateRecord = function(row, i){
			if(row.content.trim().length == 0 || row.explain.trim().length == 0 || row.jlpt.trim().length == 0 || row.type.trim().length == 0 || row.answer.length != 4){
				utils.alert({
                    title:'Error',
                    msg: 'Please enter more information!'
                });
                return;
			}
			var flagisCorrect = 0;
	  		for(var i = 0; i < row.answer.length; i++){
	  			var ans = row.answer;
  				if(ans[i].content.trim().length==0){
  					utils.alert({
                        title:'Error',
                        msg: 'Record ID ' + row.id + " doesn't have enough answer! "
                    });
                    return;
  				}
				if(row.answer[i].isCorrect) flagisCorrect++;
			}
			if(flagisCorrect == 0) {
				utils.alert({
                    title:'Error',
                    msg: 'Record ID ' + row.id + ' must contain one correct answer!'
                });
                return;
			}
			if(flagisCorrect > 1) {
	  				var x = i + 1;
	  				utils.alert({
                        title:'Error',
                        msg: 'Record ID ' + row.id + ' must contain one correct answer!'
                    });
                    return;
  				}
	  		utils.confirm({
                title:'Notice',
                msg: 'Do you want to update question ID:'+row.id,
                okText:'Yes', cancelText:'No',
                callback: function(){
			  		$http.post("/question/update",{question:row},{}).then(function(res){
			  			if(res.data.message == 'success'){
			  				utils.alert({
		                        title:'Notice',
		                        msg: 'Question ID:' + row.id + "is updated!"
		                    });
		                    $scope.search(function(err){})
			  			}else{
			  				utils.alert({
		                        title:'Error',
		                        msg: 'Something went wrong!'
		                    });
			  			}
			  		}).catch(function(err){
			  			utils.alert({
		                    title:'Error',
							msg: 'Something went wrong!'
		                });
			  		});
                }
            });
	  	}
	  	$scope.follow = function(){
	  		var recorvery = $scope.reqObj.pagging.current;
			$scope.reqObj.pagging.current = 0;
			$scope.search(function(err){
  				if(err) return $scope.reqObj.pagging.current = recorvery;
  			})
	  	}
	  	//THEO DOI ISTEST
	  	$scope.$watch(function(scope) { return scope.reqObj.search.isTest },
			function(newValue, oldValue) {
				$scope.follow();
			}
		);
	  	//THEO DOI TYPE
	  	$scope.$watch(function(scope) { return scope.reqObj.search.type },
			function(newValue, oldValue) {
				$scope.follow();
			}
		);
	  	//THEO DOI JLPT
	  	$scope.$watch(function(scope) { return scope.reqObj.search.jlpt },
			function(newValue, oldValue) {
				$scope.follow();
			}
		);
		//THEO DOI CONTENT VA EXPLAIN
	  	$scope.$watch(function(scope) { return scope.reqObj.search.by },
			function(newValue, oldValue) {
				$scope.follow();
			}
		);

	  	//THEO DOI SEARCH
	  	$('#searchStr').keypress(function(){
	        $scope.follow();
	    });

		//THEO DOI TAKE BAO NHIEU BAN GHI
	  	$scope.$watch(function(scope) { return scope.reqObj.pagging.take },
			function(newValue, oldValue) {
				$scope.follow();
			}
		);

	  	$scope.nextPage = function(){
	  		if($scope.reqObj.pagging.current == $scope.reqObj.pagging.pages - 1) return;
	  		var recorvery = $scope.reqObj.pagging.current++;
	  		$scope.search(function(err){
	  			if(err) return $scope.reqObj.pagging.current = recorvery;
	  		})

	  	}
	  	$scope.prePage = function(){
	  		if($scope.reqObj.pagging.current == 0) return;
	  		var recorvery = $scope.reqObj.pagging.current--;
	  		$scope.search(function(err){
	  			if(err) return $scope.reqObj.pagging.current = recorvery;
	  		})
	  	}
	  	$scope.search = function(cb){
	  		$scope.loading = true;
	  		var skip = $scope.reqObj.pagging.current * $scope.reqObj.pagging.take;
	  		var limit = $scope.reqObj.pagging.take;
	  		if($scope.reqObj.search.by == 'Content'){
	  			$scope.reqObj.search.content = $scope.reqObj.search.searchStr;
	  			$scope.reqObj.search.explain = '';
	  		}else{
	  			$scope.reqObj.search.explain = $scope.reqObj.search.searchStr;
	  			$scope.reqObj.search.content = '';
	  		}
	  		var body = {
	  			skip:skip,
	  			limit:limit,
	  			content:$scope.reqObj.search.content,
	  			explain:$scope.reqObj.search.explain,
	  			jlpt: $scope.reqObj.search.jlpt,
	  			isTest:$scope.reqObj.search.isTest,
	  			type:$scope.reqObj.search.type
	  		}
	  		$http.post("/question/list",body,{}).then(function(res){
	  			$scope.loading = false;
		  		if(res.data.message=='success'){
		  			$scope.gridOptions.data = res.data.data;
		  			$scope.reqObj.pagging.pages = Math.ceil(res.data.count / $scope.reqObj.pagging.take);
		  			cb(null);
		  		}else{
		  			cb(1);
		  		}		
	  		}, function(err){
	  			cb(err);
	  		});
	  	}

		$scope.currentFocused = "";
		$scope.getCurrentFocus = function(){
			var rowCol = $scope.gridApi.cellNav.getFocusedCell();
			if(rowCol !== null) {
				//$scope.currentFocused = 'Row Id:' + rowCol.row.entity.id + ' col:' + rowCol.col.colDef.name+ ' content:' + rowCol.row.entity.content;			
				window.alert(rowCol.row.entity.id);
				//rowCol.col.entity.id="a";		
			}
		}
	})
})();
