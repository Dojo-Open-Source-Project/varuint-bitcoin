import { describe, test, assert } from 'vitest'
import * as varuint from '../src/index.js'
import fixtures from './fixtures.json'

fixtures.valid.forEach((fixture, i) => {
  test(`valid encode #${i + 1}`, () => {
    assert.strictEqual(Buffer.from(varuint.encode(fixture.dec)).toString('hex'), fixture.hex)
    assert.strictEqual(varuint.encoderBytes, fixture.hex.length / 2)
  })

  test(`valid decode #${i + 1}`, () => {
    assert.strictEqual(varuint.decode(Buffer.from(fixture.hex, 'hex')), fixture.dec)
    assert.strictEqual(varuint.decoderBytes, fixture.hex.length / 2)
  })

  test(`valid encodingLength #${i + 1}`, () => {
    assert.strictEqual(varuint.encodingLength(fixture.dec), fixture.hex.length / 2)
  })
})

fixtures.invalid.forEach((fixture, i) => {
  test(`invalid encode #${i + 1}`, () => {
    assert.throws(() => {
      varuint.encode(fixture.dec)
    }, fixture.msg)
  })

  test(`invalid encodingLength #${i + 1}`, () => {
    assert.throws(() => {
      varuint.encodingLength(fixture.dec)
    }, fixture.msg)
  })

  if (fixture.hex != null) {
    test(`invalid decode #${i + 1}`, () => {
      assert.throws(() => {
        varuint.decode(Buffer.from(fixture.hex, 'hex'))
      }, fixture.msg)
    })
  }
})

describe('encode', () => {
  test('write to buffer with offset', () => {
    const buffer = new Uint8Array([0x00, 0x00])
    assert.strictEqual(Buffer.from(varuint.encode(0xfc, buffer, 1)).toString('hex'), '00fc')
    assert.strictEqual(varuint.encoderBytes, 1)
  })

  test('should be a Uint8Array', () => {
    assert.throws(() => {
      // @ts-expect-error TS2345
      varuint.encode(0, [])
    }, 'buffer must be a Uint8Array instance')
  })
})

describe('decode', () => {
  test('read from buffer with offset', () => {
    const buffer = Buffer.from([0x00, 0xfc])
    assert.strictEqual(varuint.decode(buffer, 1), 0xfc)
    assert.strictEqual(varuint.decoderBytes, 1)
  })

  test('should be a Uint8Array', () => {
    assert.throws(() => {
      // @ts-expect-error TS2345
      varuint.decode([])
    }, 'buffer must be a Uint8Array instance')
  })
})
