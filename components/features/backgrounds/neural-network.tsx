import { useEffect, useRef } from "react"
import _ from 'lodash'

const createCanvas = () => {
  /**
   * @author Alex Andrix <alex@alexandrix.com>
   * @since 2018-12-02
   * https://codepen.io/alexandrix/pen/oQOvYp
   */

  const App: any = {
    setup: {},
    evolve: {},
    birth: {},
    kill: {},
    move: {},
    initDraw: {},
    draw: {},
    dataXYtoCanvasXY: {},
  }
  App.setup = function () {
    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    this.canvas = canvas
    document.getElementsByTagName('body')[0].appendChild(canvas)
    this.ctx = this.canvas.getContext('2d')
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.dataToImageRatio = 1
    this.ctx.imageSmoothingEnabled = false
    this.ctx.webkitImageSmoothingEnabled = false
    this.ctx.msImageSmoothingEnabled = false
    this.xC = this.width / 2
    this.yC = this.height / 2

    this.stepCount = 0
    this.particles = []
    this.lifespan = 1000
    this.popPerBirth = 1
    this.maxPop = 300
    this.birthFreq = 2

    // Build grid
    this.gridSize = 8// Motion coords
    this.gridSteps = Math.floor(1000 / this.gridSize)
    this.grid = []
    let i = 0
    for (let xx = -500; xx < 500; xx += this.gridSize) {
      for (let yy = -500; yy < 500; yy += this.gridSize) {
        // Radial field, triangular function of r with max around r0
        const r = Math.sqrt(xx * xx + yy * yy),
          r0 = 100,
          field

        if (r < r0) field = 255 / r0 * r
        else if (r > r0) field = 255 - Math.min(255, (r - r0) / 2)

        this.grid.push({
          x: xx,
          y: yy,
          busyAge: 0,
          spotIndex: i,
          isEdge: (xx == -500 ? 'left' :
            (xx == (-500 + this.gridSize * (this.gridSteps - 1)) ? 'right' :
              (yy == -500 ? 'top' :
                (yy == (-500 + this.gridSize * (this.gridSteps - 1)) ? 'bottom' :
                  false
                )
              )
            )
          ),
          field: field
        })
        i++
      }
    }
    this.gridMaxIndex = i

    // Counters for UI
    this.drawnInLastFrame = 0
    this.deathCount = 0

    this.initDraw()
  }
  App.evolve = function () {
    const time1 = performance.now()

    this.stepCount++

    // Increment all grid ages
    this.grid.forEach(function (e: { busyAge: number }) {
      if (e.busyAge > 0) e.busyAge++
    })

    if (this.stepCount % this.birthFreq == 0 && (this.particles.length + this.popPerBirth) < this.maxPop) {
      this.birth()
    }
    App.move()
    App.draw()

    const time2 = performance.now()

    // Update UI
    // document.getElementsByClassName('dead')[0].textContent = this.deathCount
    // document.getElementsByClassName('alive')[0].textContent = this.particles.length
    // document.getElementsByClassName('fps')[0].textContent = Math.floor(1000 / (time2 - time1))
    // document.getElementsByClassName('drawn')[0].textContent = this.drawnInLastFrame

  }
  App.birth = function () {
    let x = 0
    let y = 0
    const gridSpotIndex = Math.floor(Math.random() * this.gridMaxIndex),
      gridSpot = this.grid[gridSpotIndex],
      x = gridSpot.x, y = gridSpot.y

    const particle = {
      hue: 200,// + Math.floor(50*Math.random()),
      sat: 95,//30 + Math.floor(70*Math.random()),
      lum: 20 + Math.floor(40 * Math.random()),
      x: x, y: y,
      xLast: x, yLast: y,
      xSpeed: 0, ySpeed: 0,
      age: 0,
      ageSinceStuck: 0,
      attractor: {
        oldIndex: gridSpotIndex,
        gridSpotIndex: gridSpotIndex,// Pop at random position on grid
      },
      name: 'seed-' + Math.ceil(10000000 * Math.random())
    }
    this.particles.push(particle)
  }
  App.kill = function (particleName: any) {
    const newArray = _.reject(this.particles, function (seed: any) {
      return (seed.name == particleName)
    })
    this.particles = _.cloneDeep(newArray)
  }
  App.move = function () {
    for (let i = 0; i < this.particles.length; i++) {
      // Get particle
      const p = this.particles[i]

      // Save last position
      p.xLast = p.x; p.yLast = p.y

      // Attractor and corresponding grid spot
      const index = p.attractor.gridSpotIndex
      let gridSpot = this.grid[index]

      // Maybe move attractor and with certain constraints
      if (Math.random() < 0.5) {
        // Move attractor
        if (!gridSpot.isEdge) {
          // Change particle's attractor grid spot and local move function's grid spot
          const topIndex = index - 1,
            bottomIndex = index + 1,
            leftIndex = index - this.gridSteps,
            rightIndex = index + this.gridSteps,
            topSpot = this.grid[topIndex],
            bottomSpot = this.grid[bottomIndex],
            leftSpot = this.grid[leftIndex],
            rightSpot = this.grid[rightIndex]

          // Choose neighbour with highest field value (with some desobedience...)
          const chaos = 30
          const maxFieldSpot = _.maxBy([topSpot, bottomSpot, leftSpot, rightSpot], function (e: { field: number }) {
            return e.field + chaos * Math.random()
          })

          const potentialNewGridSpot = maxFieldSpot
          if (potentialNewGridSpot.busyAge == 0 || potentialNewGridSpot.busyAge > 15) {// Allow wall fading
            //if (potentialNewGridSpot.busyAge == 0) {// Spots busy forever
            // Ok it's free let's go there
            p.ageSinceStuck = 0// Not stuck anymore yay
            p.attractor.oldIndex = index
            p.attractor.gridSpotIndex = potentialNewGridSpot.spotIndex
            gridSpot = potentialNewGridSpot
            gridSpot.busyAge = 1
          } else p.ageSinceStuck++

        } else p.ageSinceStuck++

        if (p.ageSinceStuck == 10) this.kill(p.name)
      }

      // Spring attractor to center with viscosity
      const k = 8, visc = 0.4
      const dx = p.x - gridSpot.x,
        dy = p.y - gridSpot.y,
        dist = Math.sqrt(dx * dx + dy * dy)

      // Spring
      const xAcc = -k * dx,
        yAcc = -k * dy

      p.xSpeed += xAcc; p.ySpeed += yAcc

      // Calm the f*ck down
      p.xSpeed *= visc; p.ySpeed *= visc

      // Store stuff in particle brain
      p.speed = Math.sqrt(p.xSpeed * p.xSpeed + p.ySpeed * p.ySpeed)
      p.dist = dist

      // Update position
      p.x += 0.1 * p.xSpeed; p.y += 0.1 * p.ySpeed

      // Get older
      p.age++

      // Kill if too old
      if (p.age > this.lifespan) {
        this.kill(p.name)
        this.deathCount++
      }
    }
  }
  App.initDraw = function () {
    this.ctx.beginPath()
    this.ctx.rect(0, 0, this.width, this.height)
    this.ctx.fillStyle = 'black'
    this.ctx.fill()
    this.ctx.closePath()
  }
  App.draw = function () {
    this.drawnInLastFrame = 0
    if (!this.particles.length) return false

    this.ctx.beginPath()
    this.ctx.rect(0, 0, this.width, this.height)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    //this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    this.ctx.fill()
    this.ctx.closePath()

    for (let i = 0; i < this.particles.length; i++) {
      // Draw particle
      const p = this.particles[i]

      let h = 0
      let s = 0
      let l = 0
      let a = 0

      h = p.hue + this.stepCount / 30
      s = p.sat
      l = p.lum
      a = 1

      const last = this.dataXYtoCanvasXY(p.xLast, p.yLast),
        now = this.dataXYtoCanvasXY(p.x, p.y)
      const attracSpot = this.grid[p.attractor.gridSpotIndex],
        attracXY = this.dataXYtoCanvasXY(attracSpot.x, attracSpot.y)
      const oldAttracSpot = this.grid[p.attractor.oldIndex],
        oldAttracXY = this.dataXYtoCanvasXY(oldAttracSpot.x, oldAttracSpot.y)

      this.ctx.beginPath()

      this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')'
      this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')'

      // Particle trail
      this.ctx.moveTo(last.x, last.y)
      this.ctx.lineTo(now.x, now.y)

      this.ctx.lineWidth = 1.5 * this.dataToImageRatio
      this.ctx.stroke()
      this.ctx.closePath()

      // Attractor positions
      this.ctx.beginPath()
      this.ctx.lineWidth = 1.5 * this.dataToImageRatio
      this.ctx.moveTo(oldAttracXY.x, oldAttracXY.y)
      this.ctx.lineTo(attracXY.x, attracXY.y)
      this.ctx.arc(attracXY.x, attracXY.y, 1.5 * this.dataToImageRatio, 0, 2 * Math.PI, false)

      //a /= 20
      this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')'
      this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')'
      this.ctx.stroke()
      this.ctx.fill()

      this.ctx.closePath()

      // UI counter
      this.drawnInLastFrame++
    }

  }
  App.dataXYtoCanvasXY = function (x: number, y: number) {
    const zoom = 1.6
    const xx = this.xC + x * zoom * this.dataToImageRatio,
      yy = this.yC + y * zoom * this.dataToImageRatio

    return { x: xx, y: yy }
  }

  /**
   * Some old util I use at times
   *
   * @param {Number} Xstart X value of the segment starting point
   * @param {Number} Ystart Y value of the segment starting point
   * @param {Number} Xtarget X value of the segment target point
   * @param {Number} Ytarget Y value of the segment target point
   * @param {Boolean} realOrWeb true if Real (Y towards top), false if Web (Y towards bottom)
   * @returns {Number} Angle between 0 and 2PI
   */
  const segmentAngleRad = (Xstart: number, Ystart: number, Xtarget: number, Ytarget: number, realOrWeb: boolean): number => {
    let result = 0 // Will range between 0 and 2PI
    if (Xstart == Xtarget) {
      if (Ystart == Ytarget) {
        result = 0
      } else if (Ystart < Ytarget) {
        result = Math.PI / 2
      } else if (Ystart > Ytarget) {
        result = 3 * Math.PI / 2
      }
    } else if (Xstart < Xtarget) {
      result = Math.atan((Ytarget - Ystart) / (Xtarget - Xstart))
    } else if (Xstart > Xtarget) {
      result = Math.PI + Math.atan((Ytarget - Ystart) / (Xtarget - Xstart))
    }

    result = (result + 2 * Math.PI) % (2 * Math.PI)

    if (!realOrWeb) {
      result = 2 * Math.PI - result
    }

    return result
  }
  return App
}

export const NeuralNetwork = () => {
  const App = useRef(createCanvas())
  // Get the canvas node and the drawing context
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  // Set the width and height of the canvas
  const w = canvas?.current?.width || document.body.offsetWidth || 1000
  const h = canvas?.current?.height || document.body.offsetHeight || 1000

  useEffect(() => {
    if (canvas.current) ctx.current = canvas.current?.getContext('2d')
  }, [])

  useEffect(() => {
    App.current.setup()
    App.current.draw()

    const frame = function () {
      App.current.evolve()
      requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    // Container
    <div className="absolute m-0 h-full w-full overflow-hidden border-0">
      {/* Canvas */}
      <canvas
        ref={canvas}
        className="h-full w-full origin-[0%_0%] bg-white bg-gradient-to-r from-cyan-500 to-blue-500"
        width={w}
        height={h}
      />
    </div>
  )
}
