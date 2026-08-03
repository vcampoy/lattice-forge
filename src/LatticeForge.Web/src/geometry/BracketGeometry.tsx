import { Edges } from '@react-three/drei'
import { useEffect, useMemo, useState } from 'react'
import { ExtrudeGeometry, MeshPhysicalMaterial, Path, Plane, Shape } from 'three'
import type { BracketGeometryParameters } from './geometryParameters'

type BracketGeometryProps = {
  parameters: BracketGeometryParameters
  clipPlane?: Plane
}

function createBracketGeometry(parameters: BracketGeometryParameters): ExtrudeGeometry {
  const halfLength = parameters.length / 2
  const halfHeight = parameters.height / 2
  const armHeight = Math.max(parameters.wallThickness * 2.5, parameters.height * 0.2)
  const webHalfWidth = Math.max(parameters.wallThickness * 2, parameters.length * 0.14)

  const silhouette = new Shape()
  silhouette.moveTo(-halfLength, -halfHeight)
  silhouette.lineTo(halfLength, -halfHeight)
  silhouette.lineTo(halfLength, -halfHeight + armHeight)
  silhouette.lineTo(webHalfWidth, -halfHeight + armHeight)
  silhouette.lineTo(webHalfWidth, halfHeight - armHeight)
  silhouette.lineTo(halfLength, halfHeight - armHeight)
  silhouette.lineTo(halfLength, halfHeight)
  silhouette.lineTo(-halfLength, halfHeight)
  silhouette.lineTo(-halfLength, halfHeight - armHeight)
  silhouette.lineTo(-webHalfWidth, halfHeight - armHeight)
  silhouette.lineTo(-webHalfWidth, -halfHeight + armHeight)
  silhouette.lineTo(-halfLength, -halfHeight + armHeight)
  silhouette.closePath()

  const holeX = halfLength * 0.57
  const holeY = halfHeight - armHeight / 2
  const hole = new Path()
  hole.absellipse(holeX, holeY, parameters.holeRadius, parameters.holeRadius, 0, Math.PI * 2, false, 0)
  silhouette.holes.push(hole)

  const lowerHole = new Path()
  lowerHole.absellipse(holeX, -holeY, parameters.holeRadius, parameters.holeRadius, 0, Math.PI * 2, false, 0)
  silhouette.holes.push(lowerHole)

  const geometry = new ExtrudeGeometry(silhouette, {
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: Math.min(parameters.wallThickness * 0.55, 2.2),
    bevelThickness: Math.min(parameters.wallThickness * 0.42, 1.8),
    curveSegments: 12,
    depth: parameters.depth,
  })

  geometry.translate(0, 0, -parameters.depth / 2)
  geometry.computeVertexNormals()
  return geometry
}

export function BracketGeometry({ parameters, clipPlane }: BracketGeometryProps) {
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)
  const { depth, height, holeRadius, length, wallThickness } = parameters
  const geometry = useMemo(
    () => createBracketGeometry({ depth, height, holeRadius, length, wallThickness }),
    [depth, height, holeRadius, length, wallThickness],
  )
  const material = useMemo(
    () => new MeshPhysicalMaterial({
      color: '#748a91',
      metalness: 0.94,
      roughness: 0.25,
      clearcoat: 0.45,
      clearcoatRoughness: 0.18,
      emissive: '#062d31',
      emissiveIntensity: 0.16,
      clippingPlanes: clipPlane ? [clipPlane] : [],
    }),
    [clipPlane],
  )

  useEffect(() => {
    material.color.set(selected ? '#a9e1df' : hovered ? '#8fbcc0' : '#748a91')
    material.emissive.set(selected || hovered ? '#0a6870' : '#062d31')
    material.emissiveIntensity = selected ? 0.55 : hovered ? 0.32 : 0.16
  }, [hovered, material, selected])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geometry}
      material={material}
      onClick={(event) => {
        event.stopPropagation()
        setSelected((current) => !current)
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <Edges color={selected || hovered ? '#a5fbf5' : '#57d5dc'} threshold={18} />
    </mesh>
  )
}
