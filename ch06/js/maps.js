var maps = {
    "singleplayer":[
        {
            "name":"Introduction",
            "briefing": "In this level you will learn how to pan across the map.\n\nDon't worry! We will be implementing more features soon.",
             
            /* Map Details */
            "mapImage":"images/maps/level-one-debug-grid.png",
            "startX":4,
            "startY":4,
			
			/* Entities to be loaded */
            "requirements":{
                "buildings":["base","starport"],
                "vehicles":[],
                "aircraft":[],
                "terrain":[]
            },
             
            /* Entities to be added */
            "items":[
                {"type":"buildings","name":"base","x":11,"y":14,"team":"blue"},
                {"type":"buildings","name":"base","x":12,"y":16,"team":"green"},
                {"type":"buildings","name":"base","x":15,"y":15,"team":"green", "life":50},
				
				{"type":"buildings","name":"starport","x":18,"y":14,"team":"blue"},
				{"type":"buildings","name":"starport","x":18,"y":10,"team":"blue", "action":"teleport"},
				{"type":"buildings","name":"starport","x":18,"y":6,"team":"green", "action":"open"},
				{"type":"buildings","name":"starport","x":20,"y":2,"team":"green", "action":"teleport"},

            ]
			   
             
        },
    ]
};