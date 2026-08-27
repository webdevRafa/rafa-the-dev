import CountUpPackage from 'react-countup'
import type { ComponentType } from 'react'
import type { CountUpProps } from 'react-countup'

// react-countup ships as CommonJS. Vite 8 exposes its default export one level
// deeper in development, while production resolves it directly.
const CountUpNumber = (
  (CountUpPackage as unknown as { default?: ComponentType<CountUpProps> }).default
  ?? CountUpPackage
) as ComponentType<CountUpProps>

export default CountUpNumber
