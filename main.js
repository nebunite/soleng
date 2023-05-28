const Soleng = {}

Soleng.Math = {
	isWithinRadius: function (pointX, pointY, objectX, objectY, radius) {
		let dx = pointX - objectX;
		let dy = pointY - objectY;
		let distance = Math.sqrt(dx*dx + dy*dy);

		return distance <= radius;
	}	
}
Soleng.Events = {
	Event: class {
		constructor (x, y, type)  {
			this.x = x
			this.y = y 
			this.type = type
		}
	},
	Observer: class {
		constructor() {
			this.Log = []
		}
		addEvent(event) {
			this.Log.push(event)
		}
		clearEvents() {
			this.Log = []
		}
	}
}
Soleng.WorldGeneration = {
	Planet: class {
		constructor(orbit, mass) {
			this.orbit = orbit
			this.mass  = mass
		}
	},
	Star: class {
		constructor(x, y, mass, planets) {
			this.x     = x
			this.y     = y
			this.mass  = mass
			this.color = "white"

			this.Planets = []

			let rejectCounter = 0
			let invalidPlanet = false
			let panic = false
			let maxReject = false
			while (this.Planets.length < planets) {
				invalidPlanet = false
				let temporaryPlanet = new Soleng.WorldGeneration.Planet(
					Math.round(this.mass + Math.random() * 60),
					Math.ceil(Math.random() * 5)
				)
				for (let planet of this.Planets) {
					if (
						planet.orbit + planet.mass >= temporaryPlanet.orbit - temporaryPlanet.mass &&
						planet.orbit - planet.mass <= temporaryPlanet.orbit + temporaryPlanet.mass
					) {
						rejectCounter++
						if (rejectCounter > maxReject) {
							panic = true
							break;
						}
						invalidPlanet = true
						break;
					}
				}
				if (panic) { break }
				if (invalidPlanet) { continue }
				this.Planets.push(temporaryPlanet)
			}
			// console.log(`${rejectCounter} planets rejected!`)

			switch (Math.round(mass)) {
				case 0:
					this.color = "purple"
					break
				case 1:
					this.color = "red"
					break;
				case 2:
					this.color = "orange"
					break;
				case 3:
					this.color = "yellow"
					break;
				case 4:
					this.color = "white"
					break;
				case 5:
					this.color = "blue"
					break;
			}		
		}
	},
	Constellation: class {
		constructor(width, height, stars) {
			this.Stars = []
			let rejectCounter = 0
			let invalidStar = false
			while (this.Stars.length < stars) {
				invalidStar = false
				let temporaryStar = new Soleng.WorldGeneration.Star(
					Math.round(Math.random() *  width),
					Math.round(Math.random() * height),
					Math.random() * 5,
					Math.round(Math.random() * 10)
				)
				for (let star of this.Stars) {
					if (
						Soleng.Math.isWithinRadius(
							temporaryStar.x,
							temporaryStar.y,
							star.x,
							star.y,
							(star.mass + temporaryStar.mass) * 10
						)
					) {
						rejectCounter++
						invalidStar = true
						break;
					}
				}
				if (invalidStar) { continue }
				this.Stars.push(temporaryStar)
			}
			console.log(`${rejectCounter} stars rejected!`)
		}
	}
}
Soleng.Display = class {
    constructor(width, height, observer) {
        this.Canvas  = document.createElement("canvas");
        this.Canvas.width  = width;
        this.Canvas.height = height;
        this.Context = this.Canvas.getContext("2d");

        this.Observer = observer

        this.Canvas.addEventListener("click", this.handleClick.bind(this));
    }
    handleClick(event) {
        let rect = this.Canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        console.log("x: " + x + " y: " + y);

        if (this.Observer) {
        	this.Observer.addEvent(
        		new Soleng.Events.Event(x, y, "click")
    		)
        }
    }
    drawCircle(x, y, radius, color) {
        let ctx = this.Context

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
    drawRing(x, y, radius, color) {
    	let ctx = this.Context;
	    ctx.beginPath();
	    ctx.arc(x, y, radius, 0, 2 * Math.PI);
	    ctx.strokeStyle = color;
	    ctx.stroke();

    }
    clear(color) {
        let ctx = this.Context
        color = color || "black"

        ctx.fillStyle = color
        ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.width)
    }
}
Soleng.Graphics = {
	Shape: {
		Circle: class {
			constructor(x, y, radius, color) {
				this.x = x
				this.y = y;
				this.radius = radius;
				this.color  = color;
				this.type = "Circle"
			}
		},
		Ring: class {
			constructor(x, y, radius, color) {
				this.x = x
				this.y = y;
				this.radius = radius;
				this.color  = color;
				this.type = "Ring"
			}
		},
	}
}
Soleng.Scene = class {
	constructor(display, name, customMethods = {}) {
		this.name    = name    || "Default Scene";
		this.Sprites = []
		this.display = display

		this.exitScene   = customMethods.exitScene   || this.exitScene;
		this.enterScene  = customMethods.enterScene  || this.enterScene;
		this.updateScene = customMethods.updateScene || this.updateScene;
		this.renderScene = customMethods.renderScene || this.renderScene;
	}
	enterScene () {
		console.log(`Entering ${this.name}!`)
	}
	exitScene  () {
		console.log(`Exiting ${this.name}!`)
	}
	updateScene() {
		// This code will get overwritten
		console.log(`${this.name} is updating!`)
	}
	renderScene() {
		// This code will get overwritten
		console.log(`${this.name} is rendering!`)
		this.display.clear();
		for (let sprite of this.Sprites) {
			switch (sprite.type) {
				case "Circle":
					this.display.drawCircle(
						sprite.x,
						sprite.y,
						sprite.radius,
						sprite.color
					)
					break;
				case "Ring":
					this.display.drawRing(
						sprite.x,
						sprite.y,
						sprite.radius,
						sprite.color
					)
					break;
				default:
					console.log("I don't know this shape!")
					break;
			}
		}
	}
}

