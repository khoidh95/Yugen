module.exports = function(sss) {
	var xp=sss/10;
	var correctAnswer=0;
	var level = 1;
	if(xp>=2){
		for(var i=2;i<=xp;i++){
			correctAnswer=correctAnswer+(i*10);
			if(correctAnswer==sss)
			{
				level=i;
				break;
			}
			if(correctAnswer>sss)
			{
				level=i-1;
				break;
			}  
		}
	}
	return level;
}

