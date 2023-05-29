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
Soleng.Economics = {}
Soleng.Economics.Resources = {
	Resource: class {
		constructor(name, marketValue, volume, amount) {
			this.name = name || "Metal Ore"
			this.marketValue = marketValue || 10 // per Unit
			this.volume      = volume      ||  1 // Meters Cubed
			this.amount      = amount      || 10 // Current Units
		}
	}
}
Soleng.Economics.Departments = {
	Department: class {
		constructor(name, type, productivity, budget, morale, manager) {
			this.name = name || "Half Section"
			this.type = type || "Redundant"
			this.productivity = productivity || 1.0 // Output per unit time
			this.budget       = budget       ||   5 // Cost per unit time
			this.morale       = morale       || 1.0 // Productivity modifier
			this.manager      = manager      || 0.9 // Accuracy modifier
		}
		cost(time) {
			time = time || 1
			return time * (this.budget - Math.random() * (this.budget * (this.manager - 1)))
		}
		operate(time) {
			time = time || 1
			return time * (this.productivity - Math.random() * (this.productivity * (this.morale - 1)))
		}
	}
}
Soleng.Economics.Corporations = {}
Soleng.Economics.Corporations.Subsidiary = class {
	constructor(funds, resource, departments, log) {
		this.funds    = funds    || 1_000_000
		this.resource = resource || new Soleng.Economics.Resources.Resource("Iron Ore")
		this.log      = log      || new Soleng.Events.Observer()
		this.Departments = departments || [
			new Soleng.Economics.Departments.Department("Mining Division", "Extraction"),
			new Soleng.Economics.Departments.Department("Logistics Division", "Conversion")
		]

		this.timePassed = 0
	}
	operate(time) {
		time = time || 1;
		let profit = 0
		for (let department of this.Departments) {
			let operatingCost = department.cost(time)
			this.funds -= operatingCost
			profit -= operatingCost
			this.log.addEvent(`${department.name} consumed "${operatingCost}" credits.`)
			if (department.type === "Extraction") {
				let resources = department.operate(time)
				this.log.addEvent(`${department.name} generated "${resources}" ${this.resource.name}.`)
				this.resource.amount += resources
			}
			if (department.type === "Conversion") {
				let unitsSold = Math.min(department.operate(time), this.resource.amount)
				this.resource.amount -= unitsSold
				let revenue = unitsSold * (this.resource.marketValue - this.resource.marketValue * (Math.random() * (1 - department.manager)))
				this.funds += revenue
				profit += revenue
				this.log.addEvent(`${department.name} sold ${unitsSold} ${this.resource.name} for ${revenue} credits.`)
			}
		}
		this.timePassed += time
		this.log.addEvent(`Total profit over the last ${time} days: ${profit}`)
	}
	debug() {
		console.log('+-----------------------------------------+');
		console.log('|              CORPORATION                |');
		console.log('|                                         |');
		console.log(`| Current Funds: ${this.funds} Credits       |`);
		console.log('|                                         |');
		console.log('|+----------------+-----+----------------+|');
		console.log('||    Resource    |Unit | Market Value  ||');
		console.log('|+----------------+-----+----------------+|');
		console.log(`|| ${this.resource.name} | ${this.resource.amount} | ${this.resource.marketValue} Credits ||`);
		console.log('|+----------------+-----+----------------+|');
		console.log('|                                         |');
		console.log('|+---------------+------------------+-----+---------+----------+---------------------+');
		console.log('||  Department   | Productivity/Hr  |Budget|  Morale |ManagerSkill|Resource Produced/Sold|');
		console.log('|+---------------+------------------+-----+---------+----------+---------------------+');
		
		for(let department of this.Departments){
			let deptName = department.name;
			let prod = department.productivity;
			let budget = department.budget;
			let morale = department.morale;
			let manager = department.manager;
			
			console.log(`|| ${deptName} | ${prod} units | ${budget} | ${morale} | ${manager} |`);
			console.log('|+---------------+------------------+-----+---------+----------+');
		}
		console.log('|                                         |');
		console.log(`| Time Passed: ${this.timePassed} Days                    |`);
		console.log('+-----------------------------------------+');
	}
}