 	typewriter = {};
 	typewriter.selector = {
 		name: ".content",
 		changed : false
 	}
 	typewriter.errorStack = [];
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

		var curLineLen = typewriter.context.currentText.length;
		if(curLineLen == 0){
			nextElement = typewriter.getNextElement();
			typewriter.context.currentText = nextElement.text();
			nextElement.text("");
			typewriter.context.currentWithinItem = 0;
		} else {
			if(typewriter.context.currentWithinItem > 2 && wrongSpell.isHit()){
				typewriter.addErrornousChar();
			} else if  (typewriter.errorStack.length){
 			//error char in place, perform delete first.
				typewriter.errorStack.pop();
				var text = target.children().last().text();
				target.children().last().text(text.substr(0,text.length-1));
				return false;
 			};
			nextElement = typewriter.context.currentText.substr(typewriter.context.currentWithinItem++, 1);
			if (typewriter.context.currentText.length === typewriter.context.currentWithinItem){
				typewriter.context.currentText = ""; //Reset content
			}
			target = target.children().last();
		}
		//document.getElementById("aa").innerHTML+="<br/>" + nextElement;
		target.append(nextElement);
 	};

 	typewriter.addErrornousChar = function(){
 				var charCode = (typewriter.context.currentText.substr(typewriter.context.currentWithinItem,1)).charCodeAt(0) + 1;
				var badChar = String.fromCharCode(charCode);
				typewriter.context.currentText = $().append_in_str(typewriter.context.currentText, badChar, typewriter.context.currentWithinItem); //use jquery append plugin
				typewriter.errorStack.push(badChar);
 	}

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



wrongSpell = {};
wrongSpell.errorFactor = 5;
wrongSpell.isHit = function(){
	var chance =  wrongSpell.errorFactor;
	if (typewriter.errorStack.length){ chance * 3}; //If previous item was a mistake, increase chance of error by factor;
	var isHit = (Math.random()*100 < chance) ? true : false;
	return isHit;
}
