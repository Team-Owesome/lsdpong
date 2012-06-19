//    ____                                        
//   / __ \_ __   _____  _________  ____ ___  ___ 
//  / / /   |  | /    _ \/ ___//__\/ __ `__ \/ _ \
// / /_/  /|  |/ /  \_(__  )/ _/ / / / / / /  __/
// \____/   \___/\___/\____/_/ /_/ /_/\______\

// --> new BoredEngine(new Config("stage", 1000 / 30));
function Config(canvasId, fps, ups)
{
	this.canvasId = canvasId;
	this.fps = fps;
	this.ups = ups;
	this.dummieCount=50;
	this.coPlayerIp="localhost";
	
	this.canvasSize=
	{
		width:0,
		height:0
	}
}

//STATIC ERRORCODES
function ERROR_COLLECTION()
{
	this.errors=new Array();
	
	this.CONNECTION_ESTABLISHED="CONNECTION_ESTABLISHED";
	this.CONNECTION_FAILED="CONNECTION_FAILED";
	this.IO_ERROR="IO_ERROR";
	this.NO_CANVAS="NO_CANVAS";
	this.NO_ON_EVENT_FUNCTION = "NO_ON_EVENT_FUNCTION";
	this.SOCKET_UNDEFINED = "SOCKET_UNDEFINED";
	
	//0x00 is reservated
	this.errors[this.CONNECTION_ESTABLISHED]=
		{
			key:this.CONNECTION_ESTABLISHED, 
			code:'0x01', 
			text:"connection established"
		};
	this.errors[this.CONNECTION_FAILED]=
		{
			key:this.CONNECTION_FAILED, 
			code:'0x02', 
			text:"connection failed"
		};
	this.errors[this.IO_ERROR]=
		{
			key:this.IO_ERROR, 
			code:'0x03', 
			text:"unknown error with IO"
		};
	this.errors[this.NO_CANVAS]=
		{
			key:this.NO_CANVAS, 
			code:'0x04', 
			text:"no canvas found"
		};
	this.errors[this.SOCKET_UNDEFINED]=
		{
			key:this.SOCKET_UNDEFINED, 
			code:'0x05', 
			text:"Socket not defined"
		};
	this.errors[this.NO_ON_EVENT_FUNCTION]=
		{
			key:this.NO_ON_EVENT_FUNCTION, 
			code:'0x06', 
			text:"no on event function found on object"
		};
}

ERROR_COLLECTION.prototype.get=function(key)
{
	if(this.errors[key]=='undefined')
	{
		return {
			key:this.UNKNOWN_ERROR, 
			code:'0x00', 
			text:"unknown error "+key
		};
	}
	else
	{
		return this.errors[key];
	}
}

ERROR_COLLECTION.prototype.throwError=function(key)
{
	SneakyConsole.error(ERRORS.get(key).code+"::"+ERRORS.get(key).text);
}

var ERRORS=new ERROR_COLLECTION();

//Networking
function NetworkEngine(config)
{
	this.socket=null;
	this.serverUrl='http://pongserver.fabs.c9.io';
	SneakyConsole.warn("networking disabled");
	
	this.connect=function()
	{
		SneakyConsole.log("connected to "+this.serverUrl);
	}
	this.register=function(entity)
	{
		SneakyConsole.log("registering "+entity.tag);
	}
	this.sendPosition=function(entity)
	{
		SneakyConsole.log("updating "+entity.tag);
	}
}

//Input handler
function InputEngine()
{
	var _self = this;
	this.keyArray=new Array();
	SneakyConsole.log("Inputmanager Started");
	
	document.onkeydown=function(e)
	{
		_self.keyArray[e.keyCode]=true;
	}
	
	document.onkeyup=function(e)
	{
		_self.keyArray[e.keyCode]=false;
	}
}

