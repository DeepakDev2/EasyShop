'use client'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export default function NavigationProgress() {
  return (
    <ProgressBar
      height="3px"
      color="#FFE500"
      options={{ showSpinner: false, easing: 'ease', speed: 400 }}
      shallowRouting
    />
  )
}
