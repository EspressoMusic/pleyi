/* The city of the PAT game (C:\Users\Nirhdhd\PAT) for /road-safety: its real
   map, cars and fox, drawn by PAT's own code, plus the few things a road-
   safety lesson needs that PAT has no picture of (traffic lights, signs, a
   ball, a bubble over someone), drawn in the same inked style.

   Built into public/js/road-city.js (window.RoadCity) by
   scripts/build-road-city.js — run it again after changing this file or PAT.

   Coordinates are PAT's tiles: x runs down-right on screen, y down-left.
   A car's (x, y) is its middle, a person's is their feet. */

import { OBJECTS_BY_ID } from '../../../../PAT/src/data/objects'
import { BUS_STOP, STREETS } from '../../../../PAT/src/data/city'
import { ZONE } from '../../../../PAT/src/data/world'
import { world } from '../../../../PAT/src/systems/WorldSystem'
import type { ObjectLook, PlacedObject, Point } from '../../../../PAT/src/types'
import { Inker, boxAround, inkForSize } from '../../../../PAT/src/game/ink'
import { HALF_H, HALF_W, tileCenter, tileToWorld } from '../../../../PAT/src/game/iso'
import { type View, drawLand, viewTiles } from '../../../../PAT/src/game/land'
import { drawHoodStreets, drawStreets } from '../../../../PAT/src/game/city'
import { OUTLINE, drawObjectSprite, ellipse, fillStroke, groundShadow, isAnimatedLook, isFlat, poly, shade, softFx, spriteBounds } from '../../../../PAT/src/game/sprites'
import { HEADINGS, type Heading, TRAFFIC_LOOKS, drawTrafficCar, headlights } from '../../../../PAT/src/game/character/car'
import { CHARACTERS, drawCharacter } from '../../../../PAT/src/game/character'
import { drawRider } from '../../../../PAT/src/game/character/bike'
import { ANIM_FRAMES, ANIM_MS, type Anim } from '../../../../PAT/src/game/character/pose'
import { type Light, Lighting, lightsOf } from '../../../../PAT/src/game/lighting'
import { venueSignKey } from '../../../../PAT/src/game/venues'
import { type PersonKind, type PersonPose, drawPerson, riderArt } from './people'

type Ctx = CanvasRenderingContext2D

const WATER = '#86d3e6'
const INK_FPS = 12
const SPECK_MIN_ZOOM = 0.6
const FONT = 'Rubik, Nunito, system-ui, sans-serif'

/** The camera: the tile at the middle of the canvas, and CSS px per world unit (a tile is 64 world units wide). */
export interface Cam {
  x: number
  y: number
  zoom: number
}

export type LightOn = 'red' | 'redyellow' | 'yellow' | 'green' | 'off'

export type BackLights = 'reverse' | 'brake'

export type SignKind = 'stop' | 'speed' | 'crosswalk' | 'giveway' | 'children' | 'walkers' | 'noparking' | 'noentry' | 'bike' | 'bus'
export type ServiceKind = 'police' | 'ambulance' | 'fire'

export type Actor =
  /** `back`: the lights at its back lit — white as it backs up, bright red as it brakes. */
  | { type: 'car'; x: number; y: number; h: Heading; look: number; alpha?: number; back?: BackLights }
  | { type: 'service'; x: number; y: number; h: Heading; kind: ServiceKind; alpha?: number }
  | { type: 'bus'; x: number; y: number; h: Heading; alpha?: number }
  | { type: 'fox'; x: number; y: number; anim?: 'idle' | 'walk'; back?: boolean; flip?: boolean; ms?: number }
  | {
      type: 'person'
      x: number
      y: number
      kind: PersonKind
      v?: number
      walking?: boolean
      back?: boolean
      flip?: boolean
      ms?: number
      alpha?: number
      dark?: boolean
      vest?: boolean
    }
  /** A boy riding PAT's bike along a heading; `lamps`: its white light in front and red one at the back. */
  | { type: 'rider'; x: number; y: number; h: Heading; v?: number; helmet?: boolean; moving?: boolean; lamps?: boolean; ms?: number; alpha?: number }
  | { type: 'carLight'; x: number; y: number; on: LightOn; walk?: 'red' | 'green' | 'off' }
  | { type: 'walkLight'; x: number; y: number; on: 'red' | 'green' | 'off' }
  | { type: 'sign'; x: number; y: number; kind: SignKind; value?: number }
  | { type: 'ball'; x: number; y: number; z?: number }
  | { type: 'bubble'; x: number; y: number; z?: number; text: string; color?: string }

/** The way a person faces on screen, walking along a heading (as PAT's headingOf, the other way round). */
export function facing(h: Heading): { back: boolean; flip: boolean } {
  return { back: h >= 2, flip: h === 1 || h === 2 }
}

// ---------- the city's objects, as PAT's renderer draws them ----------

function depthOf(o: PlacedObject): number {
  const def = OBJECTS_BY_ID[o.defId]
  return o.x + (def?.width ?? 1) - 1 + o.y + (def?.height ?? 1) - 1 + o.x * 0.001
}

function objectInk(defId: string) {
  const def = OBJECTS_BY_ID[defId]
  const b = spriteBounds(def.look, def.width, def.height)
  return inkForSize(b.half * 2, b.rise + b.below)
}

function objectBox(defId: string, x: number, y: number, look = OBJECTS_BY_ID[defId].look) {
  const def = OBJECTS_BY_ID[defId]
  const g = tileCenter(x, y, def.width, def.height)
  const b = spriteBounds(look, def.width, def.height)
  return boxAround(g.x, g.y, b.half + 8, b.rise + 16, b.below + 6)
}

function mirrored(paint: (c: Ctx) => void, cx: number): (c: Ctx) => void {
  return (c) => {
    c.save()
    c.translate(cx * 2, 0)
    c.scale(-1, 1)
    paint(c)
    c.restore()
  }
}

type Residence = Extract<ObjectLook, { type: 'residence' }>

/** The apartment buildings that stand where PAT has its escape rooms: a road-safety city has none. */
const INSTEAD_OF_VENUES: Omit<Residence, 'type' | 'door' | 'v'>[] = [
  { style: 'balconies', wall: '#efe3cc', roof: '#a9a49a', trim: '#e6dcc6', accent: '#6b7b88', floors: 5 },
  { style: 'brick', wall: '#b5583f', roof: '#8e8a82', trim: '#efe6d2', accent: '#2f6b4a', floors: 4 },
  { style: 'glass', wall: '#eef1f4', roof: '#9aa0a8', trim: '#ffffff', accent: '#5f9fd0', floors: 6 },
  { style: 'bauhaus', wall: '#f7f4ec', roof: '#b9b4aa', trim: '#ffffff', accent: '#5bb59a', floors: 4 },
  { style: 'balconies', wall: '#ead2c4', roof: '#a9a49a', trim: '#dcc7b8', accent: '#8a5a4a', floors: 6 },
  { style: 'brick', wall: '#8f5a3c', roof: '#8e8a82', trim: '#efe6d2', accent: '#3a3f6a', floors: 5 },
]

/** A house lot shows as lived in (no "free" sign: that's the game's business, not the street's), an escape room as homes. */
function lookOf(o: PlacedObject): ObjectLook {
  const look = OBJECTS_BY_ID[o.defId].look
  if (look.type === 'venue') {
    const plan = INSTEAD_OF_VENUES[(o.x * 7 + o.y * 3) % INSTEAD_OF_VENUES.length]
    return { type: 'residence', ...plan, door: look.face, v: o.x * 31 + o.y }
  }
  return look.type === 'lotFront' ? { type: 'lotFront', free: false, fence: 0 } : look
}

/** Where an actor goes back to front among the buildings (PAT's actorDepth). */
function actorDepth(ax: number, ay: number, objects: PlacedObject[]): number {
  let d = ax + ay - 1 + 0.01
  for (const o of objects) {
    const def = OBJECTS_BY_ID[o.defId]
    if (def.width === 1 && def.height === 1) continue
    const x1 = o.x + def.width
    const y1 = o.y + def.height
    if (ax < o.x - 3 || ay < o.y - 3 || ax > x1 + 3 || ay > y1 + 3) continue
    const od = depthOf(o)
    if ((ax >= x1 && ay >= o.y) || (ay >= y1 && ax >= o.x)) d = Math.max(d, od + 0.005)
    else if ((ax < o.x && ay < y1) || (ay < o.y && ax < x1)) d = Math.min(d, od - 0.005)
  }
  return d
}