// Engine
function BoredEngine(config)
{
	// Private
	var _config = config;
	var _self = this;

	var _canvas;
	
	// Public
	this.config = _config;
	this.context = null;
	this.network=new NetworkEngine();
	this.input=new InputEngine();
	this.entities = new Array();
	
	this.systems = new Array();
	
	this.eventManager = new EventManager();
	this.entityManager = new EntityManager(this.eventManager);

	this.addSystem = function(system)
	{
		system.engine = this;
		this.systems.push(system);
	}
	
	this.init = function()
	{		
		_canvas = document.getElementById(_config.canvasId);
		this.context = _canvas.getContext("2d");
		
		//awesome logs!!!!!!!
		SneakyConsole.log("BoredEngine by Team Owesome");
		SneakyConsole.log("Initializing Engine...");
		SneakyConsole.log("Adding default systems...");
		
		this.addSystem(new GraphicSystem());
		this.addSystem(new ControllerSystem());
		this.addSystem(new LinearMovementSystem());
		
		_config.canvasSize.width = _canvas.width;
		_config.canvasSize.height = _canvas.height;
		
		
		this.network.connect();
		
		
		if (!_canvas)
		{
			ERRORS.throwError(ERRORS.NO_CANVAS);
		}
		else
		{
			this.prepareStuff();
			
			setInterval(this.render, _config.fps);
			setInterval(this.update, _config.ups);
		}
			
		SneakyConsole.info("Engine up and running");
	}
	this.prepareStuff=function()
	{
		var player = this.entityManager.createEntity();
		var player2 = this.entityManager.createEntity();
		
		var ball = this.entityManager.createEntity();
		
		var wall = this.entityManager.createEntity();
		var wall2 = this.entityManager.createEntity();
		
		this.entityManager.addComponentToEntity(player, new SpatialComponent({x:10, y:10, width: 10, height: 100}));
		this.entityManager.addComponentToEntity(player, new ControllerComponent({'upKey':87, 'downKey':83}));
		this.entityManager.addComponentToEntity(player, new GraphicsComponent());
		this.entityManager.addComponentToEntity(player, new CollisionComponent());
		this.entityManager.addComponentToEntity(player, new GameResetComponent());
		this.entityManager.addComponentToEntity(player, new PusherComponent());
		
		this.entityManager.addComponentToEntity(player2, new SpatialComponent({x:_config.canvasSize.width - 20, y:10, width: 10, height: 100}));
		this.entityManager.addComponentToEntity(player2, new ControllerComponent({'upKey':38, 'downKey':40}));
		this.entityManager.addComponentToEntity(player2, new GraphicsComponent());
		this.entityManager.addComponentToEntity(player2, new CollisionComponent());
		this.entityManager.addComponentToEntity(player2, new GameResetComponent());
		this.entityManager.addComponentToEntity(player2, new PusherComponent());
		
		for (var i = 0; i < 20; i++)
		{
			var ball = this.entityManager.createEntity();
			
			this.entityManager.addComponentToEntity(ball, new SpatialComponent({x:250, y:60, width: 10, height: 10}));
			this.entityManager.addComponentToEntity(ball, new GraphicsComponent());
			this.entityManager.addComponentToEntity(ball, new LinearMovementComponent());
			this.entityManager.addComponentToEntity(ball, new CollisionComponent());
		}
		
		this.entityManager.addComponentToEntity(wall, new SpatialComponent({x:0, y:0, width:_config.canvasSize.width, height: 20}));
		this.entityManager.addComponentToEntity(wall, new GraphicsComponent());
		this.entityManager.addComponentToEntity(wall, new CollisionComponent());
		
		this.entityManager.addComponentToEntity(wall2, new SpatialComponent({x:0, y:_config.canvasSize.height - 20, width:_config.canvasSize.width, height: 20}));
		this.entityManager.addComponentToEntity(wall2, new GraphicsComponent());
		this.entityManager.addComponentToEntity(wall2, new CollisionComponent());
		
		SneakyConsole.log("Entities created");
	}
	
	this.render = function()
	{
		for (var key in _self.systems)
		{
			var system = _self.systems[key];
			
			if (system.onRender)
			{
				system.onRender();
			}
		}
	}
	
	this.update = function()
	{		
		for (var key in _self.systems)
		{
			var system = _self.systems[key];
			
			if (system.onUpdate)
			{
				system.onUpdate();
			}
		}
	}
	
	this.init();
}

// --------------------
// EventManager
// --------------------

var EventManager = function()
{
	this.listeners = new Object();
}

EventManager.prototype.addListener = function(name, listener)
{
	if (!listener.onEvent)
	{
		var error = ERRORS.get(ERRORS.NO_ON_EVENT_FUNCTION);
		SneakyConsole.log(error.text);
	}

	var array = this.listeners[name];
	if (!array)
	{
		array = new Array();
		this.listeners[name] = array;
	}
	
	array.push(listener);
}

EventManager.prototype.removeListener = function(name, listener)
{
	var array = this.listeners[name];
	if (!array)
	{
		return;
	}
	
	var index = array.indexOf(listener);
	if (index != -1)
	{
		array.splice(index, 1);
	}
}

