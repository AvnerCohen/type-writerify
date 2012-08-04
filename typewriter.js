 	typewriter = {};
 	typewriter.selector = {
 		name: ".content",
 		changed : false,
 		maxHeight : 490
 	}
 	typewriter.context = {
 		items : [],
 		currentItem : 0,
 	 	currentWithinItem :0,
 		currentText : "",
 		speed : 15,
 		baseSpeed : 15,
 		direction : "F"

 	};

 	typewriter.timeout = null;
 	
 	typewriter.typeNext = function(){
	var target = $(typewriter.selector.name);
	if (!typewriter.selector.changed && target.height() > typewriter.selector.maxHeight){
		typewriter.selector.name = ".content1";
	}
	var nextElement = null;
	if (typewriter.context.speed > 0){
		if (typewriter.context.direction == "F"){
			typewriter.forward(target);
		} else{
			typewriter.rewind(target);		
		}
	}
	if (typewriter.context.currentItem <= typewriter.context.items.length){
 			typewriter.timeout = setTimeout(typewriter.typeNext, typewriter.getRandomWait());
		};

 	};

 	typewriter.rewind = function(target){

 		var lastEle = target.find("*").last();
  		if (lastEle.length == 0){
 			return false;
 		}

 		var origText = lastEle.html();
 		if (origText === ""){
 			lastEle.remove();
 			typewriter.context.currentItem--;
			typewriter.context.currentText  = $(typewriter.context.items[typewriter.context.currentItem-1]).text();
			typewriter.context.currentWithinItem = typewriter.context.currentText.length;
 		} else{
			lastEle.html(origText.substring(0,origText.length-1));
			typewriter.context.currentWithinItem--;
		}



 	};

 	typewriter.forward = function(target){
		if(typewriter.context.currentText === ""){
			nextElement = typewriter.getNextElement();
			typewriter.context.currentText = nextElement.text();
			nextElement.text("");
			typewriter.context.currentWithinItem = 0;
		} else {
			nextElement = typewriter.context.currentText.substr(typewriter.context.currentWithinItem++, 1);
			if (typewriter.context.currentText.length === typewriter.context.currentWithinItem){
				typewriter.context.currentText = ""; //Reset content
			}
			target = target.children().last();
		}

		target.append(nextElement);
 	};

 	typewriter.kickShow = function(){
 		//Start by creating the array of all items to walk through;
 		typewriter.context.items = $(".hidden-element").children().first().children();
 		typewriter.timeout = setTimeout(typewriter.typeNext, 100);

 	}

 	typewriter.getNextElement = function(){
 		return $(typewriter.context.items[typewriter.context.currentItem++]).clone();
 	}

 	typewriter.getRandomWait = function(){
 	    var wait = Math.abs(Math.random() * (typewriter.context.speed * 10))
   		 return wait;
   	}

   	typewriter.setDirection = function(direction){
     		typewriter.context.direction = direction;
   	}
