import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { BoxGeometry, CylinderGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, Quaternion, Vector3, type BufferGeometry } from 'three'
import { createBracketGeometry } from './BracketGeometry'
import { calculateLatticeInstances } from './latticeStructure'
import type { DesignParameters } from '../useDesignStore'

const EXPORT_MATERIAL_COLOR = '#ffffff'

function createLatticeGeometry(parameters: DesignParameters): BufferGeometry {
  const instances = calculateLatticeInstances(parameters)
  const source = new CylinderGeometry(0.55, 0.55, 1, 8)
  const geometries: BufferGeometry[] = []
  const midpoint = new Vector3()
  const direction = new Vector3()
  const quaternion = new Quaternion()
  const scale = new Vector3()
  const matrix = new Matrix4()
  const up = new Vector3(0, 1, 0)
  const radius = Math.min(0.95, Math.max(0.34, Math.min(parameters.length / 14, parameters.height / 12) / Math.max(1, Math.sqrt(instances.length / 14))))

  try {
    for (const instance of instances) {
      direction.set(instance.end.x - instance.start.x, instance.end.y - instance.start.y, instance.end.z - instance.start.z)
      const length = direction.length()
      midpoint.set(
        (instance.start.x + instance.end.x) / 2,
        (instance.start.y + instance.end.y) / 2,
        (instance.start.z + instance.end.z) / 2,
      )
      quaternion.setFromUnitVectors(up, direction.normalize())
      scale.set(radius, length, radius)
      matrix.compose(midpoint, quaternion, scale)
      const geometry = source.clone()
      geometry.applyMatrix4(matrix)
      geometries.push(geometry)
    }

    return mergeGeometries(geometries, false) ?? new BoxGeometry(0.001, 0.001, 0.001)
  } finally {
    source.dispose()
    geometries.forEach((geometry) => geometry.dispose())
  }
}

export function createOptimizedExportScene(parameters: DesignParameters): Group {
  const scene = new Group()
  scene.add(new Mesh(createBracketGeometry(parameters), new MeshBasicMaterial({ color: EXPORT_MATERIAL_COLOR })))
  scene.add(new Mesh(createLatticeGeometry(parameters), new MeshBasicMaterial({ color: EXPORT_MATERIAL_COLOR })))
  scene.updateMatrixWorld(true)
  return scene
}

export function disposeOptimizedExportScene(scene: Group): void {
  scene.traverse((object) => {
    const mesh = object as Mesh
    mesh.geometry?.dispose()
    if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose())
    else mesh.material?.dispose()
  })
}