EventManager.prototype.fire = function(name, data)
{
	for (var key in this.listeners)
	{
		var listener = this.listeners[key];
		listener.onEvent(name, data);
	}
}

// --------------------
// TagManager
// --------------------

var TagManager = function(eventManager)
{
	
}

// --------------------
// EntityManager
// --------------------

var ENTITY_CREATED_EVENT = 'EntityCreatedEvent';
var ENTITY_DESTROYED_EVENT = 'EntityRemovedEvent';

var ENTITY_ADDED_COMPONENT_EVENT = 'EntityAddedComponentEvent';
var ENTITY_REMOVED_COMPONENT_EVENT = 'EntityRemovedComponentEvent';

var EntityManager = function(eventManager)
{
	// Private
	this._nextEntityIndex = 0;
	
	// Public
	this.entities = new Array();
	this.unusedEntities = new Array();
	
	this.components = new Object();
	this.eventManager = eventManager;
}

EntityManager.prototype.createEntity = function()
{
	var entityId;
	
	if (this.unusedEntities.length > 0)
	{
		entityId = this.unusedEntities.pop();
	}
	else
	{
		entityId = this._nextEntityIndex++;
	}
	
	this.eventManager.fire(ENTITY_CREATED_EVENT, {'entityId':entityId});
	return entityId;
}

EntityManager.prototype.destroyEntity = function(entityId)
{
	var index = this.entities.indexOf(entityId);
	
	if (index != -1)
	{
		this.entities.splice(index, 1);
		this.unusedEntities.push(entityId);
		this.eventManager.fire(ENTITY_DESTROYED_EVENT, {'entityId':entityId});
	}
}

EntityManager.prototype.addComponentToEntity = function(entityId, comp)
{
	var comps = this.components[comp.name];
	
	// If not yet set create it
	if (!comps)
	{
		comps = new Array();
		this.components[comp.name] = comps;
	}
	
	// Same here
	if (comps[entityId])
	{
		throw new Error("Component does already exist on entity");
	}
	
	comps[entityId] = comp;
	this.eventManager.fire(ENTITY_ADDED_COMPONENT_EVENT, {'entityId':entityId, 'component':comp});
	
}

EntityManager.prototype.removeComponentFromEntity = function(entityId, comp)
{
	var comps = this.components[comp.name];
	
	if (!comps)
	{
		return;
	}
	
	comps[entityId] = null;
}

EntityManager.prototype.getComponentOfEntity = function(entityId, compName)
{
	var comps = this.components[compName];
	
	if (!comps || !comps[entityId])
	{
		return new Array();
	}
	
	return comps[entityId];
}

EntityManager.prototype.getEntitiesWithComponent = function(compName)
{

	return this.components[compName];
}

EntityManager.prototype.getEntitiesWithComponents = function(compNameArray)
{
	var mergedArray = new Array();
	
	for (var key in compNameArray)
	{
		var compName = compNameArray[key];
		var entities = this.components[compName];
		
		
		
		for (var entKey in entities)
		{
			if (mergedArray.indexOf(entKey))
			{
				mergedArray.push(entityId);
			}
		}
	}

	return mergedArray;
}

// --------------------
// Component
// --------------------

var ComponentFactory = {};

ComponentFactory.createComponent = function(name, defaultData)
{
	var component = function(fillData)
	{
		this.name = name;

		for (var key in defaultData)
		{
			if (key == "name")
			{
				throw new Error("Don't use the name key in data");
			}
		
			if (fillData && fillData[key])
			{
				this[key] = fillData[key];
			}
			else
			{
				this[key] = defaultData[key];
			}
		}
	};
	
	return component;
}

ComponentFactory.createSystem = function(name, onInitFunc, onEventFunc, onRenderFunc, onUpdateFunc)
{
	var system = function(engine)
	{
		this.engine = engine;
		this.name = name;
		this.entities = new Array();
		
		this.onInit = onInitFunc;
		this.onEvent = onEventFunc;
		this.onRender = onRenderFunc;
		this.onUpdate = onUpdateFunc;
	}
	
	return system;
}

// --------------------
// Predefined Components
// --------------------

var SPATIAL_COMPONENT_NAME = "SpatialComponent";
var SpatialComponent = ComponentFactory.createComponent(SPATIAL_COMPONENT_NAME,
{
	x: 0,
	y: 0,
	vx: 0,
	vy: 0,
	width: 0,
	height: 0,
	angle: 0
});

