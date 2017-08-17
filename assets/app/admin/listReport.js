var answerPopup = '<div class="div-in-grid ui-grid-cell-contents" ng-class="(row.entity[col.field].length != 4)?\'invalid\':\'\'">' +
				'	<button class="btn btn-default w-100" uib-popover-template="\'answer.html\'" type="button" popover-append-to-body="true" popover-placement="bottom">{{row.entity[col.field].length}} answers</button>'+
				'</div>' +
				'<script type="text/ng-template" id="answer.html" >' +
				'	<div class="form-group" ng-repeat="an in row.entity[col.field]">' +
				'		<div class="input-group">' +
				'			<div class="input-group-addon">' +
				'				<div class="checkbox check-correct-answer">' +
				'				    <label>' +
				'				        <input type="checkbox" ng-model="an.isCorrect" disabled>' +
				'				        <span class="cr"><i class="cr-icon fa fa-check"></i></span>' +
				'				    </label>' +
				'				</div>' +
				'			</div>' +
				'			<input type="text" ng-model="an.content" class="form-control h-36" placeholder="Answer" disabled>' +
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
    angular.module('listReportApp', ['ui.bootstrap','ui.grid','ui.grid.edit','ui.grid.validate', 'ngSanitize'])
    .controller('listReportCtr', function($scope, $http){  	
		//UI- GRID 
		$scope.loading = false;
    	$scope.gridOptions = {
    		enableColumnMenus:false,
    		enableSorting:false,
    		rowHeight:36,
		    columnDefs: [
		    	{
					name:"resolve", displayName: '', width: 50,enableCellEdit: false,
					cellTemplate:'<div class="text-center"><i ng-click="grid.appScope.updateResolve(true, row.entity.id)" ng-if="row.entity[col.field]==0" class="fa fa-bug fa-2x w-100" style="color:#E31B3E"></i>'+
					'<i ng-click="grid.appScope.updateResolve(false, row.entity.id)" ng-if="row.entity[col.field]==1" class="fa fa-flag-checkered fa-2x w-100" style="color:#288D0E"></i></div>'
				},
		    	{
					name:"questionId", displayName: 'QID', width: 50,enableCellEdit: false
				},
				{
					name:"content", displayName: 'Content', width: 300,
					enableCellEdit: false,
					cellTemplate: contentPopup
				},
				{
					name:"question_content", displayName: 'Question Content', width: 300,
					cellTemplate: contentPopup
				},
				{
					name:"question_explain", displayName: 'Question Explain', width: 300,
					cellTemplate: contentPopup
				},
				{
					name:"question_jlpt", displayName: 'Jlpt', width: 70,
					enableCellEdit: false,
					validators:{required: true},
					cellTemplate:'<div class="form-group div-in-grid  ui-grid-cell-contents" ng-class="(row.entity[col.field].length == 0)?\'invalid\':\'\'">'+
									'<select disabled class="form-control" ng-model="row.entity[col.field]">' +
									'	<option value="N1">N1</option>' +
									'	<option value="N2">N2</option>' +
									'	<option value="N3">N3</option>' +
									'	<option value="N4">N4</option>' +
									'	<option value="N5">N5</option>' +
									'</select>'+
								'</div>'
				},
				{
					name:"question_isTest", displayName: 'Is Test', width: 70,
					enableCellEdit: false,
					cellTemplate:'<div class="checkbox">' +
								'    <label>' +
								'        <input type="checkbox" ng-checked="row.entity[col.field]==1" disabled>' +
								'        <span class="cr"><i class="cr-icon fa fa-check"></i></span>' +
								'    </label>' +
								'</div>' ,
				},
				{
					name:"question_type", displayName: 'Type', width: 130,
					enableCellEdit: false,
					validators:{required: true},
					cellTemplate:'<div class="form-group div-in-grid  ui-grid-cell-contents" ng-class="(row.entity[col.field].length == 0)?\'invalid\':\'\'">'+
									'<select class="form-control" ng-model="row.entity[col.field]" disabled>' +
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

				}
		    ]
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
	  			resolve:'',
	  			resolves:[{value:'',name:'All'},{value:true,name:'Resolved'},{value:false,name:'not yet resolve'}],
	  			jlpts:[{value:'',name:'All'},{value:'N1',name:'N1'},{value:'N2',name:'N2'},{value:'N3',name:'N3'},{value:'N4',name:'N4'},{value:'N5',name:'N5'}],
	  			isTest:'',
	  			isTests:[{value:'',name:'All'},{value:true,name:'Is Test'},{value:false, name:'Not Test'}],
	  			type:'',
	  			types:[{value:'',name:'All'},{value:'kanji',name:'Kanji'},{value:'grammar',name:'Grammar'},{value:'vocabulary',name:'Vocabulary'}],
	  		}
	  	}
	  	$scope.follow = function(){
	  		var recorvery = $scope.reqObj.pagging.current;
			$scope.reqObj.pagging.current = 0;
			$scope.search(function(err){
  				if(err) return $scope.reqObj.pagging.current = recorvery;
  			})
	  	}

	  	//THEO DOI resolve
	  	$scope.$watch(function(scope) { return scope.reqObj.search.resolve },
			function(newValue, oldValue) {
				$scope.follow();
			}
		);
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

		//THEO DOI TAKE BAO NHIEU BAN GHI
	  	$scope.$watch(function(scope) { return scope.reqObj.pagging.take },
			function(newValue, oldValue) {
				$scope.follow();
			}
		);
	  	$scope.updateResolve = function(_resolve,_id){
	  		console.log(_resolve)
	  		$http.post("/report/updateresolve",{resolve:_resolve,id:_id},{}).then(function(res){
                if(res.data.message == 'success'){
                    $scope.search(function(){});
                }
            });
	  	}
	  	$scope.reload = function(){
	  		$scope.search(function(){});
	  	}
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
	  		var body = {
	  			skip:skip,
	  			limit:limit,
	  			jlpt: $scope.reqObj.search.jlpt,
	  			isTest:$scope.reqObj.search.isTest,
	  			type:$scope.reqObj.search.type,
	  			resolve:$scope.reqObj.search.resolve,
	  		}
	  		$http.post("/report/list",body,{}).then(function(res){
	  			console.log(res.data)
	  			$scope.loading = false;
		  		if(res.data.message=='success'){
		  			$scope.gridOptions.data = res.data.reports;
		  			$scope.reqObj.pagging.pages = Math.ceil(res.data.count / $scope.reqObj.pagging.take);
		  			cb(null);
		  		}else{
		  			cb(1);
		  		}		
	  		}, function(err){
	  			cb(err);
	  		});
	  	}
	  	$scope.search(function(){});
    })
})();
