import { useEffect, useMemo } from 'react'
import { Color, Float32BufferAttribute, MeshBasicMaterial, Plane } from 'three'
import { createBracketGeometry } from './BracketGeometry'
import { calculateOverhangRisk, getRiskColor, type ManufacturingProcess } from './heatmapRisk'
import type { BracketGeometryParameters } from './geometryParameters'

type RiskHeatmapProps = {
  parameters: BracketGeometryParameters
  process: ManufacturingProcess
  opacity: number
  clipPlane?: Plane
}

export function RiskHeatmap({ parameters, process, opacity, clipPlane }: RiskHeatmapProps) {
  const geometry = useMemo(() => createBracketGeometry(parameters), [parameters])
  const material = useMemo(() => new MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, clippingPlanes: clipPlane ? [clipPlane] : [] }), [clipPlane])

  useEffect(() => {
    const normals = geometry.getAttribute('normal')
    const colors = new Float32Array(normals.count * 3)
    const color = new Color()
    for (let index = 0; index < normals.count; index += 1) {
      const risk = calculateOverhangRisk({ x: normals.getX(index), y: normals.getY(index), z: normals.getZ(index) }, process)
      color.set(getRiskColor(risk))
      colors[index * 3] = color.r
      colors[index * 3 + 1] = color.g
      colors[index * 3 + 2] = color.b
    }
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
    return () => { geometry.deleteAttribute('color') }
  }, [geometry, process])

  useEffect(() => { material.opacity = opacity }, [material, opacity])
  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])
  return <mesh geometry={geometry} material={material} renderOrder={2} />
}