var GRAPHICS_COMPONENT_NAME = "GraphicsComponent";
var GraphicsComponent = ComponentFactory.createComponent(GRAPHICS_COMPONENT_NAME);

var GraphicSystem = ComponentFactory.createSystem("GraphicsSystem",
function()
{
},
null,
function()
{
	this.engine.context.clearRect(0, 0, this.engine.config.canvasSize.width, this.engine.config.canvasSize.height);
	var entities = this.engine.entityManager.getEntitiesWithComponents([GRAPHICS_COMPONENT_NAME, SPATIAL_COMPONENT_NAME]);
	
	for (var entityId in entities)
	{
		var spatialComponent = this.engine.entityManager.getComponentOfEntity(entityId, SPATIAL_COMPONENT_NAME);
			
		this.engine.context.fillStyle = Color.randomColor();
		this.engine.context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
	}
},
null);


var NETWORK_COMPONENT_NAME = "NetworkComponent";
var NetworkComponent = ComponentFactory.createComponent(NETWORK_COMPONENT_NAME,
null,
function(entity)
{
	var spatialComponent = entity.getComponent(SPATIAL_COMPONENT_NAME);
	
	// Depends on spatial component
	if (spatialComponent)
	{
		entity.engine.network.sendPosition(entity);
	}
},
null);

var CONTROLLER_COMPONENT_NAME = "ContollerComponent";
var ControllerComponent = ComponentFactory.createComponent(CONTROLLER_COMPONENT_NAME,
{
	movementSpeed:2,
	upKey:38,
	downKey:40
});

var ControllerSystem = ComponentFactory.createSystem("ControllerSystem",
null,
null,
null,
function()
{
	var entities = this.engine.entityManager.getEntitiesWithComponents([CONTROLLER_COMPONENT_NAME, SPATIAL_COMPONENT_NAME]);

	for (var entityId in entities)
	{
		var spatialComponent = this.engine.entityManager.getComponentOfEntity(entityId, SPATIAL_COMPONENT_NAME);
		var controllerComponent = this.engine.entityManager.getComponentOfEntity(entityId, CONTROLLER_COMPONENT_NAME);
		
		
		if(this.engine.input.keyArray[controllerComponent.upKey])
		{
			spatialComponent.y -= controllerComponent.movementSpeed;
		}
		if(this.engine.input.keyArray[controllerComponent.downKey])
		{
			spatialComponent.y += controllerComponent.movementSpeed;
		}
	}
});

var PUSHER_COMPONENT_NAME = "PusherComponent";
var PusherComponent = ComponentFactory.createComponent(PUSHER_COMPONENT_NAME,
{
	pushDirectionX:0,
	pushDirectionY:0
},
null,
function(entity)
{
	var collisionComponent = entity.getComponent(COLLISION_COMPONENT_NAME);

	// Depends on spatial component
	if (collisionComponent)
	{
		for (var key in collisionComponent.data.collisionArray)
		{
			var otherEntity = collisionComponent.data.collisionArray[key];
			var otherSpatialComponent = otherEntity.getComponent(SPATIAL_COMPONENT_NAME);
			
			otherSpatialComponent.data.vx = this.data.pushDirectionX;
			otherSpatialComponent.data.vy = this.data.pushDirectionY;
		}
	}
});

var LINEAR_MOVEMENT_COMPONENT_NAME = "LinearMovementComponent";
var LinearMovementComponent = ComponentFactory.createComponent(LINEAR_MOVEMENT_COMPONENT_NAME,
{
	speed:10,
	speedIncrement:5,
	speedMax:40
});

var LinearMovementSystem = ComponentFactory.createSystem("LinearMovementSystem",
null,
null,
null,
function()
{
	var entities = this.engine.entityManager.getEntitiesWithComponents([LINEAR_MOVEMENT_COMPONENT_NAME, SPATIAL_COMPONENT_NAME]);

	for (var entityId in entities)
	{
		var spatialComponent = this.engine.entityManager.getComponentOfEntity(entityId, SPATIAL_COMPONENT_NAME);
		var linearMovementComponent = this.engine.entityManager.getComponentOfEntity(entityId, LINEAR_MOVEMENT_COMPONENT_NAME);
	
		if(linearMovementComponent.speed < linearMovementComponent.speedMax)
		{
			linearMovementComponent.speed += linearMovementComponent.speedIncrement;
		}
		else
		{
			linearMovementComponent.speed=10;
		}
		
		if (spatialComponent.vx == 0)
		{
			spatialComponent.vx = Math.random()*20-10;
			spatialComponent.vy = Math.random()*10-5;
		}
		
		spatialComponent.x+=spatialComponent.vx;
		spatialComponent.y+=spatialComponent.vy;
	}
});


