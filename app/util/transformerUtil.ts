import { Note } from "../store/useNoteStore"
import { KonvaEventObject } from "konva/lib/Node"

export function degToRad(angle: number) {
  return (angle / 180) * Math.PI
}

export function getCorner(pivotX: number, pivotY: number, diffX: number, diffY: number, angle: number) {
  const distance = Math.sqrt(diffX * diffX + diffY * diffY)
  angle += Math.atan2(diffY, diffX)
  const x = pivotX + distance * Math.cos(angle)
  const y = pivotY + distance * Math.sin(angle)
  return { x, y }
}

export function getClientRect(note: Note) {
  const x = note.x; const y = note.y;
  const width = note.width; const height = note.height
  const rotation = 0

  const rad = degToRad(rotation)

  const p1 = getCorner(x, y, 0, 0, rad)
  const p2 = getCorner(x, y, width, 0, rad)
  const p3 = getCorner(x, y, width, height, rad)
  const p4 = getCorner(x, y, 0, height, rad)

  const minX = Math.min(p1.x, p2.x, p3.x, p4.x)
  const minY = Math.min(p1.y, p2.y, p3.y, p4.y)
  const maxX = Math.max(p1.x, p2.x, p3.x, p4.x)
  const maxY = Math.max(p1.y, p2.y, p3.y, p4.y)

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