// ---------- what PAT has no picture of: lights, signs, a ball, bubbles ----------

const POLE = '#5a6470'

function pole(ctx: Ctx, h: number) {
  poly(ctx, [
    { x: -1.5, y: 0.5 },
    { x: 1.5, y: 0.5 },
    { x: 1.5, y: -h },
    { x: -1.5, y: -h },
  ])
  fillStroke(ctx, POLE, OUTLINE, 1)
}

function lamp(ctx: Ctx, x: number, y: number, r: number, color: string, lit: boolean) {
  if (lit) {
    ctx.beginPath()
    ctx.arc(x, y, r + 2.6, 0, Math.PI * 2)
    ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ',0.35)')
    ctx.fill()
  }
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  fillStroke(ctx, lit ? color : shade(color, 0.32), OUTLINE, 0.9)
  if (lit) {
    ellipse(ctx, x - r * 0.3, y - r * 0.35, r * 0.35, r * 0.22)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fill()
  }
}

const RED = 'rgb(255,72,72)'
const YELLOW = 'rgb(255,204,40)'
const GREEN = 'rgb(60,220,110)'

/** The cars' light: red on top, yellow, green at the bottom (Israel's order), on a pole. */
function paintCarLight(ctx: Ctx, on: LightOn) {
  groundShadow(ctx, { x: 0, y: 0 }, 6, 2.5)
  pole(ctx, 40)
  ctx.beginPath()
  ctx.roundRect(-7, -74, 14, 36, 4)
  fillStroke(ctx, '#2f3540', OUTLINE, 1.4)
  lamp(ctx, 0, -67.5, 4.2, RED, on === 'red' || on === 'redyellow')
  lamp(ctx, 0, -56, 4.2, YELLOW, on === 'yellow' || on === 'redyellow')
  lamp(ctx, 0, -44.5, 4.2, GREEN, on === 'green')
}

/** A little person standing (the red one) or walking (the green one), in the light's window. */
function walker(ctx: Ctx, cx: number, cy: number, walking: boolean, color: string) {
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.arc(cx + (walking ? 0.6 : 0), cy - 4.6, 1.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 1.7
  ctx.beginPath()
  if (walking) {
    ctx.moveTo(cx + 0.4, cy - 2.6)
    ctx.lineTo(cx - 0.4, cy + 1)
    ctx.lineTo(cx + 1.8, cy + 4.6)
    ctx.moveTo(cx - 0.4, cy + 1)
    ctx.lineTo(cx - 2.4, cy + 4.6)
    ctx.moveTo(cx + 0.2, cy - 2)
    ctx.lineTo(cx + 2.4, cy)
    ctx.moveTo(cx + 0.2, cy - 2)
    ctx.lineTo(cx - 2.2, cy - 0.2)
  } else {
    ctx.moveTo(cx, cy - 2.6)
    ctx.lineTo(cx, cy + 1)
    ctx.moveTo(cx - 1, cy + 1)
    ctx.lineTo(cx - 1, cy + 4.6)
    ctx.moveTo(cx + 1, cy + 1)
    ctx.lineTo(cx + 1, cy + 4.6)
    ctx.moveTo(cx - 2.2, cy - 2.4)
    ctx.lineTo(cx - 2.2, cy + 0.8)
    ctx.moveTo(cx + 2.2, cy - 2.4)
    ctx.lineTo(cx + 2.2, cy + 0.8)
  }
  ctx.stroke()
}

/** The walkers' light: the red man on top, the green man under him. */
function paintWalkLight(ctx: Ctx, on: WalkOn) {
  groundShadow(ctx, { x: 0, y: 0 }, 6, 2.5)
  pole(ctx, 30)
  walkHead(ctx, -58, on)
}

/** The cars' light with the walkers' one under it on the same pole (as at Israel's crossroads). */
function paintCarWalkLight(ctx: Ctx, on: LightOn, walk: WalkOn) {
  groundShadow(ctx, { x: 0, y: 0 }, 6, 2.5)
  pole(ctx, 54)
  walkHead(ctx, -49, walk)
  ctx.translate(0, -15)
  ctx.beginPath()
  ctx.roundRect(-7, -74, 14, 36, 4)
  fillStroke(ctx, '#2f3540', OUTLINE, 1.4)
  lamp(ctx, 0, -67.5, 4.2, RED, on === 'red' || on === 'redyellow')
  lamp(ctx, 0, -56, 4.2, YELLOW, on === 'yellow' || on === 'redyellow')
  lamp(ctx, 0, -44.5, 4.2, GREEN, on === 'green')
  ctx.translate(0, 15)
}

type WalkOn = 'red' | 'green' | 'off'

/** The walkers' light's box, its top at `top`. */
function walkHead(ctx: Ctx, top: number, on: WalkOn) {
  ctx.beginPath()
  ctx.roundRect(-7.5, top, 15, 29, 4)
  fillStroke(ctx, '#2f3540', OUTLINE, 1.4)
  for (const [y, lit, color] of [
    [top + 7.5, on === 'red', RED],
    [top + 21.5, on === 'green', GREEN],
  ] as const) {
    ctx.beginPath()
    ctx.roundRect(-5.5, y - 6, 11, 12, 2.5)
    ctx.fillStyle = lit ? '#1d2129' : '#262b33'
    ctx.fill()
    if (lit) {
      ctx.beginPath()
      ctx.roundRect(-5.5, y - 6, 11, 12, 2.5)
      ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ',0.22)')
      ctx.fill()
    }
    walker(ctx, 0, y, color === GREEN, lit ? color : shade(color, 0.3))
  }
}