const Game = {}
Game.Log = new Soleng.Events.Observer()
Game.Display = new Soleng.Display(800, 600, Game.Log)
Game.World = new Soleng.WorldGeneration.Constellation(800, 600, 50)
Game.Scene = {
	WorldMap: new Soleng.Scene(
		Game.Display,
		"World Map",
		{
			enterScene: function (stars) {
				// Clear any existing Sprites
				this.Sprites = [];
				// Generate sprites for the Stars
				for (let star of stars) {
					this.Sprites.push(
						new Soleng.Graphics.Shape.Circle(
							star.x,
							star.y,
							star.mass * 5,
							star.color
						)
					)
				}
			}
		}
	),
	LocalMap: new Soleng.Scene(
		Game.Display,
		"Local Map",
		{
			enterScene: function (star) {
				this.Sprites = []
				// Render Star
				this.Sprites.push(
					new Soleng.Graphics.Shape.Circle(
						0,
						300,
						star.mass * 20,
						star.color
					)
				)
				// Render Planets
				for (let planet of star.Planets) {
					let orbit = (star.mass + 1) * 20 + (planet.orbit + 1) * 10
					this.Sprites.push(
						new Soleng.Graphics.Shape.Ring(
							0, 300, orbit, "white"))
					this.Sprites.push(
						new Soleng.Graphics.Shape.Circle(
							orbit,
							300,
							planet.mass * 5,
							"green"
						)
					)
				}
			}
		})
}

document.body.appendChild(Game.Display.Canvas);
// Game.Scene.WorldMap.enterScene(Game.World.Stars)
// Game.Scene.WorldMap.renderScene()
Game.Scene.LocalMap.enterScene(Game.World.Stars[0])
Game.Scene.LocalMap.renderScene()


/*
function checkClicks () {
	for (let click of log.Log) {
		let starFound = false
		for (let star of constellation.Stars) {
			if (Soleng.Math.isWithinRadius(
				click.x,
				click.y,
				star.x,
				star.y,
				star.mass * 5)
			) {
				starFound = true
				console.log(`Star at (${click.x}, ${click.y}) is ${star.color} `)
				break
			}
		}
		if (!starFound) { console.log("Didn't find a star here!") }
	}
	log.clearEvents()
}
*/