onmessage = function(event) {
  const { type, data } = event.data
  console.log('worker data:', { type, data }, this)
  let response = null

  switch (type) {
    case 'camera':
        let {
          cameraX,
          cameraY,
          cameraZ
        } = data

        const now = performance.now() / 10000
        const cameraRotationX = Math.cos(now) * 20
        const cameraRotationZ = Math.sin(now) * 20
        const cameraRotationY = 12

        if (cameraY !== 12) {
          cameraX += (cameraRotationX - cameraX) * 0.005
          cameraY += (cameraRotationY - cameraY) * 0.005
          cameraZ += (cameraRotationZ - cameraZ) * 0.005
        } else {
          cameraX = cameraRotationX
          cameraZ = cameraRotationZ
        }

      response = { type: 'camera', camera: { cameraX, cameraY, cameraZ }}
      break

    default:
      break
  }

  postMessage(response)
}