import { AutofixType } from './autofix'
import { ValidationResult } from './validators/common'
import { toEqual } from './validators/toEqual'
import { toThrow } from './validators/toThrow'

// used by validators to access private fields for Expectation cls
export interface InternalExpectation<T> {
  readonly autofix: AutofixType
  readonly actual: T
  isNegated: boolean
}

export class Expectation<T> {
  constructor(private readonly autofix: AutofixType, private readonly actual: T, private isNegated: boolean = false) {}

  get not(): this {
    if (this.isNegated) {
      throw new Error('Tried negating already negated expectation')
    }

    this.isNegated = true

    return this
  }

  toEqual = satisfy(toEqual)
  toThrow = satisfy(toThrow)
}

export function satisfy<T extends (...args: any[]) => ValidationResult>(validator: T): T {
  const res: any = function (this: Expectation<T>, ...args: any[]) {
    const internalThis = (this as any) as InternalExpectation<T>

    const result = validator.apply(this, args)

    if (internalThis.isNegated) {
      if (result.success) {
        throw new Error(result.negatedReason)
      }
    } else {
      if (!result.success) {
        throw new Error(result.reason)
      }
    }
  }

  return res
}
