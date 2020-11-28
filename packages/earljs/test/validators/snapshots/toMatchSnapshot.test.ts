import { expect } from 'chai'
import { spy } from 'sinon'

import { Control } from '../../../src/internals'
import { TestRunnerCtx } from '../../../src/test-runners'
import { toMatchSnapshot } from '../../../src/validators/snapshots'
import { CompareSnapshot } from '../../../src/validators/snapshots/compareSnapshot'

describe('toMatchSnapshot', () => {
  it('creates new snapshots', () => {
    const dummyTestRunnerCtx: TestRunnerCtx = {
      afterTestCase: spy(),
      beforeTestCase: spy(),
      testInfo: {
        suitName: ['Dummy suit'],
        testName: 'works',
        testFilePath: '/tests/dummy.test.ts',
      },
    }
    const dummyCtrl: Control<any> = {
      actual: 'test123',
      isNegated: false,
      assert: spy(),
      testRunnerCtx: dummyTestRunnerCtx,
    }
    const dummyCompareSnapshot: CompareSnapshot = spy(() => {
      return { success: true } as any
    })

    toMatchSnapshot(dummyCtrl, { compareSnapshot: dummyCompareSnapshot, shouldUpdateSnapshots: () => false })

    expect(dummyCompareSnapshot).to.have.been.calledOnceWithExactly({
      actual: 'test123',
      name: 'Dummy suit works',
      shouldUpdateSnapshots: false,
      snapshotFilePath: '/tests/__snapshots__/dummy.test.snap',
    })

    expect(dummyCtrl.assert).to.have.been.calledOnceWithExactly({ success: true, negatedReason: '-', reason: '-' })
  })

  it('matches existing snapshots', () => {
    const dummyTestRunnerCtx: TestRunnerCtx = {
      afterTestCase: spy(),
      beforeTestCase: spy(),
      testInfo: {
        suitName: ['Dummy suit'],
        testName: 'works',
        testFilePath: '/tests/dummy.test.ts',
      },
    }
    const dummyCtrl: Control<any> = {
      actual: 'test123',
      isNegated: false,
      assert: spy(),
      testRunnerCtx: dummyTestRunnerCtx,
    }
    const dummyCompareSnapshot: CompareSnapshot = spy(() => {
      return { success: false, actual: 'test123', expected: 'abc' } as any
    })

    toMatchSnapshot(dummyCtrl, { compareSnapshot: dummyCompareSnapshot, shouldUpdateSnapshots: () => false })

    expect(dummyCompareSnapshot).to.have.been.calledOnceWithExactly({
      actual: 'test123',
      name: 'Dummy suit works',
      shouldUpdateSnapshots: false,
      snapshotFilePath: '/tests/__snapshots__/dummy.test.snap',
    })

    expect(dummyCtrl.assert).to.have.been.calledOnceWithExactly({
      success: false,
      actual: 'test123',
      expected: 'abc',
      reason: "Snapshot doesn't match",
      negatedReason: '-',
    })
  })
})
