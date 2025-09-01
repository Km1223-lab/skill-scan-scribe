import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { documentContent, documentName, userId } = await req.json()

    // Validate required fields
    if (!documentContent || !documentName) {
      return new Response(
        JSON.stringify({ error: 'Missing document content or name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Simple AI detection algorithm (in real world, you'd use OpenAI or similar)
    const detectionResult = analyzeDocument(documentContent)

    // Store detection result in database
    const { data, error: dbError } = await supabase
      .from('ai_detection_results')
      .insert({
        user_id: userId || null,
        document_name: documentName,
        document_content: documentContent,
        detection_service: 'kg-designs-detector',
        ai_probability: detectionResult.aiProbability,
        human_probability: detectionResult.humanProbability,
        confidence_score: detectionResult.confidenceScore,
        detected_patterns: detectionResult.patterns,
        analysis_summary: detectionResult.summary
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store detection result' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        detectionId: data.id,
        result: {
          aiProbability: detectionResult.aiProbability,
          humanProbability: detectionResult.humanProbability,
          confidenceScore: detectionResult.confidenceScore,
          classification: detectionResult.aiProbability > 0.7 ? 'AI-Generated' : 
                        detectionResult.aiProbability > 0.3 ? 'Mixed/Uncertain' : 'Human-Written',
          patterns: detectionResult.patterns,
          summary: detectionResult.summary,
          recommendations: detectionResult.recommendations
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function analyzeDocument(content: string) {
  // Simple rule-based AI detection (in production, use proper ML models)
  const text = content.toLowerCase()
  
  // AI writing patterns
  const aiPatterns = [
    /\b(furthermore|moreover|additionally|consequently|therefore|nonetheless)\b/g,
    /\b(it is important to note|it should be noted|it is worth mentioning)\b/g,
    /\b(in conclusion|to summarize|in summary|overall)\b/g,
    /\b(various|numerous|several|multiple)\b/g,
    /\b(utilize|implement|facilitate|optimize)\b/g
  ]

  // Human writing patterns
  const humanPatterns = [
    /\b(i think|i believe|in my opinion|personally)\b/g,
    /\b(actually|really|pretty|quite|very)\b/g,
    /\b(stuff|things|guy|folks)\b/g,
    /[.!?]{2,}/g, // Multiple punctuation
    /\b\w+\b(?:\s+\b\w+\b){0,2}\s+\1\b/g // Repetitive phrases
  ]

  let aiScore = 0
  let humanScore = 0
  const detectedPatterns = []

  // Count AI patterns
  aiPatterns.forEach((pattern, index) => {
    const matches = text.match(pattern) || []
    if (matches.length > 0) {
      aiScore += matches.length * 2
      detectedPatterns.push({
        type: 'ai_pattern',
        pattern: pattern.source,
        count: matches.length,
        description: getPatternDescription('ai', index)
      })
    }
  })

  // Count human patterns
  humanPatterns.forEach((pattern, index) => {
    const matches = text.match(pattern) || []
    if (matches.length > 0) {
      humanScore += matches.length * 2
      detectedPatterns.push({
        type: 'human_pattern',
        pattern: pattern.source,
        count: matches.length,
        description: getPatternDescription('human', index)
      })
    }
  })

  // Text statistics
  const words = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).length
  const avgWordsPerSentence = words / sentences
  const avgWordLength = text.replace(/\s+/g, '').length / words

  // AI tends to have more consistent sentence length and formal vocabulary
  if (avgWordsPerSentence > 20) aiScore += 3
  if (avgWordLength > 5) aiScore += 2
  
  // Humans tend to have more variation
  if (avgWordsPerSentence < 15) humanScore += 2
  if (avgWordLength < 4.5) humanScore += 1

  const totalScore = aiScore + humanScore || 1
  const aiProbability = Math.min(aiScore / totalScore, 0.95)
  const humanProbability = 1 - aiProbability
  const confidenceScore = Math.abs(aiProbability - 0.5) * 2

  // Generate summary and recommendations
  const summary = `Document analyzed with ${detectedPatterns.length} patterns detected. ` +
    `Text contains ${words} words across ${sentences} sentences with average sentence length of ${avgWordsPerSentence.toFixed(1)} words.`

  const recommendations = []
  if (aiProbability > 0.7) {
    recommendations.push('Document shows strong AI writing patterns. Consider adding more personal voice and varied sentence structures.')
    recommendations.push('Use more conversational language and avoid overly formal transitions.')
  } else if (aiProbability > 0.3) {
    recommendations.push('Document shows mixed characteristics. Review for consistency in writing style.')
  } else {
    recommendations.push('Document appears to be primarily human-written with natural language patterns.')
  }

  return {
    aiProbability,
    humanProbability,
    confidenceScore,
    patterns: detectedPatterns,
    summary,
    recommendations
  }
}

function getPatternDescription(type: string, index: number): string {
  const aiDescriptions = [
    'Formal transitional phrases',
    'Academic hedging language',
    'Summary and conclusion markers',
    'Quantifying adjectives',
    'Formal vocabulary choices'
  ]

  const humanDescriptions = [
    'Personal opinion expressions',
    'Informal intensifiers',
    'Casual vocabulary',
    'Emotional punctuation',
    'Repetitive phrasing'
  ]

  return type === 'ai' ? aiDescriptions[index] : humanDescriptions[index]
}