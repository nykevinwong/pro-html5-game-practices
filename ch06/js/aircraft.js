var aircraft = {
    list:{
        "chopper":{
            name:"chopper",
            cost:900,
            pixelWidth:40,
            pixelHeight:40,
            pixelOffsetX:20,
            pixelOffsetY:20,
            weaponType:"heatseeker",
            radius:18,
            sight:6,
            canAttack:true,
            canAttackLand:true,
            canAttackAir:true,
            hitPoints:50,
            speed:25,
            turnSpeed:4,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:4,directions:8}
            ],
        },
        "wraith":{
            name:"wraith",
            cost:600,
            pixelWidth:30,
            pixelHeight:30,
            canAttack:true,
            canAttackLand:false,
            canAttackAir:true,
            weaponType:"fireball",
            pixelOffsetX:15,
            pixelOffsetY:15,
            radius:15,
            sight:8,
            speed:40,
            turnSpeed:4,
            hitPoints:50,
            pixelShadowHeight:40,
            spriteImages:[
                {name:"fly",count:1,directions:8}
            ],
        }
    },
    defaults:{
        type:"aircraft",
        animationIndex:0,
        direction:0,
        directions:8,
        action:"fly",
        selected:false,
        selectable:true,
        orders:{type:"float"},
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
                case "fly":
                    var direction = this.direction;
                     this.imageList = this.spriteArray["fly-"+ direction];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if (this.animationIndex>=this.imageList.count){
                         this.animationIndex = 0;
                    }
                break;
            }
        },
        draw:function(){
            var x = (this.x*game.gridSize)-game.offsetX-this.pixelOffsetX;
            var y = (this.y*game.gridSize)-game.offsetY-this.pixelOffsetY-this.pixelShadowHeight;
            var colorIndex = (this.team == "blue")?0:1;
            var colorOffset = colorIndex*this.pixelHeight;
            var shadowOffset = this.pixelHeight*2; // The aircraft shadow is on the second row of the sprite sheet
     
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset*this.pixelWidth, colorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth,this.pixelHeight);
            game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset*this.pixelWidth, shadowOffset, this.pixelWidth, this.pixelHeight, x, y+this.pixelShadowHeight, this.pixelWidth, this.pixelHeight);
        }
    },
    load:loadItem,
    add:addItem,
}