function plateText(ctx: Ctx, text: string, x: number, y: number, size: number, color: string) {
  ctx.font = `900 ${size}px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, x, y + size * 0.06)
}

function circlePlate(ctx: Ctx, cy: number, ring: string, inside: string) {
  ctx.beginPath()
  ctx.arc(0, cy, 11, 0, Math.PI * 2)
  fillStroke(ctx, ring, OUTLINE, 1.5)
  ctx.beginPath()
  ctx.arc(0, cy, 7.8, 0, Math.PI * 2)
  ctx.fillStyle = inside
  ctx.fill()
}

/** A red triangle with a white middle: the warning signs point up, give way points down. */
function trianglePlate(ctx: Ctx, cy: number, down: boolean) {
  const tri = (r: number) => {
    ctx.beginPath()
    for (const a of down ? [-150, -30, 90] : [-90, 30, 150]) ctx.lineTo(Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r)
    ctx.closePath()
  }
  ctx.lineJoin = 'round'
  tri(14)
  fillStroke(ctx, '#e8382f', OUTLINE, 1.5)
  tri(8.6)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

/** A road sign on its pole: stop, a speed limit, a crosswalk (Israel's blue square), give way, children or a
 *  crosswalk ahead (warning triangles), no parking, no entry. */
function paintSign(ctx: Ctx, kind: SignKind, value = 30) {
  groundShadow(ctx, { x: 0, y: 0 }, 5, 2.2)
  pole(ctx, 34)
  const cy = -44
  if (kind === 'giveway') {
    trianglePlate(ctx, cy - 1, true)
  } else if (kind === 'children' || kind === 'walkers') {
    trianglePlate(ctx, cy + 1, false)
    if (kind === 'children') {
      // a big one and a small one, hand in hand
      ctx.save()
      ctx.translate(-2.1, cy + 2.8)
      ctx.scale(0.62, 0.62)
      walker(ctx, 0, 0, true, '#1b1407')
      ctx.restore()
      ctx.save()
      ctx.translate(2.4, cy + 3.6)
      ctx.scale(0.48, 0.48)
      walker(ctx, 0, 0, true, '#1b1407')
      ctx.restore()
    } else {
      ctx.fillStyle = '#1b1407'
      for (let i = -1; i <= 1; i++) ctx.fillRect(i * 2.4 - 0.7, cy + 5.6, 1.4, 1.1)
      ctx.save()
      ctx.translate(0.2, cy + 2.4)
      ctx.scale(0.6, 0.6)
      walker(ctx, 0, 0, true, '#1b1407')
      ctx.restore()
    }
  } else if (kind === 'noparking') {
    circlePlate(ctx, cy, '#e8382f', '#2f7fc0')
    ctx.beginPath()
    ctx.moveTo(-5.5, cy - 5.5)
    ctx.lineTo(5.5, cy + 5.5)
    ctx.strokeStyle = '#e8382f'
    ctx.lineWidth = 2.6
    ctx.stroke()
  } else if (kind === 'noentry') {
    ctx.beginPath()
    ctx.arc(0, cy, 11, 0, Math.PI * 2)
    fillStroke(ctx, '#e8382f', OUTLINE, 1.5)
    ctx.beginPath()
    ctx.roundRect(-7, cy - 1.8, 14, 3.6, 1)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  } else if (kind === 'bus') {
    // a bus stop: a blue square with a white bus
    ctx.beginPath()
    ctx.roundRect(-10.5, cy - 10.5, 21, 21, 2.5)
    fillStroke(ctx, '#2f7fc0', OUTLINE, 1.5)
    ctx.beginPath()
    ctx.roundRect(-7, cy - 6, 14, 10, 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.fillStyle = '#2f7fc0'
    for (const x of [-5.4, -1.6, 2.2]) ctx.fillRect(x, cy - 4.4, 3, 3)
    for (const x of [-4, 4]) {
      ctx.beginPath()
      ctx.arc(x, cy + 4.6, 1.8, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }
  } else if (kind === 'bike') {
    // a blue circle with a white bicycle: the bike path
    ctx.beginPath()
    ctx.arc(0, cy, 11, 0, Math.PI * 2)
    fillStroke(ctx, '#2f7fc0', OUTLINE, 1.5)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(-4.4, cy + 2.6, 3, 0, Math.PI * 2)
    ctx.moveTo(7.4, cy + 2.6)
    ctx.arc(4.4, cy + 2.6, 3, 0, Math.PI * 2)
    ctx.moveTo(-4.4, cy + 2.6)
    ctx.lineTo(-1.6, cy - 2.4)
    ctx.lineTo(3, cy - 2.4)
    ctx.lineTo(4.4, cy + 2.6)
    ctx.moveTo(-4.4, cy + 2.6)
    ctx.lineTo(0.4, cy + 2.6)
    ctx.lineTo(3, cy - 2.4)
    ctx.moveTo(-1.6, cy - 2.4)
    ctx.lineTo(-2.2, cy - 4)
    ctx.moveTo(-3.4, cy - 4)
    ctx.lineTo(-1, cy - 4)
    ctx.moveTo(3, cy - 2.4)
    ctx.lineTo(2.4, cy - 4.6)
    ctx.lineTo(4, cy - 5)
    ctx.stroke()
  } else if (kind === 'stop') {
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + (i * Math.PI) / 4
      ctx.lineTo(Math.cos(a) * 11, cy + Math.sin(a) * 11)
    }
    ctx.closePath()
    fillStroke(ctx, '#e8382f', OUTLINE, 1.5)
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + (i * Math.PI) / 4
      ctx.lineTo(Math.cos(a) * 9.2, cy + Math.sin(a) * 9.2)
    }
    ctx.closePath()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()
    plateText(ctx, 'עצור', 0, cy, 6.4, '#ffffff')
  } else if (kind === 'speed') {
    circlePlate(ctx, cy, '#e8382f', '#ffffff')
    plateText(ctx, String(value), 0, cy, value >= 100 ? 6.4 : 8, '#1b1407')
  } else {
    ctx.beginPath()
    ctx.roundRect(-10.5, cy - 10.5, 21, 21, 2.5)
    fillStroke(ctx, '#2f7fc0', OUTLINE, 1.5)
    ctx.beginPath()
    ctx.moveTo(0, cy - 8)
    ctx.lineTo(8.4, cy + 7)
    ctx.lineTo(-8.4, cy + 7)
    ctx.closePath()
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    // the zebra under the walker
    ctx.fillStyle = '#1b1407'
    for (let i = -2; i <= 2; i++) ctx.fillRect(i * 2.8 - 0.8, cy + 5, 1.6, 1.4)
    walker(ctx, 0.2, cy - 0.4, true, '#1b1407')
  }
}

function paintBall(ctx: Ctx, z: number) {
  const r = 6.2
  groundShadow(ctx, { x: 0, y: 0 }, 6.5, 2.6)
  const cy = -r - z
  ctx.beginPath()
  ctx.arc(0, cy, r, 0, Math.PI * 2)
  fillStroke(ctx, '#ff5a4e', OUTLINE, 1)
  ctx.beginPath()
  ctx.arc(0, cy, r, -0.6, 0.9)
  ctx.lineTo(0, cy)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, cy, r, 2.4, 3.4)
  ctx.lineTo(0, cy)
  ctx.closePath()
  ctx.fillStyle = '#ffd23f'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1
  ctx.stroke()
}

/** A bubble over someone (a car's speed, a word): screen-sized, so it reads at any zoom. */
function drawBubble(ctx: Ctx, at: Point, text: string, color: string, zoom: number) {
  const k = 1 / zoom
  const size = 15 * k
  ctx.font = `900 ${size}px ${FONT}`
  const w = ctx.measureText(text).width + 18 * k
  const h = size + 12 * k
  const x = at.x - w / 2
  const y = at.y - h - 9 * k
  ctx.save()
  ctx.direction = 'rtl'
  ctx.beginPath()
  ctx.roundRect(x + 3 * k, y + 3 * k, w, h, 9 * k)
  ctx.fillStyle = OUTLINE
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 9 * k)
  ctx.moveTo(at.x - 6 * k, y + h)
  ctx.lineTo(at.x, at.y - 1 * k)
  ctx.lineTo(at.x + 6 * k, y + h)
  ctx.fillStyle = '#fffaf0'
  ctx.fill()
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 2.4 * k
  ctx.lineJoin = 'round'
  ctx.stroke()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, at.x, y + h / 2 + 1 * k)
  ctx.restore()
}

// ---------- police, ambulance, fire truck: boxes along the way they face, as PAT's cars are drawn ----------

/** A point on the vehicle (along it, across it to its right, both in tiles; up in world units), on the screen. */
type Project = (a: number, c: number, z: number) => Point

interface CarView {
  P: Project
  /** Whether its front (else its back) and its right side (else its left) face the viewer. */
  front: boolean
  right: boolean
}

function carView(h: Heading): CarView {
  const f = HEADINGS[h]
  const r = { x: -f.y, y: f.x }
  const P: Project = (a, c, z) => {
    const dx = f.x * a + r.x * c
    const dy = f.y * a + r.y * c
    return { x: (dx - dy) * HALF_W, y: (dx + dy) * HALF_H - z }
  }
  return { P, front: f.x + f.y > 0, right: r.x + r.y > 0 }
}

function face(ctx: Ctx, pts: Point[], fill: string, lw = 1.2) {
  poly(ctx, pts)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = lw
  ctx.lineJoin = 'round'
  ctx.stroke()
}

/** The end of a box facing the viewer, its side facing the viewer, and its top. */
function boxFaces(v: CarView, a0: number, a1: number, c0: number, c1: number, z0: number, z1: number) {
  const { P } = v
  const ea = v.front ? a1 : a0
  const sc = v.right ? c1 : c0
  return {
    end: [P(ea, c0, z0), P(ea, c1, z0), P(ea, c1, z1), P(ea, c0, z1)],
    side: [P(a0, sc, z0), P(a1, sc, z0), P(a1, sc, z1), P(a0, sc, z1)],
    top: [P(a0, c0, z1), P(a1, c0, z1), P(a1, c1, z1), P(a0, c1, z1)],
  }
}

function solid(ctx: Ctx, v: CarView, a0: number, a1: number, c0: number, c1: number, z0: number, z1: number, color: string, lw = 1.2) {
  const s = boxFaces(v, a0, a1, c0, c1, z0, z1)
  face(ctx, s.side, shade(color, 0.78), lw)
  face(ctx, s.end, shade(color, 0.9), lw)
  face(ctx, s.top, shade(color, 1.12), lw)
}

/** A band painted along the side facing the viewer (and round the end facing it, when `end`). */
function band(ctx: Ctx, v: CarView, a0: number, a1: number, c: number, z0: number, z1: number, color: string, end = true) {
  const { P } = v
  const sc = v.right ? c : -c
  face(ctx, [P(a0, sc, z0), P(a1, sc, z0), P(a1, sc, z1), P(a0, sc, z1)], color, 0.8)
  if (!end) return
  const ea = v.front ? a1 : a0
  face(ctx, [P(ea, -c, z0), P(ea, c, z0), P(ea, c, z1), P(ea, -c, z1)], shade(color, 0.92), 0.8)
}

function glass(ctx: Ctx, pts: Point[]) {
  face(ctx, pts, '#a9dcf2', 1)
  ctx.beginPath()
  ctx.moveTo(pts[0].x + (pts[3].x - pts[0].x) * 0.2 + (pts[1].x - pts[0].x) * 0.15, pts[0].y + (pts[3].y - pts[0].y) * 0.2 + (pts[1].y - pts[0].y) * 0.15)
  ctx.lineTo(pts[0].x + (pts[3].x - pts[0].x) * 0.8 + (pts[1].x - pts[0].x) * 0.3, pts[0].y + (pts[3].y - pts[0].y) * 0.8 + (pts[1].y - pts[0].y) * 0.3)
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'
  ctx.lineWidth = 1.4
  ctx.stroke()
}

/** A closed cabin with windows all round (the ones facing the viewer drawn); `back`: glass at its back end too;
 *  `panes`: one window along its side, or two. */
function cabin(ctx: Ctx, v: CarView, a0: number, a1: number, c: number, z0: number, z1: number, roof: string, back = true, panes = 2) {
  const s = boxFaces(v, a0, a1, -c, c, z0, z1)
  face(ctx, s.side, shade(roof, 0.78))
  face(ctx, s.end, shade(roof, 0.9))
  const { P } = v
  const ea = v.front ? a1 : a0
  const sc = v.right ? c : -c
  if (v.front || back) glass(ctx, [P(ea, -c + 0.06, z0 + 1.5), P(ea, c - 0.06, z0 + 1.5), P(ea, c - 0.06, z1 - 2), P(ea, -c + 0.06, z1 - 2)])
  const mid = (a0 + a1) / 2
  if (panes === 1) {
    glass(ctx, [P(a0 + 0.07, sc, z0 + 1.5), P(a1 - 0.07, sc, z0 + 1.5), P(a1 - 0.07, sc, z1 - 2), P(a0 + 0.07, sc, z1 - 2)])
  } else {
    glass(ctx, [P(a0 + 0.07, sc, z0 + 1.5), P(mid - 0.03, sc, z0 + 1.5), P(mid - 0.03, sc, z1 - 2), P(a0 + 0.07, sc, z1 - 2)])
    glass(ctx, [P(mid + 0.03, sc, z0 + 1.5), P(a1 - 0.07, sc, z0 + 1.5), P(a1 - 0.07, sc, z1 - 2), P(mid + 0.03, sc, z1 - 2)])
  }
  face(ctx, s.top, shade(roof, 1.12))
}

const WHEEL_R = 5.2

function wheel(ctx: Ctx, v: CarView, a: number, c: number, r = WHEEL_R) {
  const ring = (k: number) => {
    const pts: Point[] = []
    for (let i = 0; i < 20; i++) {
      const t = (i / 20) * Math.PI * 2
      pts.push(v.P(a + Math.cos(t) * (0.15 * r / WHEEL_R) * k, c, r + Math.sin(t) * r * k))
    }
    return pts
  }
  face(ctx, ring(1), '#2f2a2a', 1)
  poly(ctx, ring(0.45))
  ctx.fillStyle = '#c9d0d6'
  ctx.fill()
}

/** The wheels on the side turned away (peeping under the body), or on the side facing the viewer. */
function wheelRow(ctx: Ctx, v: CarView, s: ServiceShape, near: boolean) {
  const c = (v.right === near ? 1 : -1) * (s.halfC - 0.02)
  for (const a of s.wheels) wheel(ctx, v, a, c)
}

/** Headlights in front, red lights at the back, a bumper under them, on the end facing the viewer. */
function endLights(ctx: Ctx, v: CarView, s: ServiceShape, z: number) {
  const a = v.front ? s.halfL : -s.halfL
  const c = s.halfC
  face(ctx, [v.P(a, -c, 3), v.P(a, c, 3), v.P(a, c, 6), v.P(a, -c, 6)], '#5b5d66', 1)
  for (const k of [-0.24, 0.24]) {
    face(ctx, [v.P(a, k - 0.07, z), v.P(a, k + 0.07, z), v.P(a, k + 0.07, z + 3.2), v.P(a, k - 0.07, z + 3.2)], v.front ? '#fff6c8' : '#e8483b', 0.8)
  }
}

/** A city car's lights at its back lit (over PAT's drawing of it), and their glow: white as it backs up, red as it
 *  brakes. Its back is seen when it goes up-left or up-right; going the other ways only the glow peeps over it. */
function backLights(ctx: Ctx, h: Heading, at: Point, on: BackLights) {
  const v = carView(h)
  const [lit, glow] = on === 'reverse' ? ['#ffffff', '255,250,220'] : ['#ff2a2a', '255,40,40']
  ctx.save()
  ctx.translate(at.x, at.y)
  for (const k of [-0.24, 0.24]) {
    if (!v.front) face(ctx, [v.P(-0.72, k - 0.07, 9), v.P(-0.72, k + 0.07, 9), v.P(-0.72, k + 0.07, 12.2), v.P(-0.72, k - 0.07, 12.2)], lit, 0.8)
    const p = v.P(-0.78, k, 10.6)
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10)
    g.addColorStop(0, `rgba(${glow},0.75)`)
    g.addColorStop(1, `rgba(${glow},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(p.x, p.y, 10, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

const SIREN_BLUE = '#3f8cff'
const SIREN_RED = '#ff3b3b'

interface ServiceShape {
  halfL: number
  halfC: number
  wheels: number[]
  /** The light bar on the roof: along it from a0 to a1, its top at z, the colors of its two halves (left, right). */
  bar: { a0: number; a1: number; z: number; colors: [string, string] }
}

export const SERVICE_SHAPES: Record<ServiceKind, ServiceShape> = {
  police: { halfL: 0.72, halfC: 0.36, wheels: [-0.46, 0.46], bar: { a0: -0.2, a1: -0.04, z: 25, colors: [SIREN_BLUE, SIREN_RED] } },
  ambulance: { halfL: 0.8, halfC: 0.37, wheels: [-0.52, 0.52], bar: { a0: 0.28, a1: 0.44, z: 26, colors: [SIREN_RED, SIREN_BLUE] } },
  fire: { halfL: 1.02, halfC: 0.38, wheels: [-0.72, -0.4, 0.66], bar: { a0: 0.66, a1: 0.82, z: 27, colors: [SIREN_BLUE, SIREN_RED] } },
}

/** The light bar: two halves across the roof, one lit at a time (`flash` 0 or 1). */
function lightBar(ctx: Ctx, v: CarView, s: ServiceShape, flash: number) {
  const { a0, a1, z, colors } = s.bar
  const halves: [number, number, string, boolean][] = [
    [-0.27, 0, colors[0], flash === 0],
    [0, 0.27, colors[1], flash === 1],
  ]
  // the half farther from the viewer first
  if (!v.right) halves.reverse()
  solid(ctx, v, a0 + 0.02, a1 - 0.02, -0.06, 0.06, z, z + 1.2, '#3a3f48', 0.8)
  for (const [c0, c1, color, lit] of halves) solid(ctx, v, a0, a1, c0, c1, z + 1, z + 4.4, lit ? color : shade(color, 0.45), 0.9)
}

/** Magen David Adom's red star, on the side of the ambulance's box facing the viewer. */
function redStar(ctx: Ctx, v: CarView, a: number, c: number, z: number, r: number) {
  const sc = v.right ? c : -c
  const pt = (deg: number) => v.P(a + Math.cos((deg * Math.PI) / 180) * (r / 36), sc, z + Math.sin((deg * Math.PI) / 180) * r)
  ctx.fillStyle = '#e8382f'
  for (const start of [90, -90]) {
    poly(ctx, [pt(start), pt(start + 120), pt(start + 240)])
    ctx.fill()
  }
}

function paintService(ctx: Ctx, kind: ServiceKind, h: Heading, flash: number) {
  const v = carView(h)
  const s = SERVICE_SHAPES[kind]
  const L = s.halfL
  const C = s.halfC
  softFx(ctx, 'under', (g) => {
    poly(g, [v.P(-L - 0.08, -C - 0.08, 0), v.P(L + 0.08, -C - 0.08, 0), v.P(L + 0.08, C + 0.08, 0), v.P(-L - 0.08, C + 0.08, 0)])
    g.fillStyle = 'rgba(30,40,10,0.2)'
    g.fill()
  })
  wheelRow(ctx, v, s, false)
  // parts back to front: the one farther from the viewer along the vehicle first
  const parts: { a: number; draw: () => void }[] = []
  if (kind === 'police') {
    const white = '#f6f4ee'
    solid(ctx, v, -L, L, -C, C, 4, 14, white)
    band(ctx, v, -L, L, C, 7.5, 11, '#2b5fb8')
    cabin(ctx, v, -0.4, 0.22, C - 0.05, 14, 25, white)
    lightBar(ctx, v, s, flash)
  } else if (kind === 'ambulance') {
    const white = '#fbfaf6'
    solid(ctx, v, -L, L, -C, C, 4, 15, white)
    band(ctx, v, -L, L, C, 8, 11.5, '#e8382f')
    parts.push({
      a: 0.37,
      draw: () => {
        cabin(ctx, v, 0.16, 0.58, C - 0.04, 15, 26, white, false)
        lightBar(ctx, v, s, flash)
      },
    })
    parts.push({
      a: -0.3,
      draw: () => {
        solid(ctx, v, -L, 0.14, -C, C, 15, 33, white)
        band(ctx, v, -L, 0.14, C, 28, 30, '#e8382f')
        redStar(ctx, v, -0.33, C, 22, 5.6)
      },
    })
  } else {
    const red = '#d93a2f'
    solid(ctx, v, -L, L, -C, C, 4, 14, red)
    band(ctx, v, -L, L, C, 9, 11, '#f4f1ea')
    parts.push({
      a: 0.74,
      draw: () => {
        cabin(ctx, v, 0.5, 0.98, C - 0.03, 14, 27, red, false)
        lightBar(ctx, v, s, flash)
      },
    })
    parts.push({
      a: -0.3,
      draw: () => {
        solid(ctx, v, -L, 0.46, -C, C, 14, 25, red)
        // the lockers' doors along its side
        const sc = v.right ? C : -C
        for (const a of [-0.62, -0.18]) {
          ctx.beginPath()
          const p = v.P(a, sc, 15)
          const q = v.P(a, sc, 24)
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.strokeStyle = shade(red, 0.55)
          ctx.lineWidth = 1
          ctx.stroke()
        }
        band(ctx, v, -L, 0.46, C, 18, 19.6, '#ffd23f')
      },
    })
  }
  parts.sort((p, q) => (v.front ? p.a - q.a : q.a - p.a)).forEach((p) => p.draw())
  if (kind === 'fire') {
    // the ladder over it all: two rails on posts, rungs between them
    for (const a of [-0.85, 0.3]) solid(ctx, v, a, a + 0.06, -0.04, 0.04, 25, 28, '#8b939c', 0.8)
    const rails = v.right ? [-0.2, 0.14] : [0.14, -0.2]
    solid(ctx, v, -0.98, 0.62, rails[0], rails[0] + 0.06, 28, 30.5, '#c9d0d6', 0.8)
    for (let a = -0.9; a < 0.6; a += 0.14) face(ctx, [v.P(a, -0.17, 30), v.P(a + 0.04, -0.17, 30), v.P(a + 0.04, 0.17, 30), v.P(a, 0.17, 30)], '#e3e7ea', 0.6)
    solid(ctx, v, -0.98, 0.62, rails[1], rails[1] + 0.06, 28, 30.5, '#c9d0d6', 0.8)
  }
  endLights(ctx, v, s, 9)
  wheelRow(ctx, v, s, true)
}

/** The glow round the lit half of the light bar, over the inked vehicle. */
function sirenGlow(ctx: Ctx, kind: ServiceKind, h: Heading, flash: number) {
  const v = carView(h)
  const { a0, a1, z, colors } = SERVICE_SHAPES[kind].bar
  const p = v.P((a0 + a1) / 2, flash === 0 ? -0.14 : 0.14, z + 3)
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 15)
  const rgb = colors[flash] === SIREN_BLUE ? '63,140,255' : '255,59,59'
  g.addColorStop(0, `rgba(${rgb},0.55)`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(p.x, p.y, 15, 0, Math.PI * 2)
  ctx.fill()
}

// ---------- the bus: a long box with windows all along it, drawn as the services are ----------

const BUS_SHAPE: ServiceShape = { halfL: 1.3, halfC: 0.4, wheels: [-0.85, 0.85], bar: { a0: 0, a1: 0, z: 0, colors: ['', ''] } }
const BUS_BODY = '#f6f4ee'
const BUS_BAND = '#2f9e6e'
const BUS_BOX = { x: -66, y: -74, w: 132, h: 108 }
const BUS_INK = inkForSize(110, 70)

function paintBus(ctx: Ctx, h: Heading) {
  const v = carView(h)
  const { P } = v
  const L = BUS_SHAPE.halfL
  const C = BUS_SHAPE.halfC
  softFx(ctx, 'under', (g) => {
    poly(g, [P(-L - 0.08, -C - 0.08, 0), P(L + 0.08, -C - 0.08, 0), P(L + 0.08, C + 0.08, 0), P(-L - 0.08, C + 0.08, 0)])
    g.fillStyle = 'rgba(30,40,10,0.2)'
    g.fill()
  })
  wheelRow(ctx, v, BUS_SHAPE, false)
  solid(ctx, v, -L, L, -C, C, 4, 34, BUS_BODY)
  band(ctx, v, -L, L, C, 6.5, 12, BUS_BAND)
  band(ctx, v, -L, L, C, 30, 31.6, BUS_BAND)
  // a row of windows along the side facing the viewer, the door near the front on its right (the curb's) side
  const sc = v.right ? C : -C
  for (let a = -L + 0.1; a < L - 0.5; a += 0.42) glass(ctx, [P(a, sc, 15), P(a + 0.34, sc, 15), P(a + 0.34, sc, 28), P(a, sc, 28)])
  if (v.right) face(ctx, [P(L - 0.44, C, 4.5), P(L - 0.12, C, 4.5), P(L - 0.12, C, 29), P(L - 0.44, C, 29)], '#a9dcf2', 1)
  else glass(ctx, [P(L - 0.44, sc, 15), P(L - 0.12, sc, 15), P(L - 0.12, sc, 28), P(L - 0.44, sc, 28)])
  // in front a big windshield under the line's sign, at the back a small window
  const ea = v.front ? L : -L
  if (v.front) {
    glass(ctx, [P(ea, -C + 0.05, 13), P(ea, C - 0.05, 13), P(ea, C - 0.05, 28), P(ea, -C + 0.05, 28)])
    face(ctx, [P(ea, -C + 0.06, 29), P(ea, C - 0.06, 29), P(ea, C - 0.06, 33), P(ea, -C + 0.06, 33)], '#2f2a2a', 0.8)
    face(ctx, [P(ea, -C + 0.14, 30), P(ea, C - 0.14, 30), P(ea, C - 0.14, 32), P(ea, -C + 0.14, 32)], '#ffb02e', 0)
  } else {
    glass(ctx, [P(ea, -C + 0.1, 19), P(ea, C - 0.1, 19), P(ea, C - 0.1, 28), P(ea, -C + 0.1, 28)])
  }
  endLights(ctx, v, BUS_SHAPE, 8)
  wheelRow(ctx, v, BUS_SHAPE, true)
}

/** At night, the light the bus's headlights throw on the road ahead (as PAT's headlights() for a car). */
function busHeadlights(h: Heading, at: Point): Light {
  const p = carView(h).P(BUS_SHAPE.halfL + 0.45, 0, 4)
  return { at: { x: at.x + p.x, y: at.y + p.y }, r: 66, color: [255, 238, 196], strength: 0.75, glow: 2 }
}

// ---------- a boy on PAT's bike: he rides it as PAT's fox does (CHARACTERS + drawRider) ----------

function riderId(v: number, helmet: boolean): string {
  const id = `road-kid-${v}${helmet ? 'h' : ''}`
  CHARACTERS[id] ??= { height: 40, box: { x: -40, y: -60, w: 80, h: 76 }, draw: riderArt(v, helmet), spout: () => ({ x: 0, y: 0 }) }
  return id
}

/** A spot on the bike (`along` it from its middle, `rise` up), riding along heading h — PAT's bike axes. */
function onBike(h: Heading, at: Point, along: number, rise: number): Point {
  const f = facing(h)
  return { x: at.x + 0.894 * (f.flip ? -1 : 1) * along, y: at.y + 0.447 * (f.back ? -1 : 1) * along - rise }
}

/** The bike's white light in front, the red one at the back, orange reflectors on the wheels. */
function bikeLamps(ctx: Ctx, h: Heading, at: Point) {
  const glow = (p: Point, r: number, rgb: string) => {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
    g.addColorStop(0, `rgba(${rgb},0.7)`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const dot = (p: Point, r: number, fill: string) => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    fillStroke(ctx, fill, OUTLINE, 0.8)
  }
  for (const along of [-17, 17]) dot(onBike(h, at, along + 5, 9), 1.2, '#ff9f1a')
  const front = onBike(h, at, 15.5, 20)
  const back = onBike(h, at, -19, 15)
  glow(front, 9, '255,246,200')
  glow(back, 7, '255,60,60')
  dot(front, 1.9, '#fff6c8')
  dot(back, 1.7, '#ff3b3b')
}

const NIGHT_SKY = { tint: [84, 94, 162] as [number, number, number], dark: 1 }

const SERVICE_BOX = { x: -64, y: -64, w: 128, h: 92 }
const SERVICE_INK = inkForSize(70, 46)
const FLASH_HZ = 2.5

const PROP_BOX = { x: -20, y: -84, w: 40, h: 92 }
const TALL_PROP_BOX = { x: -20, y: -98, w: 40, h: 106 }
const PROP_INK = inkForSize(30, 60)

// ---------- the road strips between the parts of the page (road-traffic.js) ----------

/** A strip sees a car from its right side and a little from above, its front to the right: world units a tile along
 *  it, and how far right and up its far side shows per world unit across. */
const SIDE_TILE = 36
const SIDE_SKEW_X = 0.35
const SIDE_SKEW_Y = 0.4
/** PAT's car: half its length and width (tiles), where its wheels are along it. */
const CAR_HALF_L = 0.72
const CAR_HALF_C = 0.36
const CAR_WHEEL_A = 0.46

/** The near side's middle, on the ground, is (0, 0). */
function sideView(): CarView {
  const P: Project = (a, c, z) => {
    const d = (CAR_HALF_C - c) * SIDE_TILE
    return { x: a * SIDE_TILE + d * SIDE_SKEW_X, y: -z - d * SIDE_SKEW_Y }
  }
  return { P, front: true, right: true }
}

/** How far a strip's car reaches behind and ahead of its (0, 0), in world units. */
const SIDE_CAR = { back: CAR_HALF_L * SIDE_TILE, front: CAR_HALF_L * SIDE_TILE + 2 * CAR_HALF_C * SIDE_TILE * SIDE_SKEW_X }

interface SideLook {
  kind: 'sedan' | 'taxi' | 'pickup' | 'jeep' | 'sports' | 'mini' | 'police'
  body: string
  /** Half its length (tiles), where its wheels are along it and their radius, how high its lights are. */
  halfL: number
  wheelA: number
  wheelR: number
  lightZ: number
}

/** The cars a strip shows: the city's sedans and its taxi (a van is too tall for it), then, for now and then, cars
 *  the city hasn't got, drawn the same way: a pickup, a jeep, a sports car, a mini and a police car. */
const SIDE_LOOKS: SideLook[] = [
  ...TRAFFIC_LOOKS.flatMap((l) => (l.kind === 'van' ? [] : [{ kind: l.kind, body: l.body, halfL: CAR_HALF_L, wheelA: CAR_WHEEL_A, wheelR: WHEEL_R, lightZ: 9 }])),
  { kind: 'pickup', body: '#2fb5b0', halfL: 0.78, wheelA: 0.5, wheelR: 5.6, lightZ: 9 },
  { kind: 'jeep', body: '#5c7f3c', halfL: 0.68, wheelA: 0.44, wheelR: 6.4, lightZ: 10 },
  { kind: 'sports', body: '#f08a2c', halfL: 0.76, wheelA: 0.5, wheelR: 5, lightZ: 7 },
  { kind: 'mini', body: '#7a6bd0', halfL: 0.58, wheelA: 0.36, wheelR: 4.8, lightZ: 9 },
  { kind: 'police', body: '#f6f4ee', halfL: CAR_HALF_L, wheelA: CAR_WHEEL_A, wheelR: WHEEL_R, lightZ: 9 },
]
const isCitys = (l: SideLook) => l.kind === 'sedan' || l.kind === 'taxi'
const SIDE_CAR_LOOKS = SIDE_LOOKS.flatMap((l, i) => (isCitys(l) ? [i] : []))
const SIDE_CAR_SPECIALS = SIDE_LOOKS.flatMap((l, i) => (isCitys(l) ? [] : [i]))
const SIDE_BOX = { x: -32, y: -46, w: 74, h: 52 }
const SIDE_INK = inkForSize(70, 46)

/** One of the strip's cars, from its side, as PAT's paintTraffic paints the city's; the red light at its back lit when it brakes. */
function paintSideCar(ctx: Ctx, look: number, braking: boolean) {
  const l = SIDE_LOOKS[look % SIDE_LOOKS.length]
  const v = sideView()
  const { P } = v
  const L = l.halfL
  const C = CAR_HALF_C
  const body = l.body
  softFx(ctx, 'under', (g) => {
    poly(g, [P(-L - 0.08, -C - 0.08, 0), P(L + 0.08, -C - 0.08, 0), P(L + 0.08, C + 0.08, 0), P(-L - 0.08, C + 0.08, 0)])
    g.fillStyle = 'rgba(30,40,10,0.2)'
    g.fill()
  })
  const wheels = (near: boolean) => {
    for (const a of [-l.wheelA, l.wheelA]) wheel(ctx, v, a, (near ? 1 : -1) * (C - 0.02), l.wheelR)
  }
  wheels(false)
  if (l.kind === 'pickup') {
    solid(ctx, v, -L, L, -C, C, 4, 14, body)
    // the open bed behind the cab: low walls round a dark floor
    solid(ctx, v, -L, -0.06, -C, C, 14, 19, body)
    face(ctx, [P(-L + 0.06, -C + 0.06, 19), P(-0.12, -C + 0.06, 19), P(-0.12, C - 0.06, 19), P(-L + 0.06, C - 0.06, 19)], shade(body, 0.45), 0.8)
    cabin(ctx, v, -0.04, 0.36, C - 0.04, 14, 26, body, true, 1)
  } else if (l.kind === 'jeep') {
    // its spare wheel on its back, peeping out behind it
    solid(ctx, v, -L - 0.09, -L, -0.2, 0.2, 9, 21, '#2f2a2a', 1)
    solid(ctx, v, -L, L, -C, C, 5, 14.5, body)
    cabin(ctx, v, -0.6, 0.28, C - 0.03, 14.5, 26, body)
    // the rails of a rack on its roof, the far one first
    for (const c of [-0.27, 0.21]) solid(ctx, v, -0.5, 0.18, c, c + 0.06, 26, 27.4, '#5b5d66', 0.8)
  } else if (l.kind === 'sports') {
    solid(ctx, v, -L, L, -C, C, 3, 11, body)
    // a white stripe down its middle, on its hood and its tail, and along its side
    face(ctx, [P(-L, -0.08, 11), P(L, -0.08, 11), P(L, 0.08, 11), P(-L, 0.08, 11)], '#f6f4ee', 0.8)
    band(ctx, v, -L, L, C, 8, 9.4, '#f6f4ee', false)
    cabin(ctx, v, -0.4, 0.1, C - 0.07, 11, 19.5, body)
    // a low wing on its back, on two posts
    for (const c of [-0.22, 0.16]) solid(ctx, v, -L + 0.04, -L + 0.09, c, c + 0.06, 11, 13, '#2f2a2a', 0.8)
    solid(ctx, v, -L - 0.01, -L + 0.12, -C + 0.03, C - 0.03, 13, 14.2, '#2f2a2a', 0.8)
  } else if (l.kind === 'mini') {
    solid(ctx, v, -L, L, -C, C, 4, 14, body)
    // a cabin out to its back, under a white roof
    cabin(ctx, v, -L + 0.04, 0.2, C - 0.05, 14, 25, body)
    solid(ctx, v, -L + 0.02, 0.22, -C + 0.03, C - 0.03, 25, 26.6, '#f6f4ee', 1)
  } else if (l.kind === 'police') {
    solid(ctx, v, -L, L, -C, C, 4, 14, body)
    band(ctx, v, -L, L, C, 7.5, 11, '#2b5fb8')
    cabin(ctx, v, -0.4, 0.22, C - 0.05, 14, 25, body)
    // its light bar off: it's on its way to no one
    lightBar(ctx, v, SERVICE_SHAPES.police, -1)
  } else {
    solid(ctx, v, -L, L, -C, C, 4, 14, body)
    cabin(ctx, v, -0.4, 0.22, C - 0.05, 14, 25, body)
    if (l.kind === 'taxi') {
      solid(ctx, v, -0.17, -0.01, -0.13, 0.13, 25, 29.5, '#2f2a2a')
      face(ctx, boxFaces(v, -0.17, -0.01, -0.13, 0.13, 25.6, 29).side, '#fff1a8', 0.6)
    }
  }
  const z = l.lightZ
  face(ctx, [P(L, -C, z - 6), P(L, C, z - 6), P(L, C, z - 3), P(L, -C, z - 3)], '#5b5d66', 1)
  for (const c of [-0.24, 0.24]) face(ctx, [P(L, c - 0.07, z), P(L, c + 0.07, z), P(L, c + 0.07, z + 3.2), P(L, c - 0.07, z + 3.2)], '#fff6c8', 0.8)
  face(ctx, [P(-L, C, z), P(-L + 0.07, C, z), P(-L + 0.07, C, z + 3.2), P(-L, C, z + 3.2)], braking ? '#ff2a2a' : '#e8483b', 0.8)
  wheels(true)
}

/** What a strip draws its car and its people with, inked as the map is: each strip has one. */
class Strip {
  inker = new Inker()

  /** Call once per frame with the context's device pixels per world unit. */
  begin(scale: number) {
    this.inker.beginFrame(scale)
  }

  /** A car facing right, the middle of its near side on the ground at the origin. */
  car(ctx: Ctx, look: number, braking: boolean) {
    const key = `${look}:${braking ? 1 : 0}`
    this.inker.draw(ctx, `side:${key}`, key, SIDE_BOX, (g) => paintSideCar(g, look, braking), SIDE_INK)
    if (!braking) return
    const l = SIDE_LOOKS[look % SIDE_LOOKS.length]
    const p = sideView().P(-l.halfL, CAR_HALF_C, l.lightZ + 1.6)
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11)
    g.addColorStop(0, 'rgba(255,40,40,0.6)')
    g.addColorStop(1, 'rgba(255,40,40,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(p.x, p.y, 11, 0, Math.PI * 2)
    ctx.fill()
  }

  /** A person, their feet at the origin, `ms` into their walk. */
  person(ctx: Ctx, p: PersonPose, ms: number) {
    drawPerson(ctx, this.inker, p, ms)
  }
}

// ---------- the scene ----------

export class Scene {
  canvas: HTMLCanvasElement
  ctx: Ctx
  inker = new Inker()
  cam: Cam = { x: 0, y: 0, zoom: 1 }
  w = 0
  h = 0
  dpr = 1
  /** Night: everything under PAT's night sky, lit back up round the lamps, windows, headlights and bike lights. */
  night = false
  private lighting = new Lighting()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
  }

  /** Call when the canvas's CSS size changes. */
  resize() {
    const r = this.canvas.getBoundingClientRect()
    this.w = Math.max(1, r.width)
    this.h = Math.max(1, r.height)
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.canvas.width = Math.round(this.w * this.dpr)
    this.canvas.height = Math.round(this.h * this.dpr)
  }

  /** The point on the canvas (CSS px) of a tile spot, `z` world units up. */
  toScreen(x: number, y: number, z = 0): Point {
    const p = tileToWorld(x, y)
    const c = tileToWorld(this.cam.x, this.cam.y)
    return { x: (p.x - c.x) * this.cam.zoom + this.w / 2, y: (p.y - z - c.y) * this.cam.zoom + this.h / 2 }
  }

  /** Draws the city at time `t` (seconds) with these actors in it. */
  draw(t: number, actors: Actor[] = []) {
    const { ctx, dpr, w, h, inker } = this
    const z = this.cam.zoom
    const c = tileToWorld(this.cam.x, this.cam.y)
    const tInk = Math.floor(t * INK_FPS) / INK_FPS
    inker.beginFrame(dpr * z)
    ctx.direction = 'ltr'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = WATER
    ctx.fillRect(0, 0, w, h)
    ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (w / 2 - c.x * z), dpr * (h / 2 - c.y * z))

    const view: View = { minX: c.x - w / 2 / z - 70, maxX: c.x + w / 2 / z + 70, minY: c.y - h / 2 / z - 30, maxY: c.y + h / 2 / z + 90 }
    const visible = (p: Point) => p.x > view.minX && p.x < view.maxX && p.y > view.minY && p.y < view.maxY
    drawLand(ctx, t, view, z >= SPECK_MIN_ZOOM)
    drawStreets(ctx, view)
    drawHoodStreets(ctx, view)

    const tiles = viewTiles(view)
    const objects = world
      .objectsIn({ x: tiles.x, y: tiles.y, w: tiles.w + 6, h: tiles.h + 6 })
      .filter((o) => OBJECTS_BY_ID[o.defId].look.type !== 'escapeSign')
      .sort((a, b) => depthOf(a) - depthOf(b))

    // flat things first: paths, flower beds, ponds
    const paths = new Set<string>()
    for (const o of objects) {
      const def = OBJECTS_BY_ID[o.defId]
      if (!isFlat(def.look) || !visible(tileCenter(o.x, o.y, def.width, def.height))) continue
      if (def.look.type === 'path') {
        drawObjectSprite(ctx, def.look, o.x, o.y, def.width, def.height, t)
        paths.add(`${o.x},${o.y}`)
      } else {
        const key = `${o.defId},${o.x},${o.y},${isAnimatedLook(def.look) ? tInk : 0}`
        inker.draw(ctx, o.uid, key, objectBox(o.defId, o.x, o.y), (g) => drawObjectSprite(g, def.look, o.x, o.y, def.width, def.height, tInk), objectInk(o.defId))
      }
    }
    if (paths.size) this.inkPaths(paths)

    // then everything standing, back to front, the actors among the buildings
    const standing: { depth: number; draw: () => void }[] = []
    const words = venueSignKey()
    for (const o of objects) {
      const def = OBJECTS_BY_ID[o.defId]
      if (isFlat(def.look) || !visible(tileCenter(o.x, o.y, def.width, def.height))) continue
      const look = lookOf(o)
      const key = `${o.defId},${o.x},${o.y},${o.flip ? 1 : 0},${isAnimatedLook(def.look) ? tInk : 0},${words}`
      const ground = tileCenter(o.x, o.y, def.width, def.height)
      const paint = (g: Ctx) => drawObjectSprite(g, look, o.x, o.y, def.width, def.height, tInk)
      standing.push({ depth: depthOf(o), draw: () => inker.draw(ctx, o.uid, key, objectBox(o.defId, o.x, o.y, look), o.flip ? mirrored(paint, ground.x) : paint, objectInk(o.defId)) })
    }
    const bubbles: Actor[] = []
    actors.forEach((a, i) => {
      if (a.type === 'bubble') return bubbles.push(a)
      const at = tileToWorld(a.x, a.y)
      if (!visible(at)) return
      standing.push({ depth: actorDepth(a.x, a.y, objects) + i * 1e-6, draw: () => this.drawActor(a, at, t) })
    })
    standing.sort((a, b) => a.depth - b.depth).forEach((s) => s.draw())

    if (this.night) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      this.lighting.apply(ctx, NIGHT_SKY, this.lightsAt(objects, actors, t), { x: c.x, y: c.y, zoom: z }, w, h)
      ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (w / 2 - c.x * z), dpr * (h / 2 - c.y * z))
    }

    for (const b of bubbles) {
      if (b.type !== 'bubble') continue
      const p = tileToWorld(b.x, b.y)
      drawBubble(ctx, { x: p.x, y: p.y - (b.z ?? 60) }, b.text, b.color ?? OUTLINE, z)
    }
  }

  /** What shines at night: the city's lamps and windows, headlights, bike lights, and a bright vest (more as a car
   *  comes near it). */
  private lightsAt(objects: PlacedObject[], actors: Actor[], t: number): Light[] {
    const lights: Light[] = []
    for (const o of objects) {
      const type = OBJECTS_BY_ID[o.defId].look.type
      if (type !== 'venue' && type !== 'escapeSign') lights.push(...lightsOf(o, t))
    }
    const cars = actors.filter((a) => a.type === 'car' || a.type === 'bus' || a.type === 'service')
    for (const a of actors) {
      const at = tileToWorld(a.x, a.y)
      if (a.type === 'car' || a.type === 'service') lights.push(headlights(a.h, at))
      else if (a.type === 'bus') lights.push(busHeadlights(a.h, at))
      else if (a.type === 'rider' && a.lamps) {
        const ahead = onBike(a.h, at, 34, 0)
        lights.push({ at: ahead, r: 44, color: [255, 240, 200], strength: 0.7, glow: 1.5 }, { at: onBike(a.h, at, -19, 15), r: 16, color: [255, 70, 70], strength: 0.9, glow: 1.6 })
      } else if (a.type === 'person' && a.vest) {
        const near = Math.min(9, ...cars.map((c) => Math.hypot(c.x - a.x, c.y - a.y)))
        const k = Math.max(0, 1 - near / 6)
        lights.push({ at: { x: at.x, y: at.y - 20 }, r: 30, color: [235, 255, 150], strength: 0.3 + 0.7 * k, glow: 2 + 4 * k })
      }
    }
    return lights
  }

  private drawActor(a: Actor, at: Point, t: number) {
    const { ctx, inker } = this
    ctx.translate(at.x, at.y)
    switch (a.type) {
      case 'car':
        ctx.translate(-at.x, -at.y)
        drawTrafficCar(ctx, inker, a.look, a.h, at, a.alpha ?? 1)
        if (a.back) backLights(ctx, a.h, at, a.back)
        return
      case 'bus': {
        const alpha = a.alpha ?? 1
        if (alpha < 1) ctx.globalAlpha = alpha
        inker.draw(ctx, `bus:${a.h}`, String(a.h), BUS_BOX, (g) => paintBus(g, a.h), BUS_INK)
        ctx.globalAlpha = 1
        break
      }
      case 'rider': {
        ctx.translate(-at.x, -at.y)
        const f = facing(a.h)
        const ms = a.ms ?? t * 1000
        const frame = a.moving ? Math.floor(((ms % ANIM_MS.walk) / ANIM_MS.walk) * ANIM_FRAMES.walk) % ANIM_FRAMES.walk : 0
        ctx.globalAlpha = a.alpha ?? 1
        drawRider(ctx, inker, riderId(a.v ?? 0, !!a.helmet), { anim: a.moving ? 'walk' : 'idle', frame, back: f.back, flip: f.flip }, at)
        if (a.lamps) bikeLamps(ctx, a.h, at)
        ctx.globalAlpha = 1
        return
      }
      case 'service': {
        const flash = Math.floor(t * FLASH_HZ * 2) % 2
        const key = `${a.kind}:${a.h}:${flash}`
        const alpha = a.alpha ?? 1
        if (alpha < 1) ctx.globalAlpha = alpha
        inker.draw(ctx, `service:${key}`, key, SERVICE_BOX, (g) => paintService(g, a.kind, a.h, flash), SERVICE_INK)
        sirenGlow(ctx, a.kind, a.h, flash)
        if (alpha < 1) ctx.globalAlpha = 1
        break
      }
      case 'fox': {
        ctx.translate(-at.x, -at.y)
        const anim: Anim = a.anim ?? 'idle'
        const ms = a.ms ?? t * 1000
        const frame = Math.floor(((ms % ANIM_MS[anim]) / ANIM_MS[anim]) * ANIM_FRAMES[anim]) % ANIM_FRAMES[anim]
        return drawCharacter(ctx, inker, 'fox', { anim, frame, back: !!a.back, flip: !!a.flip }, at)
      }
      case 'person':
        ctx.globalAlpha = a.alpha ?? 1
        drawPerson(ctx, inker, a, a.ms ?? t * 1000)
        ctx.globalAlpha = 1
        break
      case 'carLight': {
        const walk = a.walk
        if (!walk) inker.draw(ctx, `carLight:${a.on}`, a.on, PROP_BOX, (g) => paintCarLight(g, a.on), PROP_INK)
        else inker.draw(ctx, `carWalkLight:${a.on}:${walk}`, `${a.on}:${walk}`, TALL_PROP_BOX, (g) => paintCarWalkLight(g, a.on, walk), PROP_INK)
        break
      }
      case 'walkLight':
        inker.draw(ctx, `walkLight:${a.on}`, a.on, PROP_BOX, (g) => paintWalkLight(g, a.on), PROP_INK)
        break
      case 'sign': {
        const key = `${a.kind}${a.value ?? ''}`
        inker.draw(ctx, `sign:${key}`, key, PROP_BOX, (g) => paintSign(g, a.kind, a.value), PROP_INK)
        break
      }
      case 'ball': {
        const key = String(Math.round((a.z ?? 0) * 2) / 2)
        inker.draw(ctx, `ball:${key}`, key, PROP_BOX, (g) => paintBall(g, a.z ?? 0), inkForSize(12, 12))
        break
      }
    }
    ctx.translate(-at.x, -at.y)
  }

  /** The dark line round the park's paths (PAT's renderer.inkPaths). */
  private inkPaths(paths: Set<string>) {
    const { ctx } = this
    const has = (x: number, y: number) => paths.has(`${x},${y}`)
    ctx.beginPath()
    for (const key of paths) {
      const [x, y] = key.split(',').map(Number)
      const edge = (ax: number, ay: number, bx: number, by: number) => {
        const a = tileToWorld(ax, ay)
        const b = tileToWorld(bx, by)
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
      }
      if (!has(x, y - 1)) edge(x, y, x + 1, y)
      if (!has(x, y + 1)) edge(x, y + 1, x + 1, y + 1)
      if (!has(x - 1, y)) edge(x, y, x, y + 1)
      if (!has(x + 1, y)) edge(x + 1, y, x + 1, y + 1)
    }
    ctx.strokeStyle = OUTLINE
    ctx.lineWidth = 2.6
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

/** Downtown's streets: id, the tiles they cover, the way they run. */
const streets = STREETS.map((s) => ({ id: s.id, rect: { ...s.rect }, along: s.along }))

const isRoad = (x: number, y: number) => world.zoneAt(x, y) === ZONE.road
const zoneAt = (x: number, y: number) => world.zoneAt(x, y)
/** Whether something of the city's (a tree, a lamp, a building) stands on this tile. */
const taken = (x: number, y: number) => !!world.objectAt(Math.floor(x), Math.floor(y))
/** How much longer than a car each of the services is, from its middle to its front (tiles). */
const SERVICE_EXTRA = Object.fromEntries(Object.entries(SERVICE_SHAPES).map(([k, s]) => [k, s.halfL - 0.72]))

;(window as unknown as { RoadCity: unknown }).RoadCity = {
  Scene,
  streets,
  isRoad,
  zoneAt,
  taken,
  ZONE,
  facing,
  CAR_LOOKS: TRAFFIC_LOOKS.length,
  SERVICE_EXTRA,
  bounds: () => world.bounds(),
  Strip,
  SIDE_CAR,
  SIDE_CAR_LOOKS,
  SIDE_CAR_SPECIALS,
  /** The square's bus stop (2×1 tiles, its bench facing the street). */
  busStop: { ...BUS_STOP },
}
