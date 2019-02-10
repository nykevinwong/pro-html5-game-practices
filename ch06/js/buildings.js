    var buildings = {
    list:
	{
        "base":{
            name:"base",
            // Properties for drawing the object
            pixelWidth:60,
            pixelHeight:60,
            baseWidth:40,
            baseHeight:40,
            pixelOffsetX:0,
            pixelOffsetY:20,
            // Properties for describing structure for pathfinding
            buildableGrid:[
                [1,1],
                [1,1]
            ],
            passableGrid:[
                [1,1],
                [1,1]
            ],
            sight:3,
            hitPoints:500,
            cost:5000,
            spriteImages:[
                {name:"healthy",count:4},
                {name:"damaged",count:1},
                {name:"contructing",count:3},
            ],
        }, // end of base
		
		"starport":{
		name:"starport",
		pixelWidth:40,
		pixelHeight:60,
		baseWidth:40,
		baseHeight:55,
		pixelOffsetX:1,
		pixelOffsetY:5,
		buildableGrid:[
			[1,1],
			[1,1],
			[1,1]
		],
		passableGrid:[
			[1,1],
			[0,0],
			[0,0]
		],
		sight:3,
		cost:2000,
		hitPoints:300,
		spriteImages:[
			{name:"teleport",count:9},
			{name:"closing",count:18},
			{name:"healthy",count:4},
			{name:"damaged",count:1},
		],
		}, // end of starport

	}, // end of list
    defaults:{
        type:"buildings",
        animationIndex:0,
        direction:0,
        orders:{ type:"stand" },
        action:"stand",
        selected:false,
        selectable:true,
	animate:function(){
		// Consider an item healthy if it has more than 40% life
		if (this.life>this.hitPoints*0.4){
			this.lifeCode = "healthy";
		} else if (this.life <= 0){
			this.lifeCode = "dead";
			game.remove(this);
			return;
		} else {
			this.lifeCode = "damaged";
		}
	  
		switch (this.action){
			case "stand":
				this.imageList = this.spriteArray[this.lifeCode];
				this.imageOffset = this.imageList.offset + this.animationIndex;
				this.animationIndex++;
				if (this.animationIndex>=this.imageList.count){
					this.animationIndex = 0;
				}
				break;
			case "construct":
				this.imageList = this.spriteArray["contructing"];
				this.imageOffset = this.imageList.offset + this.animationIndex;
				this.animationIndex++;
				// Once constructing is complete go back to standing
				if (this.animationIndex>=this.imageList.count){
					this.animationIndex = 0;
					this.action = "stand";
				}
				break;
				
				case "teleport":
            this.imageList = this.spriteArray["teleport"];
            this.imageOffset = this.imageList.offset + this.animationIndex;
            this.animationIndex++;
            // Once teleporting is complete, move to either guard or stand mode
            if (this.animationIndex>=this.imageList.count){
                this.animationIndex = 0;
                if (this.canAttack){
                    this.action = "guard";
                } else {
                    this.action = "stand";
                }
            }
            break;
        case "close":
            this.imageList = this.spriteArray["closing"];
            this.imageOffset = this.imageList.offset + this.animationIndex;
            this.animationIndex++;
            // Once closing is complete go back to standing
            if (this.animationIndex>=this.imageList.count){
                this.animationIndex = 0;
                this.action = "stand";
            }
            break;
        case "open":
            this.imageList = this.spriteArray["closing"];
            // Opening is just the closing sprites running backwards
            this.imageOffset = this.imageList.offset + this.imageList.count - this.animationIndex;
            this.animationIndex++;
            // Once opening is complete, go back to close
            if (this.animationIndex>=this.imageList.count){
                this.animationIndex = 0;
                this.action = "close";
            }
            break;
		}
	
	},  // end of animation()
	
	// Default function for drawing a building
	draw:function(){
		var x = (this.x*game.gridSize)-game.offsetX-this.pixelOffsetX;
		var y = (this.y*game.gridSize)-game.offsetY-this.pixelOffsetY;
	  
		// All sprite sheets will have blue in the first row and green in the second row
		var colorIndex = (this.team == "blue")?0:1;
		var colorOffset = colorIndex*this.pixelHeight;
		game.foregroundContext.drawImage(this.spriteSheet,
		this.imageOffset*this.pixelWidth,colorOffset, this.pixelWidth, this.pixelHeight,
		x,y,this.pixelWidth,this.pixelHeight);
    }, // end of draw
}, // end of default
    load:loadItem,
    add:addItem,
	}
	