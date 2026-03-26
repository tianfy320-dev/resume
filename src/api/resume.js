function parseDeepSeekResponse(content) {
  const result = {
    diagnosis: [],
    optimizedResume: '',
    matchSuggestions: [],
    greetingMessage: ''
  }
  
  const diagnosisMatch = content.match(/【问题诊断】[:：]?\s*([\s\S]*?)(?=【优化后的简历内容】|【职位匹配建议】|【打招呼话术】|$)/)
  if (diagnosisMatch) {
    const diagnosisText = diagnosisMatch[1].trim()
    const diagnosisItems = diagnosisText.split(/\n/).filter(line => line.trim()).map(line => {
      const cleanLine = line.replace(/^[\d\.-\s•]+/, '').trim()
      return {
        type: 'warning',
        content: cleanLine
      }
    }).filter(item => item.content)
    result.diagnosis = diagnosisItems.length > 0 ? diagnosisItems : [{ type: 'info', content: '暂无问题诊断' }]
  }
  
  const resumeMatch = content.match(/【优化后的简历内容】[:：]?\s*([\s\S]*?)(?=【职位匹配建议】|【打招呼话术】|$)/)
  if (resumeMatch) {
    result.optimizedResume = resumeMatch[1].trim()
  }
  
  const suggestionMatch = content.match(/【职位匹配建议】[:：]?\s*([\s\S]*?)(?=【打招呼话术】|$)/)
  if (suggestionMatch) {
    const suggestionText = suggestionMatch[1].trim()
    const suggestionItems = suggestionText.split(/\n/).filter(line => line.trim()).map(line => {
      const cleanLine = line.replace(/^[\d\.-\s•]+/, '').trim()
      let type = 'info'
      if (cleanLine.includes('匹配') || cleanLine.includes('优势') || cleanLine.includes('符合')) {
        type = 'success'
      } else if (cleanLine.includes('建议') || cleanLine.includes('缺少') || cleanLine.includes('不足')) {
        type = 'warning'
      }
      return { type, content: cleanLine }
    }).filter(item => item.content)
    result.matchSuggestions = suggestionItems.length > 0 ? suggestionItems : [{ type: 'info', content: '暂无匹配建议' }]
  }
  
  const greetingMatch = content.match(/【打招呼话术】[:：]?\s*([\s\S]*?)$/)
  if (greetingMatch) {
    result.greetingMessage = greetingMatch[1].trim()
  }
  
  return result
}

export async function analyzeResume(identity, resume, jobDescription) {
  // 直接使用提供的 API Key
  const apiKey = 'sk-b7c7e769491a4b6a9f9bafff11f39bbf'
  const apiEndpoint = 'https://api.deepseek.com/chat/completions'
  const model = 'deepseek-chat'
  
  console.log('Using hardcoded API Key for deployment')
  console.log('API Key length:', apiKey.length)
  console.log('API Endpoint:', apiEndpoint)
  console.log('Model:', model)
  
  const identityText = identity === 'fresh' ? '应届生' : '职场人士'
  
  const prompt = `你是一位专业的简历优化顾问。请根据以下信息，为用户提供简历优化建议。

【用户身份】：${identityText}

【简历内容】：
${resume}

【目标岗位JD】：
${jobDescription}

请按照以下格式返回分析结果：

【问题诊断】：
1. 列出简历中存在的问题
2. 指出与岗位JD不匹配的地方
3. 给出具体的改进建议

【优化后的简历内容】：
基于用户提供的简历内容，生成一份优化后的完整简历。保持原有信息的真实性，但优化表述方式，使其更符合岗位要求。

【职位匹配建议】：
1. 分析简历与岗位的匹配度
2. 指出优势和不足
3. 给出针对性的投递建议

【打招呼话术】：
根据岗位JD和用户身份，生成3-5条专业的打招呼话术，用于投递简历时的邮件正文或消息开头。话术应该：
1. 简洁专业，表达对职位的兴趣
2. 突出与岗位相关的核心技能或经验
3. 适合邮件或消息发送的场景
4. 每条话术独立成行

请确保返回格式严格按照上述四个板块，使用【】标记板块标题。`

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的简历优化顾问，擅长分析简历与岗位的匹配度，并给出具体的优化建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices[0].message.content
    
    return parseDeepSeekResponse(content)
  } catch (error) {
    console.error('DeepSeek API Error:', error)
    throw error
  }
}

export async function callLLMAPI(prompt, options = {}) {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_LLM_API_KEY
  const apiEndpoint = import.meta.env.VITE_DEEPSEEK_API_ENDPOINT || import.meta.env.VITE_LLM_API_ENDPOINT || 'https://api.deepseek.com/chat/completions'
  const model = import.meta.env.VITE_DEEPSEEK_MODEL || import.meta.env.VITE_LLM_MODEL || 'deepseek-chat'
  
  if (!apiKey) {
    console.warn('API Key not configured')
    return null
  }
  
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的简历优化顾问，帮助用户优化简历以匹配目标岗位。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        ...options
      })
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('API Error:', error)
    return null
  }
}
