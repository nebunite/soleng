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

		this.Fonts = []

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
    fillCircle(x, y, radius, color) {
        let ctx = this.Context

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
    strokeCircle(x, y, radius, color) {
    	let ctx = this.Context;
	    ctx.beginPath();
	    ctx.arc(x, y, radius, 0, 2 * Math.PI);
	    ctx.strokeStyle = color;
	    ctx.stroke();

    }
	fillRect(x, y, width, height, color) {
		let ctx = this.Context
		ctx.fillStyle = color
		ctx.fillRect(x, y, width, height)
	}
	strokeRect(x, y, width, height, color) {
		let ctx = this.Context
		ctx.strokeStyle = color
		ctx.strokeRect(x, y, width, height)
	}
	strokeLine(x1, y1, x2, y2, color = 'white') {
		let ctx = this.Context
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.strokeStyle = color;
		ctx.stroke();
	}
	drawText(x, y, text, color = 'white', align = 'center', font) {
		let ctx = this.Context
		if (font) { ctx.font = font}
		ctx.fillStyle = color
		ctx.textAlign = align
		ctx.fillText(text, x, y)
	}
	getFont() {
		let ctx = this.Context
		let fontSetting = ctx.font
		let font = fontSetting.slice(fontSetting.indexOf(" ") + 1)

		return font
	}
	fillTextArea(x, y, width, height, text, color = 'white', align = 'center', font = this.getFont()) {
		let ctx = this.Context
		ctx.fillStyle = color
		let fontSize = Math.round(height * 0.8)
		ctx.font = `${fontSize}px ${font}`
		// Scale
		let textWidth = ctx.measureText(text).width 
		while (textWidth > width && fontSize > 0) {
			fontSize--
			ctx.font = `${fontSize}px ${font}`
			textWidth = ctx.measureText(text).width
		}
		// Align
		let textX
		switch(align) {
			case 'center':
				textX = x + (width - textWidth) / 2
				break;
			case 'right':
				textX = x + width - textWidth
				break;
			default:
				textX = x
		}
		let textY = Math.round(y + (height + fontSize * 0.8) / 2)
		this.drawText(textX, textY, text, color, 'left', font)
	}
    clear(color) {
        let ctx = this.Context
        color = color || "black"

        ctx.fillStyle = color
        ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.width)
    }
	addFont(fontName, urlPath) {
		var newStyle = document.createElement('style');
		newStyle.appendChild(document.createTextNode(`
			@font-face {
				font-family: ${fontName};
				src: url(${urlPath}) format('opentype');
			}
		`));
		document.head.appendChild(newStyle);

	}
    drawGrid(x, y, width, height, grid) {
        let cellWidth = Math.floor(width / grid.width);
        let cellHeight = Math.floor(height / grid.height);

        for (let i = 0; i < grid.height; i++) {
            for (let j = 0; j < grid.width; j++) {
                let glyph = grid.getGlyphAt(j, i);

                // Draw the background color of the cell
                if (glyph.bgColor) {
                    this.fillRect(x + j * cellWidth, y + i * cellHeight, cellWidth, cellHeight, glyph.bgColor);
                }

                // Draw the glyph character in the foreground color
                if (glyph.symbol && glyph.fgColor) {
                    this.fillTextArea(x + j * cellWidth, y + i * cellHeight, cellWidth, cellHeight, glyph.symbol, glyph.fgColor, 'center', grid.font);
                }
            }
        }
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
		Text: class {
			constructor(x, y, string, color) {
				this.x = x
				this.y = y
				this.string = string
				this.color = color
				this.type = "Text"
			}
		},
		Value: class {
			constructor(x, y, w, h, target, value, color) {
				this.x = x
				this.y = y
				this.w = w
				this.h = h
				this.target = target
				this.value = value
				this.color = color
				this.type = "Value"				
			}
		},
		Glyph: class {
			constructor(symbol, fgColor, bgColor) {
				this.symbol  = symbol || ' ';
				this.fgColor = fgColor || 'white';
				this.bgColor = bgColor || 'black';
			}
		}
	},
	Composite: {
		Grid: class {
			constructor(width, height, font, fillGlyph) {
				this.width     = width     || 10
				this.height    = height    || 10
				this.font      = font      || 'Consolas'
				this.fillGlyph = fillGlyph || new Soleng.Graphics.Shape.Glyph('M', 'white', 'black')

				this.grid = new Array(height);
				for (let y = 0; y < height; y++) {
					this.grid[y] = new Array(width);
					for (let x = 0; x < width; x++) {
						this.grid[y][x] = new Soleng.Graphics.Shape.Glyph(
							this.fillGlyph.symbol,
							this.fillGlyph.fgColor,
							this.fillGlyph.bgColor
						);
					}
				}
			}
			getGlyphAt(x, y) {
				if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
					return null;
				}
				return this.grid[y][x];
			}
			setGlyphAt(x, y, glyph) {
				if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
					return; // Out of bounds
				}
				this.grid[y][x] = glyph;
			}
			writeText(x, y, text) {
				for (let i = 0; i < text.length; i++) {
					if (x + i >= this.width) { break }
					this.grid[y][x+i].symbol = text[i]
				}
			}
			drawBox(x, y, width, height, corner = '+', horizontal = '-', vertical = '|', blank = ' ') {
				let cornerGlyph = new Soleng.Graphics.Shape.Glyph(
					corner, 
					this.fillGlyph.fgColor,
					this.fillGlyph.bgColor
				)
				let horizontalGlyph = new Soleng.Graphics.Shape.Glyph(
					horizontal, 
					this.fillGlyph.fgColor,
					this.fillGlyph.bgColor
				)
				let verticalGlyph = new Soleng.Graphics.Shape.Glyph(
					vertical, 
					this.fillGlyph.fgColor,
					this.fillGlyph.bgColor
				)
				let blankGlyph = new Soleng.Graphics.Shape.Glyph(
					blank, 
					this.fillGlyph.fgColor,
					this.fillGlyph.bgColor
				)
				for (let dx = 0; dx < width; dx++) {
					for (let dy = 0; dy < height; dy++) {
						if ((dx === 0 || dx === width - 1) && (dy === 0 || dy === height - 1)) {
							this.setGlyphAt(x + dx, y + dy, cornerGlyph)
						} else if (dy === 0 || dy === height - 1) {
							this.setGlyphAt(x + dx, y + dy, horizontalGlyph)
						} else if (dx === 0 || dx === width - 1) {
							this.setGlyphAt(x + dx, y + dy, verticalGlyph)
						} else {
							this.setGlyphAt(x + dx, y + dy, blankGlyph)
						}
					}
				}
			}
		}
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
					this.display.fillCircle(
						sprite.x,
						sprite.y,
						sprite.radius,
						sprite.color
					)
					break;
				case "Ring":
					this.display.strokeCircle(
						sprite.x,
						sprite.y,
						sprite.radius,
						sprite.color
					)
					break;
				case "Text":
					this.display.drawText(
						sprite.x,
						sprite.y,
						sprite.string,
						sprite.color,
						'center'
					)
					break;
				case "Value":
					this.display.fillTextArea(
						sprite.x,
						sprite.y,
						sprite.w,
						sprite.h,
						sprite.target[sprite.value],
						sprite.color,
						'center'
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
	constructor(name, funds, resource, departments, log) {
		this.name     = name     || "Technora Corporation"
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
		console.log('+----------------------------------------------------------------------------------+');
		console.log('| Soleng Corporation                                                               |');
		console.log(`| Funds: ${this.funds}    Time: ${this.timePassed}                                  |`);
		console.log('+----------------------------------------------------------------------------------+');
		console.log('| Department         | Productivity | Budget | Morale | Manager Skill | Operation  |');
		console.log('|----------------------------------------------------------------------------------|');
		
		for(let department of this.Departments) {
			let deptName = department.name.padEnd(18, ' ');
			let prod = department.productivity.toString().padEnd(13, ' ');
			let budget = department.budget.toString().padEnd(7, ' ');
			let morale = department.morale.toString().padEnd(7, ' ');
			let manager = department.manager.toString().padEnd(14, ' ');
			let operation = '            '
	
			console.log(`| ${deptName}| ${prod}| ${budget}| ${morale}| ${manager}| ${operation}|`);
		}
	
		console.log('+----------------------------------------------------------------------------------+');
		console.log('| Resources          | Amount       | Market Value | Volume                      |');
		console.log('|----------------------------------------------------------------------------------|');
		let resName = this.resource.name.padEnd(18, ' ');
		let resAmount = this.resource.amount.toString().padEnd(12, ' ');
		let resMarketValue = `${this.resource.marketValue}/Unit`.padEnd(13, ' ');
		let resVolume = `${this.resource.volume} m^3/Unit`.padEnd(30, ' ');
	
		console.log(`| ${resName}| ${resAmount}| ${resMarketValue}| ${resVolume}|`);
		console.log('+----------------------------------------------------------------------------------+');
	}
	
}