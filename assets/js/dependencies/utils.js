var utils = {};
(function () {
	//generate uuid
	utils.generateUUID = function () {
	    var d = new Date().getTime();
	    if (window.performance && typeof window.performance.now === "function") {
	        d += performance.now(); //use high-precision timer if available
	    }
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	        var r = (d + Math.random() * 16) % 16 | 0;
	        d = Math.floor(d / 16);
	        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	    });
	    return uuid;
	}
	//confirm box using bootstrap modal
	//options ={title:'title',msg:msg, okText:'OK', cancelText:'Cancel', callback:function(){}}
	utils.confirm = function (options) {
	    var self = this;
	    var id = self.generateUUID();
	    options.title = options.title != undefined ? options.title : "Confirm";
	    options.msg = options.msg != undefined ? options.msg : "";
	    options.okText = options.okText != undefined ? options.okText : "OK";
	    options.cancelText = options.cancelText != undefined ? options.cancelText : "Cancel";
	    var content = '          <div class="modal" id=' + id + '>';
	    content += '                <div class="modal-dialog modal-dialog1" role="dialog">';
	    content += '                   <div class="modal-content">';
	    content += '                       <div class="modal-header" style="padding:6px 15px;">';
	    content += '                           <button type="button" class="close" data-dismiss="modal" >&times;</button>';
	    content += '                           <h4 class="modal-title"></h4>';
	    content += '                       </div>';
	    content += '                       <div class="modal-body" >';
	    content += '                               <div class="model-content">';
	    content += '                               </div>';
	    content += '                       </div>';
	    content += '                       <div class="modal-footer" style="padding: 4px 15px;" >';
	    content += '                           <p class="text-right" style=" margin:0;">';
	    content += '                               <button type="button" class="btn btn-primary btn-Ok" ></button>';
	    content += '                               <button type="button" class="btn btn-default btn-Cancel" data-dismiss="modal">Cancel</button>';
	    content += '                           </p>';
	    content += '                       </div>';
	    content += '                   </div>';
	    content += '               </div>';
	    content += '            </div>';
	    var objectContent = $(content);
	    objectContent.find("h4.modal-title").html(options.title);
	    objectContent.find(".model-content").html(options.msg);
	    objectContent.find("button.btn-Ok").html(options.okText);
	    objectContent.find("button.btn-Cancel").html(options.cancelText);

	    objectContent.modal({
	        backdrop: 'static'
	    });
	    //close event call
	    objectContent.on('hidden.bs.modal', function (e) {
	        objectContent.remove();
	    })

	    //ok event
	    objectContent.find("button.btn-Ok").click(function () {
	        objectContent.modal("hide");
	        if (options.callback != undefined) {
	            options.callback();
	        }
	    });
	    //x (close) event
	    objectContent.find("button.close").click(function () {
	        if (options.callbackClose != undefined) {
	            options.callbackClose();
	        }
	    });
	}
	//alert box using bootstrap modal
	//options ={title:'title',msg:msg, okText:'OK', callback:function(){}}
	utils.alert = function (options) {
	    var self = this;
	    var id = self.generateUUID();
	    options.title = options.title != undefined ? options.title : "Alert";
	    options.msg = options.msg != undefined ? options.msg : "";
	    options.okText = options.okText != undefined ? options.okText : "OK";
	    options.cancelText = options.cancelText != undefined ? options.cancelText : "Cancel";
	    var content = '          <div class="modal fade" id=' + id + '>';
	    content += '                <div class="modal-dialog modal-dialog1" role="dialog">';
	    content += '                   <div class="modal-content">';
	    content += '                       <div class="modal-header" style="padding: 6px 15px;">';
	    content += '                           <button type="button" class="close" data-dismiss="modal" >&times;</button>';
	    content += '                           <h4 class="modal-title"></h4>';
	    content += '                       </div>';
	    content += '                       <div class="modal-body" >';
	    content += '                               <div class="model-content">';
	    content += '                               </div>';
	    content += '                       </div>';
	    content += '                       <div class="modal-footer" style="padding: 4px 15px;" >';
	    content += '                           <p class="text-right" style=" margin:0;">';
	    content += '                               <button type="button" class="btn btn-primary btn-Ok" ></button>';
	    //content += '                               <button type="button" class="btn btn-default btn-Cancel" data-dismiss="modal">Cancel</button>';
	    content += '                           </p>';
	    content += '                       </div>';
	    content += '                   </div>';
	    content += '               </div>';
	    content += '            </div>';
	    var objectContent = $(content);
	    objectContent.find("h4.modal-title").html(options.title);
	    objectContent.find(".model-content").html(options.msg);
	    objectContent.find("button.btn-Ok").html(options.okText);
	    //objectContent.find("button.btn-Cancel").html(options.cancelText);

	    objectContent.modal({
	        backdrop: 'static'
	    });

	    //close event call
	    objectContent.on('hidden.bs.modal', function (e) {
	        objectContent.remove();
	    })

	    //ok event
	    objectContent.find("button.btn-Ok").click(function () {
	        objectContent.modal("hide");
	        if (options.callback != undefined) {
	            options.callback();
	        }
	    });
	    //x (close) event
	    objectContent.find("button.close").click(function () {
	        if (options.callbackClose != undefined) {
	            options.callbackClose();
	        }
	    });
	}

	utils.friendRequest = function(options){
		var self = this;
	    var id = self.generateUUID();
		var content = 	'<div class="popupunder alert alert-info fade in" id="' + id +'"> ';
		content +=		'	<button type="button" class="close close-sm" data-dismiss="alert"> ';
		content +=		'		<i class="glyphicon glyphicon-remove"></i> ';
		content +=		'	</button> ';
		content +=		'	<div class="row"> ';
		content +=		'		<div class="col-xs-4"> ';
		content +=		'			<img src="' + options.avatar + '" class="img-responsive"> ';
		content +=		'		</div> ';
		content +=		'		<div class="col-xs-8" class="em-x1_5"> ';
		content +=		'			<strong>' + options.displayName + ' </strong> send a friend request! ';
		content +=		'		</div> ';
		content +=		'	</div> ';
		content +=		'</div> ';
		$( "body" ).append(content);
		$('#' + id).popover();
		setTimeout(function() {
			$('#' + id).fadeTo(2000, 500).slideUp(300, function(){
				$('#' + id).remove(); 
			});
		}, 8000);
	}

	utils.shuffle= function(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
		}
		console.log(array)
		return array;
	}
})();

