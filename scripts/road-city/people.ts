/* The people of the road-safety city (PAT has only the fox): a kid with a
   school bag, a grandpa with a cane, a dad pushing a stroller, a boy walking
   his dog and a man with a briefcase, drawn in PAT's inked style.

   A person's (0, 0) is their feet. They face right on screen: down-right
   towards the viewer, or up-right away from them (`back`); `flip` mirrors. */

import type { Point } from '../../../../PAT/src/types'
import type { Inker } from '../../../../PAT/src/game/ink'
import { OUTLINE, ellipse, fillStroke, groundShadow, shade } from '../../../../PAT/src/game/sprites'
import { CHARACTER_INK } from '../../../../PAT/src/game/character'

type Ctx = CanvasRenderingContext2D

export type PersonKind = 'kid' | 'grandpa' | 'stroller' | 'dog' | 'man'

export interface PersonPose {
  kind: PersonKind
  /** Varies the skin and the clothes (0, 1, 2). */
  v?: number
  walking?: boolean
  back?: boolean
  flip?: boolean
  /** Dark clothes (hard to see at night), or a bright vest with shiny stripes over the shirt. */
  dark?: boolean
  vest?: boolean
  /** A bike helmet instead of the kid's cap. */
  helmet?: boolean
  /** Sitting on a bike's seat (PAT's bike, see riderArt): feet on the pedals, hands on the handlebars. */
  riding?: boolean
}

const FRAMES = 8
const DARK = { shirt: '#2c3138', pants: '#22252b', bag: '#3a3f48' }
const VEST = '#d4f53c'
const HELMET = '#2f9ee8'
/** One loop of the walk (ms): little legs go fast, a grandpa slowly. */
const WALK_MS: Record<PersonKind, number> = { kid: 460, grandpa: 820, stroller: 600, dog: 520, man: 560 }
const SCALE: Record<PersonKind, number> = { kid: 0.78, grandpa: 0.98, stroller: 1, dog: 0.88, man: 1 }
const BOX = { x: -40, y: -60, w: 80, h: 76 }

const SKIN = ['#f6c9a0', '#e3a878', '#b87a4f']
const HAIR = ['#4a2e1e', '#2b2420', '#8a5a2a']
const SHIRTS: Record<PersonKind, string[]> = {
  kid: ['#ff6b5a', '#4fb5e8', '#7cc35a'],
  grandpa: ['#8a6a4a', '#5a7a9a', '#7a5a6a'],
  stroller: ['#3fb8a8', '#f2a03a', '#6a7fd8'],
  dog: ['#ffcf4a', '#e2604a', '#58b0e0'],
  man: ['#ffffff', '#cfe3f5', '#f4ead6'],
}
const PANTS: Record<PersonKind, string> = { kid: '#3a5a9a', grandpa: '#6a6f78', stroller: '#3f5f8f', dog: '#4a4f5a', man: '#2f3540' }
const BAGS = ['#ffd23f', '#e2408f', '#5bb59a']
const STROLLERS = ['#2f7fc0', '#5bb59a', '#8a5ac0']
const DOGS = ['#c98a4a', '#f2efe8', '#5a4030']

