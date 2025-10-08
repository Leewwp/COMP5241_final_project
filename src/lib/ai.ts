import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateActivityFromContent(content: string, activityType: string, topic: string) {
  try {
    const prompt = `Based on the following teaching content, generate a ${activityType} activity about "${topic}".

Teaching Content:
${content}

Please generate:
1. A clear activity title
2. Instructions for students
3. ${activityType === 'quiz' ? '5 multiple choice questions with 4 options each and correct answers' : 
    activityType === 'poll' ? '3 poll questions with multiple options' :
    activityType === 'wordcloud' ? 'A prompt for students to generate words related to the topic' :
    activityType === 'shortanswer' ? '3 open-ended questions for students to answer' :
    'A mini-game concept related to the topic'}

Format the response as JSON with the following structure:
{
  "title": "Activity Title",
  "instructions": "Clear instructions for students",
  "questions": [
    {
      "text": "Question text",
      "type": "multiple-choice",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "points": 1
    }
  ]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator. Generate engaging, educational activities that help students learn effectively."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from AI')
    }

    return JSON.parse(response)
  } catch (error) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate activity content')
  }
}

export async function analyzeStudentResponses(responses: string[], activityType: string) {
  try {
    const prompt = `Analyze the following student responses for a ${activityType} activity:

Responses: ${JSON.stringify(responses)}

Please provide:
1. Common themes or patterns
2. Most frequent answers
3. Key insights about student understanding
4. Suggestions for improvement

Format as JSON:
{
  "themes": ["theme1", "theme2"],
  "frequentAnswers": ["answer1", "answer2"],
  "insights": "Key insights about student understanding",
  "suggestions": "Suggestions for improvement"
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational analyst. Analyze student responses to provide insights for teachers."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from AI')
    }

    return JSON.parse(response)
  } catch (error) {
    console.error('AI analysis error:', error)
    throw new Error('Failed to analyze student responses')
  }
}

export async function generateWordCloudData(responses: string[]) {
  try {
    const prompt = `Analyze the following student responses and extract key words/phrases for a word cloud:

Responses: ${JSON.stringify(responses)}

Extract the most important and frequent words/phrases. Return as JSON:
{
  "words": [
    {"word": "concept1", "count": 5},
    {"word": "concept2", "count": 3}
  ]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at extracting key concepts from text. Focus on educational terms and concepts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from AI')
    }

    return JSON.parse(response)
  } catch (error) {
    console.error('AI word cloud error:', error)
    throw new Error('Failed to generate word cloud data')
  }
}
