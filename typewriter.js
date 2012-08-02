 	typewriter = {};
 	typewriter.context = {
 		items : [],
 		currentItem : 0,
 	 	currentWithinItem :0,
 		currentText : "",
 		speed : 15,
 		baseSpeed : 15

 	};

 	typewriter.timeout = null;
 	
 	typewriter.typeNext = function(){
	var target = $(".content");
	var nextElement = null;

	if(typewriter.context.currentText === ""){
		nextElement = typewriter.getNextElement();
		typewriter.context.currentText = nextElement.text();
		nextElement.text("");
		typewriter.context.currentWithinItem = 0;
		target.append(nextElement);
	} else {
		nextElement = typewriter.context.currentText.substr(typewriter.context.currentWithinItem++, 1);
		if (typewriter.context.currentText.length === typewriter.context.currentWithinItem){
			typewriter.context.currentText = ""; //Reset content
		}
		target.children().last().append(nextElement);
	}

	if (typewriter.context.currentItem <= typewriter.context.items.length){
 			typewriter.timeout = setTimeout(typewriter.typeNext, typewriter.getRandomWait());
		};

 	};

 	typewriter.kickShow = function(){
 		//Start by creating the array of all items to walk through;
 		typewriter.context.items = $(".hidden-element").children().first().children();

 		typewriter.timeout = setTimeout(typewriter.typeNext, 100);

 	}

 	typewriter.getNextElement = function(){
 		return $(typewriter.context.items[typewriter.context.currentItem++]);
 	}

 	typewriter.getRandomWait = function(){
 	    var wait = Math.abs(Math.random() * (typewriter.context.speed * 10))
   		 return wait;
   	}
