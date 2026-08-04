import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

const appStore = {
  versionLoading: false,
  currentVersion: '0.1.147',
  latestVersion: '0.1.147',
  hasUpdate: false,
  releaseInfo: {
    html_url: 'https://github.com/Hy-U1free/sub2api/releases/tag/v0.1.147'
  },
  buildType: 'release',
  updateRepository: 'Hy-U1free/sub2api',
  fetchVersion: vi.fn(),
  clearVersionCache: vi.fn()
}

vi.mock('@/stores', () => ({
  useAuthStore: () => ({ isAdmin: true }),
  useAppStore: () => appStore
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params?.version ? `${key} ${params.version}` : key
  })
}))

vi.mock('@/api/admin/system', () => ({
  performUpdate: vi.fn(),
  restartService: vi.fn(),
  rollback: vi.fn(),
  getRollbackVersions: vi.fn().mockResolvedValue({
    versions: [{ version: '0.1.146', published_at: '2026-07-07T00:00:00Z' }]
  })
}))

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({
    copied: false,
    copyToClipboard: vi.fn()
  })
}))

import VersionBadge from '../VersionBadge.vue'

describe('VersionBadge update repository', () => {
  it('builds rollback commands from the configured update repository', async () => {
    const wrapper = mount(VersionBadge, {
      global: {
        stubs: {
          Icon: true
        }
      }
    })

    await wrapper.find('button').trigger('click')
    const rollbackButton = wrapper.findAll('button').find((button) =>
      button.text().includes('version.rollback')
    )
    expect(rollbackButton).toBeTruthy()

    await rollbackButton!.trigger('click')
    await flushPromises()

    const versionButton = wrapper.findAll('button').find((button) => button.text().includes('v0.1.146'))
    expect(versionButton).toBeTruthy()

    await versionButton!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'https://raw.githubusercontent.com/Hy-U1free/sub2api/v0.1.146/deploy/install.sh'
    )

    const dockerTab = wrapper.findAll('button').find((button) =>
      button.text().includes('version.deployDocker')
    )
    expect(dockerTab).toBeTruthy()

    await dockerTab!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('image: ghcr.io/hy-u1free/sub2api:0.1.146')
  })
})