/** An arm or a leg: a thick rounded stroke with an ink edge (as PAT's fox). */
function limb(ctx: Ctx, from: Point, to: Point, color: string, width: number) {
  ctx.lineCap = 'round'
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = width + 2.4
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

function dot(ctx: Ctx, x: number, y: number, r: number, color: string, lw = 1.1) {
  ellipse(ctx, x, y, r, r)
  fillStroke(ctx, color, OUTLINE, lw)
}

/** Where the stroller or the dog goes, `d` ahead of the feet (down-right, or up-right from behind). */
const ahead = (back: boolean, d: number): Point => ({ x: d * 0.89, y: d * 0.45 * (back ? -1 : 1) })

function paintStroller(ctx: Ctx, at: Point, color: string, back: boolean) {
  const wheel = (x: number, y: number, far: boolean) => {
    ellipse(ctx, at.x + x, at.y + y, 2.6, 2.6)
    fillStroke(ctx, far ? '#3a3f48' : '#2a2e36', OUTLINE, 1.1)
    ellipse(ctx, at.x + x, at.y + y, 0.9, 0.9)
    ctx.fillStyle = '#c9ced6'
    ctx.fill()
  }
  groundShadow(ctx, at, 11, 4)
  wheel(-5, back ? -3.5 : -2.5, true)
  wheel(5, back ? -1.5 : -0.5, true)
  // the handle, back to the pusher's hands
  limb(ctx, { x: at.x - 6, y: at.y - 13 }, { x: at.x - 10, y: at.y - 21 }, '#3a3f48', 1.6)
  // the tub and its hood
  ctx.beginPath()
  ctx.moveTo(at.x - 8, at.y - 14)
  ctx.lineTo(at.x + 8, at.y - 14)
  ctx.quadraticCurveTo(at.x + 8.5, at.y - 4, at.x, at.y - 4)
  ctx.quadraticCurveTo(at.x - 8.5, at.y - 4, at.x - 8, at.y - 14)
  ctx.closePath()
  fillStroke(ctx, color, OUTLINE, 1.2)
  ctx.beginPath()
  ctx.moveTo(at.x - 8, at.y - 14)
  ctx.quadraticCurveTo(at.x - 8, at.y - 23, at.x + 1, at.y - 22)
  ctx.lineTo(at.x + 1, at.y - 14)
  ctx.closePath()
  fillStroke(ctx, shade(color, 0.70), OUTLINE, 1.2)
  // a white rim and the baby's blanket
  ctx.beginPath()
  ctx.moveTo(at.x + 1, at.y - 14)
  ctx.lineTo(at.x + 8, at.y - 14)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.4
  ctx.stroke()
  wheel(-4, back ? -2 : -1, false)
  wheel(6, back ? 0 : 1, false)
}

function paintDog(ctx: Ctx, at: Point, color: string, phase: number, walking: boolean, back: boolean) {
  const s = walking ? Math.sin(phase) * 2 : 0
  groundShadow(ctx, at, 8, 3)
  const leg = (x: number, swing: number, far: boolean) => limb(ctx, { x: at.x + x, y: at.y - 5 }, { x: at.x + x + swing, y: at.y - 0.6 }, far ? shade(color, 0.75) : color, 1.8)
  leg(-4, -s, true)
  leg(4, s, true)
  // the tail, wagging
  ctx.beginPath()
  ctx.moveTo(at.x - 6, at.y - 8)
  ctx.quadraticCurveTo(at.x - 10, at.y - 10, at.x - 9 + s * 0.5, at.y - 14)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 3.4
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.8
  ctx.stroke()
  ellipse(ctx, at.x, at.y - 7.5, 7.5, 4)
  fillStroke(ctx, color, OUTLINE, 1.2)
  leg(-3, s, false)
  leg(5, -s, false)
  // the head, a floppy ear, and a red collar
  dot(ctx, at.x + 7, at.y - 12, 3.8, color, 1.2)
  if (!back) {
    ellipse(ctx, at.x + 10.5, at.y - 11, 2.4, 1.7)
    fillStroke(ctx, color, OUTLINE, 1)
    dot(ctx, at.x + 12.6, at.y - 11.3, 0.9, OUTLINE, 0)
    dot(ctx, at.x + 8.4, at.y - 13, 0.6, OUTLINE, 0)
  }
  ellipse(ctx, at.x + 5.6, at.y - 13.4, 1.6, 3, 0.3)
  fillStroke(ctx, shade(color, 0.65), OUTLINE, 1)
  limb(ctx, { x: at.x + 4.6, y: at.y - 9.5 }, { x: at.x + 6.6, y: at.y - 8.8 }, '#e8382f', 1.2)
}

/** The person, feet at 0,0, in walk frame `frame`. */
function paintPerson(ctx: Ctx, p: PersonPose, frame: number) {
  const { kind } = p
  const v = p.v ?? 0
  const back = !!p.back
  const walking = !!p.walking
  const phase = (frame / FRAMES) * Math.PI * 2
  const sw = walking ? Math.sin(phase) : 0
  const bob = walking ? -(1 - Math.abs(sw)) * 0.9 : 0
  const riding = !!p.riding
  const skin = SKIN[v % SKIN.length]
  const shirt = p.dark ? DARK.shirt : SHIRTS[kind][v % 3]
  const pants = p.dark ? DARK.pants : PANTS[kind]
  const bag = p.dark ? DARK.bag : BAGS[v % 3]
  const hair = kind === 'grandpa' ? '#e8e8e8' : HAIR[(v + 1) % HAIR.length]
  const farShade = (c: string) => shade(c, 0.78)

  if (p.flip) ctx.scale(-1, 1)

  // what goes ahead of a dad or a boy: behind them when they walk away
  const strollerAt = ahead(back, 17)
  const dogAt = ahead(back, 22)
  if (kind === 'stroller' && back) paintStroller(ctx, strollerAt, STROLLERS[v % 3], back)
  if (kind === 'dog' && back) paintDog(ctx, dogAt, DOGS[v % 3], phase, walking, back)

  ctx.save()
  const k = SCALE[kind]
  ctx.scale(k, k)
  if (!riding) groundShadow(ctx, { x: 0, y: 0 }, 9, 3.2)

  // riding: the origin is SEAT over the ground (as PAT's drawRider puts it), the seat a little over that, the
  // pedals going round under it and the handlebars ahead (higher up the screen when riding away)
  const lean = kind === 'grandpa' ? 1.6 : 0
  const hip = riding ? { x: -3.6 / k, y: -6.5 / k } : { x: 0, y: -17 + bob }
  const shoulder = riding ? { x: hip.x + 3, y: hip.y - 14 } : { x: lean, y: -31 + bob }
  const head = riding ? { x: shoulder.x + 1.5, y: shoulder.y - 9 } : { x: 1 + lean * 1.4, y: -40 + bob }
  const stride = kind === 'grandpa' ? 2.6 : 4.2
  const pedal = (far: boolean): Point => {
    const a = phase + (far ? Math.PI : 0)
    return { x: (Math.cos(a) * 3.2) / k, y: (4.5 - Math.sin(a) * 3.2) / k }
  }

  const shoe = (x: number, far: boolean, y = -1) => {
    ellipse(ctx, x + 1, y, 2.8, 1.8)
    fillStroke(ctx, far ? '#2a2420' : '#3a2e26', OUTLINE, 1)
  }
  const leg = (far: boolean) => {
    const to = riding ? pedal(far) : { x: (far ? -1 : 1) * (stride * sw + 0.6), y: -2 }
    limb(ctx, { x: hip.x + (far ? -1.2 : 1.2), y: hip.y }, to, far ? farShade(pants) : pants, 4.2)
    shoe(to.x, far, riding ? to.y + 1 : -1)
  }
  const handTo = (to: Point, far: boolean) => {
    const from = { x: shoulder.x + (far ? -1.5 : 1.5), y: shoulder.y + 1.5 }
    limb(ctx, from, to, far ? farShade(shirt) : shirt, 3.4)
    dot(ctx, to.x, to.y, 1.9, far ? farShade(skin) : skin, 1)
  }

  // the far leg and arm
  leg(true)
  // a rider's hands go to the handlebars, a dad's to the handle, a boy's leash hand ahead, everyone else's swing
  const hands = (kind: PersonKind, far: boolean): Point => {
    if (riding) return { x: 12.5 / k + (far ? -1.5 : 0), y: (back ? -19 : -8) / k }
    if (kind === 'stroller') return { x: (strollerAt.x - 10) / k + (far ? -1 : 0), y: (strollerAt.y - 21) / k }
    if (kind === 'dog' && !far) return { x: shoulder.x + 6, y: shoulder.y + 9 }
    const s = (far ? 1 : -1) * sw * (kind === 'grandpa' ? 2 : 4.5)
    return { x: shoulder.x + s + (kind === 'grandpa' && !far ? 4 : 0), y: shoulder.y + 12.5 }
  }
  handTo(hands(kind, true), true)
  if (kind === 'kid' && !back && !riding) {
    ctx.beginPath()
    ctx.roundRect(shoulder.x - 9.5, shoulder.y - 0.5, 6.5, 12, 2.5)
    fillStroke(ctx, bag, OUTLINE, 1.2)
  }

  // the near leg, the body
  leg(false)
  ctx.beginPath()
  ctx.roundRect(shoulder.x - 5.5, shoulder.y - 2, 11, hip.y - shoulder.y + 4, 4)
  fillStroke(ctx, shirt, OUTLINE, 1.3)
  if (p.vest) {
    // a bright vest, two shiny stripes round it
    ctx.beginPath()
    ctx.roundRect(shoulder.x - 5.5, shoulder.y - 1, 11, hip.y - shoulder.y + 2.5, 3.5)
    fillStroke(ctx, VEST, OUTLINE, 1.1)
    ctx.fillStyle = '#f4f7f9'
    for (const at of [0.38, 0.7]) ctx.fillRect(shoulder.x - 5, shoulder.y + (hip.y - shoulder.y) * at, 10, 2)
  }
  if (kind === 'man' && !back) {
    // a tie
    ctx.beginPath()
    ctx.moveTo(shoulder.x + 2.2, shoulder.y - 1)
    ctx.lineTo(shoulder.x + 3.6, shoulder.y + 7)
    ctx.lineTo(shoulder.x + 2.2, shoulder.y + 9)
    ctx.lineTo(shoulder.x + 0.8, shoulder.y + 7)
    ctx.closePath()
    fillStroke(ctx, '#d0453a', OUTLINE, 0.9)
  }
  if (kind === 'kid' && !riding) {
    if (back) {
      ctx.beginPath()
      ctx.roundRect(shoulder.x - 5, shoulder.y - 0.5, 9.5, 12.5, 3)
      fillStroke(ctx, bag, OUTLINE, 1.2)
      ctx.beginPath()
      ctx.roundRect(shoulder.x - 3.5, shoulder.y + 6, 6.5, 4.5, 1.5)
      fillStroke(ctx, shade(bag, 0.80), OUTLINE, 1)
    } else {
      limb(ctx, { x: shoulder.x - 3, y: shoulder.y - 1 }, { x: shoulder.x - 2.4, y: shoulder.y + 9 }, bag, 1.4)
    }
  }

  // the head
  const r = 8.2
  ctx.beginPath()
  ctx.arc(head.x, head.y, r, 0, Math.PI * 2)
  ctx.fillStyle = skin
  ctx.fill()
  ctx.save()
  ctx.beginPath()
  ctx.arc(head.x, head.y, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = hair
  if (back) {
    // the back of the head: all hair but the nape (a grandpa's bald top shows)
    ctx.fillRect(head.x - r, head.y - r, r * 2, r * 1.8)
    if (kind === 'grandpa') {
      ctx.fillStyle = skin
      ellipse(ctx, head.x + 1, head.y - r * 0.75, r * 0.6, r * 0.45)
      ctx.fill()
    }
  } else if (kind === 'grandpa') {
    // white tufts round a bald top, and a beard
    ellipse(ctx, head.x - 6.5, head.y - 0.5, 4.2, 5.5)
    ctx.fill()
    ellipse(ctx, head.x + 2.5, head.y + 7.5, 6.5, 4.6)
    ctx.fill()
  } else {
    ctx.fillRect(head.x - r, head.y - r, r * 2, r * 0.62)
    ellipse(ctx, head.x - 6, head.y - 1, 5, 7)
    ctx.fill()
  }
  ctx.restore()
  ctx.beginPath()
  ctx.arc(head.x, head.y, r, 0, Math.PI * 2)
  ctx.strokeStyle = OUTLINE
  ctx.lineWidth = 1.3
  ctx.stroke()
  if (!back) {
    // ear, eyes, cheek, smile
    ellipse(ctx, head.x - 2.2, head.y + 1, 1.6, 2.2)
    fillStroke(ctx, skin, OUTLINE, 0.9)
    dot(ctx, head.x + 2.3, head.y - 0.6, 1.05, OUTLINE, 0)
    dot(ctx, head.x + 5.6, head.y - 0.8, 1.05, OUTLINE, 0)
    ellipse(ctx, head.x + 5.4, head.y + 2.6, 1.6, 1)
    ctx.fillStyle = 'rgba(255,110,110,0.45)'
    ctx.fill()
    if (kind !== 'grandpa') {
      ctx.beginPath()
      ctx.arc(head.x + 4.2, head.y + 2.6, 1.6, 0.3, Math.PI - 0.3)
      ctx.strokeStyle = OUTLINE
      ctx.lineWidth = 0.9
      ctx.stroke()
    } else {
      // thin round glasses, and their bridge
      ctx.strokeStyle = '#6a5a4a'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.arc(head.x + 2.3, head.y - 0.6, 2.2, 0, Math.PI * 2)
      ctx.moveTo(head.x + 7.8, head.y - 0.8)
      ctx.arc(head.x + 5.6, head.y - 0.8, 2.2, 0, Math.PI * 2)
      ctx.moveTo(head.x + 3.4, head.y - 1.4)
      ctx.lineTo(head.x + 4.5, head.y - 1.4)
      ctx.stroke()
    }
  }
  if (p.helmet) {
    // a bike helmet: a round shell over the top of the head, a white stripe and vents, a short peak in front
    ctx.beginPath()
    ctx.arc(head.x, head.y - 0.5, r * 1.12, Math.PI * 0.98, Math.PI * 2.02)
    ctx.closePath()
    fillStroke(ctx, HELMET, OUTLINE, 1.3)
    ctx.beginPath()
    ctx.arc(head.x, head.y - 0.5, r * 0.78, Math.PI * 1.12, Math.PI * 1.88)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.6
    ctx.stroke()
    ctx.fillStyle = OUTLINE
    for (const dx of [-3, 0.5, 4]) ctx.fillRect(head.x + dx - 0.6, head.y - r * 0.95, 1.2, 2.2)
    if (!back) {
      ellipse(ctx, head.x + 8, head.y - 1.6, 2.8, 1.1)
      fillStroke(ctx, shade(HELMET, 0.8), OUTLINE, 0.9)
    }
  } else if (kind === 'kid' || kind === 'dog') {
    // a cap, its peak forward
    const cap = kind === 'kid' ? (p.dark ? DARK.bag : '#e8382f') : '#2f7fc0'
    ctx.beginPath()
    ctx.arc(head.x, head.y - 1.5, r * 0.98, Math.PI * 1.02, Math.PI * 1.98)
    ctx.closePath()
    fillStroke(ctx, cap, OUTLINE, 1.2)
    if (!back) {
      ellipse(ctx, head.x + 7, head.y - 2.6, 4.5, 1.6)
      fillStroke(ctx, cap, OUTLINE, 1)
    }
  }

  // the near arm, and what it holds
  const near = hands(kind, false)
  if (kind === 'grandpa') {
    limb(ctx, { x: near.x + 0.5, y: near.y }, { x: near.x + 3 + sw * 1.5, y: 0 }, '#7a4a28', 1.6)
  }
  handTo(near, false)
  if (kind === 'man') {
    ctx.beginPath()
    ctx.roundRect(near.x - 4.5, near.y + 1.5, 9, 6.5, 1.5)
    fillStroke(ctx, '#6a4426', OUTLINE, 1.1)
  }
  ctx.restore()

  if (kind === 'stroller' && !back) paintStroller(ctx, strollerAt, STROLLERS[v % 3], back)
  if (kind === 'dog' && !back) paintDog(ctx, dogAt, DOGS[v % 3], phase, walking, back)
  if (kind === 'dog') {
    // the leash, from the boy's hand to the collar
    ctx.beginPath()
    ctx.moveTo(near.x * k, near.y * k)
    ctx.quadraticCurveTo((near.x * k + dogAt.x + 5) / 2, (near.y * k + dogAt.y - 9) / 2 + 4, dogAt.x + 5, dogAt.y - 9)
    ctx.strokeStyle = '#c0392b'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

/** Draws a person at the current origin (their feet), `ms` into their walk; every frame is inked once and cached. */
export function drawPerson(ctx: Ctx, inker: Inker, p: PersonPose, ms: number) {
  const frame = p.walking ? Math.floor(((ms % WALK_MS[p.kind]) / WALK_MS[p.kind]) * FRAMES) % FRAMES : 0
  const key = `${p.kind}:${p.v ?? 0}:${frame}:${p.back ? 1 : 0}:${p.flip ? 1 : 0}:${p.dark ? 'd' : ''}${p.vest ? 'v' : ''}${p.helmet ? 'h' : ''}`
  inker.draw(ctx, `person:${key}`, key, BOX, (g) => paintPerson(g, p, frame), CHARACTER_INK)
}

/** A boy on PAT's bike, as one of PAT's characters (CHARACTERS[id].draw): its pose's walk frames pedal. */
export function riderArt(v: number, helmet: boolean) {
  return (ctx: Ctx, pose: { anim: string; frame: number; back: boolean; flip: boolean }) =>
    paintPerson(ctx, { kind: 'kid', v, helmet, riding: true, walking: pose.anim === 'walk', back: pose.back, flip: pose.flip }, pose.frame)
}
