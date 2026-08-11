import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

function crc32(buffer) {
  let crc = ~0
  for (const byte of buffer) {
    crc ^= byte
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([length, typeBuf, data, crc])
}

function png(width, height, rgbaAt) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6

  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1)
    raw[rowStart] = 0
    for (let x = 0; x < width; x += 1) {
      const [r, g, b, a] = rgbaAt(x, y, width)
      const i = rowStart + 1 + x * 4
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
      raw[i + 3] = a
    }
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function iconPixel(x, y, size) {
  const bg = [14, 15, 18, 255]
  const green = [78, 201, 148, 255]
  const cream = [244, 240, 232, 255]
  const cx = (size - 1) / 2
  const cy = size * 0.55
  const radius = size * 0.28
  const dx = x - cx
  const dy = y - cy
  const dist = Math.hypot(dx, dy)
  const stroke = size * 0.028

  const inCircleStroke = Math.abs(dist - radius) <= stroke
  const crownW = size * 0.09
  const crownH = size * 0.045
  const crownY = cy - radius - size * 0.08
  const inCrown =
    x >= cx - crownW && x <= cx + crownW && y >= crownY && y <= crownY + crownH
  const stem =
    Math.abs(x - cx) <= stroke && y >= crownY + crownH && y <= cy - radius

  const handLen = radius * 0.58
  const hx = cx + handLen * 0.8
  const hy = cy - handLen * 0.55
  const handDist = pointToSegment(x, y, cx, cy, hx, hy)
  const inHand = handDist <= stroke * 0.9
  const inHub = dist <= size * 0.025

  if (inCrown || stem || inCircleStroke) return green
  if (inHand || inHub) return cream
  return bg
}

function pointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = dx * dx + dy * dy
  const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

for (const size of [192, 512]) {
  const buffer = png(size, size, (x, y) => iconPixel(x, y, size))
  writeFileSync(join(root, `icon-${size}.png`), buffer)
}
