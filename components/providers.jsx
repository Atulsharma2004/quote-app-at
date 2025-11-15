"use client"
import { SessionProvider } from "next-auth/react"
import { Provider } from "react-redux"
import { store } from "@/lib/store"

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>{children}</Provider>
    </SessionProvider>
  )
}