var GOAL_COMPONENT_NAME = "GoalComponent";
var GOALComponent = ComponentFactory.createComponent(GOAL_COMPONENT_NAME,
{
	income:0
});

var GoalSystem = ComponentFactory.createSystem("GoalSystem",
null,
null,
null,
function()
{
	var balls = this.engine.entityManager.getEntitiesWithComponents([LINEAR_MOVEMENT_COMPONENT_NAME]);
	var entities = this.engine.entityManager.getEntitiesWithComponents([GOAL_COMPONENT_NAME]);

});

var COLLISION_COMPONENT_NAME = "CollisionComponent";
var CollisionComponent = ComponentFactory.createComponent(COLLISION_COMPONENT_NAME,
{collisionArray:new Array()},
null,
function(entity)
{
	var spatialComponent = entity.getComponent(SPATIAL_COMPONENT_NAME);
	
	
	this.data.collisionArray = new Array();
	
	// Depends on spatial component
	if (spatialComponent)
	{
		for (var key in entity.engine.entities)
		{
			var otherEntity = entity.engine.entities[key];
			var otherSpatialComponent = otherEntity.getComponent(SPATIAL_COMPONENT_NAME);
			
			if (otherEntity != entity && otherSpatialComponent)
			{
				
				var rect1 = 
				{
					left: spatialComponent.data.x,
					right: spatialComponent.data.x + spatialComponent.data.width,
					top: spatialComponent.data.y,
					bottom: spatialComponent.data.y + spatialComponent.data.height
				}
				
				var rect2 =
				{
					left: otherSpatialComponent.data.x,
					right: otherSpatialComponent.data.x + otherSpatialComponent.data.width,
					top: otherSpatialComponent.data.y,
					bottom: otherSpatialComponent.data.y + otherSpatialComponent.data.height
				}
				
				if (!(rect2.left > rect1.right || 
					  rect2.right < rect1.left || 
					  rect2.top > rect1.bottom ||
					  rect2.bottom < rect1.top))
				{
					this.data.collisionArray.push(otherEntity);
				}
			}
		}
	}
});

var GAME_RESET_COMPONENT_NAME = "GameResetComponent";
var GameResetComponent = ComponentFactory.createComponent(GAME_RESET_COMPONENT_NAME,
{resetButton:82},
function(entity)
{
	if(entity.engine.input.keyArray[this.data.resetButton])
	{
		SneakyConsole.log("reset button clicked");
	}
},
null);

// --------------------
// Color
// --------------------

var Color = {};

Color.randomColor = function()
{
	var r = Math.round((Math.random() * 255));
	var b = Math.round((Math.random() * 255));
	var g = Math.round((Math.random() * 255));
	var a = Math.round((Math.random() * 255));
	
	return "rgba(" + r + "," + b + ","+ g +","+ a +")";
}


// --------------------
// Rectangle
// --------------------

var Rectangle = function(x, y, width, height)
{
	this.x = x != undefined ? x : 0;
	this.y = y != undefined ? y : 0;
	this.width = width != undefined ? width : 0;
	this.height = height != undefined ? height : 0;
}

Rectangle.prototype.intersects = function(rect)
{
	return (this.x <= rect.x + rect.width && rect.x <= this.x + this.width &&
    this.y <= rect.y + rect.height && rect.y <= this.y + this.height);
}

Rectangle.prototype.intersection = function(rect)
{
	var x0 = Math.max(this.x, rect.x);
	var x1 = Math.min(this.x + this.width, rect.x + rect.width);

	if(x0 <= x1)
	{
			var y0 = Math.max(this.y, rect.y);
			var y1 = Math.min(this.y + this.height, rect.y + rect.height);

			if(y0 <= y1)
			{
					return new Rectangle(x0, y0, x1 - x0, y1 - y0);
			}
	}
	return null;
}

Rectangle.prototype.isEqual = function(rect)
{
	return (this.x == rect.x
			&& this.x == rect.y
			&& this.width == rect.width
			&& this.height == rect.height);
}

Rectangle.prototype.containsPoint = function(x, y)
{
    return (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height);
}

Rectangle.prototype.clone = function()
{
    return new Rectangle(this.x, this.y, this.width, this.height);  
}

Rectangle.prototype.toString = function()
{
    return "(x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";    
}


