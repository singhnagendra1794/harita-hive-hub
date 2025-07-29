import React from 'react'
import { SuperAdminLiveControls } from './SuperAdminLiveControls'

export function YouTubeLiveManager() {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold">YouTube Live Stream Management</h1>
        <p className="text-muted-foreground">
          Automated OBS integration with course scheduling and GEOVA AI mentor controls
        </p>
      </div>
      <SuperAdminLiveControls />
    </div>
  )
}