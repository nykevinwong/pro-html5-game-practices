var maps = {
    "singleplayer":[
        {
            "name":"Entities",
            "briefing": "In this level you will add new entities to the map.\n\nYou will also select them using the mouse",            
            
            /* Map Details */
            "mapImage":"images/maps/level-one-debug-grid.png",            
            "startX":4,
            "startY":4,
            
			/* Entities to be loaded */
			"requirements":{
			    "buildings":["base","starport","harvester","ground-turret"],
			    "vehicles":["transport","harvester","scout-tank","heavy-tank"],
			    "aircraft":["chopper","wraith"],
			    "terrain":["oilfield","bigrocks","smallrocks"]
			},

            /* Entities to be added */
            "items":[
                {"type":"buildings","name":"base","x":11,"y":14,"team":"blue"},
                {"type":"buildings","name":"starport","x":18,"y":14, "team":"blue"},
                {"type":"buildings","name":"harvester","x":20,"y":10, "team":"blue"},
                {"type":"buildings","name":"ground-turret","x":24,"y":7, "team":"blue","direction":3},
  
                {"type":"vehicles","name":"transport","x":24,"y":10, "team":"blue","direction":2},
                {"type":"vehicles","name":"harvester","x":16,"y":12, "team":"blue","direction":3},
                {"type":"vehicles","name":"scout-tank","x":24,"y":14, "team":"blue","direction":4},
                {"type":"vehicles","name":"heavy-tank","x":24,"y":16, "team":"blue","direction":5},
                 
                {"type":"aircraft","name":"chopper","x":7,"y":9, "team":"blue","direction":2},
                {"type":"aircraft","name":"wraith","x":11,"y":9, "team":"blue","direction":3},
     
                {"type":"terrain","name":"oilfield","x":3,"y":5, "action":"hint"},
                {"type":"terrain","name":"bigrocks","x":19,"y":6},
                {"type":"terrain","name":"smallrocks","x":8,"y":3}
            ]
    
        }
    ]
}
