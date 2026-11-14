import * as mockApi from './mockApi'
import * as realApi from './realApi'

// Reads VITE_USE_MOCK from the .env file. Anything except "false" means mock.
export const isMock = import.meta.env.VITE_USE_MOCK !== 'false'

export const api = isMock ? mockApi : realApi