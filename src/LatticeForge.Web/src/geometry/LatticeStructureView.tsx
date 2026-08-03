import { useEffect, useMemo, useRef } from 'react'
import { CylinderGeometry, MeshStandardMaterial, Plane, Quaternion, Vector3, type InstancedMesh } from 'three'
import type { BracketGeometryParameters } from './geometryParameters'
import { calculateLatticeInstances, getLatticeStrutScale } from './latticeStructure'

type LatticeStructureProps = {
  parameters: BracketGeometryParameters & { latticeDensity: number }
  clipPlane?: Plane
}

export function LatticeStructure({ parameters, clipPlane }: LatticeStructureProps) {
  const instances = useMemo(() => calculateLatticeInstances(parameters), [parameters])
  const geometry = useMemo(() => new CylinderGeometry(0.55, 0.55, 1, 8), [])
  const material = useMemo(() => new MeshStandardMaterial({
    color: '#62e8eb',
    emissive: '#0a7981',
    emissiveIntensity: 0.52,
    metalness: 0.72,
    roughness: 0.23,
    clippingPlanes: clipPlane ? [clipPlane] : [],
  }), [clipPlane])
  const meshRef = useRef<InstancedMesh>(null)

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const midpoint = new Vector3()
    const direction = new Vector3()
    const quaternion = new Quaternion()
    const matrix = mesh.matrix
    const up = new Vector3(0, 1, 0)
    const radius = Math.min(0.95, Math.max(0.34, Math.min(parameters.length / 14, parameters.height / 12) / Math.max(1, Math.sqrt(instances.length / 14))))
    const scale = new Vector3(radius, 1, radius)

    instances.forEach((instance, index) => {
      const start = instance.start
      const end = instance.end
      direction.set(end.x - start.x, end.y - start.y, end.z - start.z)
      const length = direction.length()
      midpoint.set((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2)
      quaternion.setFromUnitVectors(up, direction.normalize())
      const [scaleX, scaleY, scaleZ] = getLatticeStrutScale(length, radius)
      scale.set(scaleX, scaleY, scaleZ)
      matrix.compose(midpoint, quaternion, scale)
      mesh.setMatrixAt(index, matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [geometry, instances, parameters.height, parameters.length])

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
  }, [geometry, material])

  return <instancedMesh key={instances.length} ref={meshRef} args={[geometry, material, instances.length]} castShadow receiveShadow />
}
