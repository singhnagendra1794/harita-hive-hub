import React from 'react'
import { SuperAdminLiveControls } from './SuperAdminLiveControls'
import { YouTubeAutomationDashboard } from './YouTubeAutomationDashboard'

export function YouTubeLiveManager() {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold">YouTube Live Stream Management</h1>
        <p className="text-muted-foreground">
          Fully automated YouTube Live → OBS → Platform sync with real-time detection
        </p>
      </div>
      
      <YouTubeAutomationDashboard />
      <SuperAdminLiveControls />
    </div>
  )
}