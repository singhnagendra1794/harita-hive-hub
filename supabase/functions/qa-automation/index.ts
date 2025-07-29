import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// QA Automation function to validate system has NO placeholders
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Starting QA validation...')
    
    const validationResults = {
      liveStreams: await validateLiveStreams(supabase),
      recordings: await validateRecordings(supabase),
      futureEvents: await validateFutureEvents(supabase),
      geovaSystem: await validateGEOVASystem(supabase),
      realTimeDetection: await validateRealTimeDetection(supabase)
    }

    // Check if all validations pass
    const allPassed = Object.values(validationResults).every(result => result.passed)
    
    const response = {
      qaStatus: allPassed ? 'PASSED' : 'FAILED',
      timestamp: new Date().toISOString(),
      results: validationResults,
      summary: generateSummary(validationResults)
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ QA validation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function validateLiveStreams(supabase: any) {
  const issues = []
  
  try {
    // Check for live classes with real data
    const { data: liveClasses } = await supabase
      .from('live_classes')
      .select('*')
      .limit(5)
    
    for (const liveClass of liveClasses || []) {
      if (!liveClass.title || liveClass.title.includes('placeholder') || liveClass.title.includes('sample')) {
        issues.push(`Live class "${liveClass.title}" contains placeholder text`)
      }
      
      if (!liveClass.description || liveClass.description.includes('placeholder')) {
        issues.push(`Live class "${liveClass.title}" has placeholder description`)
      }
      
      if (liveClass.status === 'live' && !liveClass.embed_url && !liveClass.youtube_url) {
        issues.push(`Live class "${liveClass.title}" is marked as live but has no video URL`)
      }
    }
    
    return {
      passed: issues.length === 0,
      issues,
      checkedCount: liveClasses?.length || 0
    }
  } catch (error) {
    return {
      passed: false,
      issues: [`Error validating live streams: ${error.message}`],
      checkedCount: 0
    }
  }
}

async function validateRecordings(supabase: any) {
  const issues = []
  
  try {
    // Check class recordings
    const { data: recordings } = await supabase
      .from('class_recordings')
      .select('*')
      .limit(10)
    
    for (const recording of recordings || []) {
      if (!recording.title || recording.title.includes('placeholder') || recording.title.includes('sample')) {
        issues.push(`Recording "${recording.title}" contains placeholder text`)
      }
      
      if (!recording.youtube_url && !recording.aws_url && !recording.cloudfront_url) {
        issues.push(`Recording "${recording.title}" has no playable URL`)
      }
    }
    
    return {
      passed: issues.length === 0,
      issues,
      checkedCount: recordings?.length || 0
    }
  } catch (error) {
    return {
      passed: false,
      issues: [`Error validating recordings: ${error.message}`],
      checkedCount: 0
    }
  }
}

async function validateFutureEvents(supabase: any) {
  const issues = []
  
  try {
    // Check GEOVA teaching schedule
    const { data: schedule } = await supabase
      .from('geova_teaching_schedule')
      .select('*')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .limit(5)
    
    if (!schedule || schedule.length === 0) {
      issues.push('No future GEOVA sessions scheduled')
    }
    
    for (const session of schedule || []) {
      if (!session.topic_title || session.topic_title.includes('placeholder')) {
        issues.push(`GEOVA session has placeholder title: ${session.topic_title}`)
      }
      
      if (!session.topic_description || session.topic_description.includes('placeholder')) {
        issues.push(`GEOVA session has placeholder description`)
      }
      
      if (!session.scheduled_time) {
        issues.push(`GEOVA session "${session.topic_title}" has no scheduled time`)
      }
    }
    
    return {
      passed: issues.length === 0,
      issues,
      checkedCount: schedule?.length || 0
    }
  } catch (error) {
    return {
      passed: false,
      issues: [`Error validating future events: ${error.message}`],
      checkedCount: 0
    }
  }
}

async function validateGEOVASystem(supabase: any) {
  const issues = []
  
  try {
    // Check if GEOVA avatar settings exist
    const { data: avatarSettings } = await supabase
      .from('geova_avatar_settings')
      .select('*')
      .eq('is_active', true)
      .maybeSingle()
    
    if (!avatarSettings) {
      issues.push('No active GEOVA avatar settings found')
    } else {
      if (!avatarSettings.voice_id) {
        issues.push('GEOVA avatar has no voice ID configured')
      }
      
      if (!avatarSettings.avatar_image_url) {
        issues.push('GEOVA avatar has no image URL')
      }
    }
    
    // Check for active GEOVA sessions
    const { data: sessions } = await supabase
      .from('geova_live_sessions')
      .select('*')
      .eq('status', 'active')
    
    return {
      passed: issues.length === 0,
      issues,
      checkedCount: 1,
      activeGEOVASessions: sessions?.length || 0
    }
  } catch (error) {
    return {
      passed: false,
      issues: [`Error validating GEOVA system: ${error.message}`],
      checkedCount: 0
    }
  }
}

async function validateRealTimeDetection(supabase: any) {
  const issues = []
  
  try {
    // Check live stream detection table
    const { data: detections } = await supabase
      .from('live_stream_detection')
      .select('*')
      .order('last_checked', { ascending: false })
      .limit(1)
    
    if (!detections || detections.length === 0) {
      issues.push('No stream detection records found')
    } else {
      const lastDetection = detections[0]
      const lastChecked = new Date(lastDetection.last_checked)
      const now = new Date()
      const timeDiff = now.getTime() - lastChecked.getTime()
      
      // If last check was more than 2 minutes ago, it's stale
      if (timeDiff > 2 * 60 * 1000) {
        issues.push(`Stream detection last ran ${Math.round(timeDiff / 60000)} minutes ago`)
      }
    }
    
    return {
      passed: issues.length === 0,
      issues,
      checkedCount: detections?.length || 0
    }
  } catch (error) {
    return {
      passed: false,
      issues: [`Error validating real-time detection: ${error.message}`],
      checkedCount: 0
    }
  }
}

function generateSummary(results: any) {
  const totalIssues = Object.values(results).reduce((sum: number, result: any) => sum + result.issues.length, 0)
  const passedChecks = Object.values(results).filter((result: any) => result.passed).length
  const totalChecks = Object.keys(results).length
  
  return {
    totalIssues,
    passedChecks,
    totalChecks,
    overallStatus: totalIssues === 0 ? 'NO_PLACEHOLDERS_FOUND' : 'PLACEHOLDERS_DETECTED',
    recommendations: generateRecommendations(results)
  }
}

function generateRecommendations(results: any) {
  const recommendations = []
  
  if (!results.liveStreams.passed) {
    recommendations.push('Update live stream titles and descriptions with real content')
  }
  
  if (!results.recordings.passed) {
    recommendations.push('Ensure all recordings have valid playback URLs')
  }
  
  if (!results.futureEvents.passed) {
    recommendations.push('Schedule real GEOVA teaching sessions with proper titles and descriptions')
  }
  
  if (!results.geovaSystem.passed) {
    recommendations.push('Configure GEOVA avatar settings properly')
  }
  
  if (!results.realTimeDetection.passed) {
    recommendations.push('Ensure real-time stream detection is running continuously')
  }
  
  return recommendations
}