function checkUInt53 (n: number): void {
  if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range')
}

let encoderBytes: number = 0

function encode (number: number, buffer?: Uint8Array, offset: number = 0): Uint8Array {
  checkUInt53(number)

  if (buffer == null) buffer = new Uint8Array(encodingLength(number))
  if (!(buffer instanceof Uint8Array)) throw new TypeError('buffer must be a Uint8Array instance')

  const bufferView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

  // 8 bit
  if (number < 0xfd) {
    bufferView.setUint8(offset, number)
    encoderBytes = 1

    // 16 bit
  } else if (number <= 0xffff) {
    bufferView.setUint8(offset, 0xfd)
    bufferView.setUint16(offset + 1, number, true)
    encoderBytes = 3

    // 32 bit
  } else if (number <= 0xffffffff) {
    bufferView.setUint8(offset, 0xfe)
    bufferView.setUint32(offset + 1, number, true)
    encoderBytes = 5

    // 64 bit
  } else {
    bufferView.setUint8(offset, 0xff)
    bufferView.setUint32(offset + 1, number >>> 0, true)
    bufferView.setUint32(offset + 5, (number / 0x100000000) | 0, true)
    encoderBytes = 9
  }

  return buffer
}

let decoderBytes: number = 0

function decode (buffer: Uint8Array, offset: number = 0): number {
  if (!(buffer instanceof Uint8Array)) throw new TypeError('buffer must be a Uint8Array instance')

  const bufferView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

  const first = bufferView.getUint8(offset)

  // 8 bit
  if (first < 0xfd) {
    decoderBytes = 1
    return first

    // 16 bit
  } else if (first === 0xfd) {
    decoderBytes = 3
    return bufferView.getUint16(offset + 1, true)

    // 32 bit
  } else if (first === 0xfe) {
    decoderBytes = 5
    return bufferView.getUint32(offset + 1, true)

    // 64 bit
  } else {
    decoderBytes = 9
    const lo = bufferView.getUint32(offset + 1, true)
    const hi = bufferView.getUint32(offset + 5, true)
    const number = hi * 0x0100000000 + lo
    checkUInt53(number)

    return number
  }
}

function encodingLength (number: number): 1 | 3 | 5 | 9 {
  checkUInt53(number)

  return (
    number < 0xfd
      ? 1
      : number <= 0xffff
        ? 3
        : number <= 0xffffffff
          ? 5
          : 9
  )
}

export { encode, encoderBytes, decode, decoderBytes, encodingLength }
