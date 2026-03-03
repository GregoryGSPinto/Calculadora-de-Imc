export async function POST(request) {
  try {
    const body = await request.json()
    const { peso, altura, imc, categoria, idade, sexo, atividade, messages, lang } = body

    if (!peso || !altura || !imc) {
      return Response.json(
        { error: 'Dados incompletos. Informe peso, altura e IMC.' },
        { status: 400 }
      )
    }

    const isEN = lang === 'en'

    const systemPrompt = isEN
      ? `You are a health and wellness consultant. The user has the following profile:
- Weight: ${peso} kg
- Height: ${altura} m
- BMI: ${imc}
- Classification: ${categoria || 'Not informed'}
- Age: ${idade || 'Not informed'} years
- Sex: ${sexo || 'Not informed'}
- Activity level: ${atividade || 'Not informed'}

Be motivational and positive. DO NOT make medical diagnoses. Always recommend consulting a healthcare professional for individualized guidance. Use emojis for visual appeal. Respond in English.`
      : `Você é um consultor de saúde e bem-estar. O usuário tem o seguinte perfil:
- Peso: ${peso} kg
- Altura: ${altura} m
- IMC: ${imc}
- Classificação: ${categoria || 'Não informada'}
- Idade: ${idade || 'Não informada'} anos
- Sexo: ${sexo || 'Não informado'}
- Nível de atividade: ${atividade || 'Não informado'}

Seja motivacional e positivo. NÃO faça diagnósticos médicos. Sempre recomende consultar um profissional de saúde para orientação individualizada. Use emojis para deixar mais visual. Responda em português do Brasil.`

    let apiMessages

    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Multi-turn conversation
      apiMessages = messages.map(m => ({ role: m.role, content: m.content }))
    } else {
      // Initial single analysis
      const initialPrompt = isEN
        ? `Analyze my BMI data and provide a personalized analysis in exactly 4 sections with bold titles (**title**):

**📊 BMI Analysis**
Explain what my BMI means clearly.

**⚠️ Points of Attention**
List 2-3 relevant points based on my profile.

**💡 Recommendations**
Give 3-4 practical and motivational recommendations.

**🎯 Suggested Goal**
Suggest a realistic weight or habit goal.`
        : `Analise meus dados de IMC e forneça uma análise personalizada em exatamente 4 seções com títulos em negrito (**título**):

**📊 Análise do IMC**
Explique o que significa meu IMC de forma clara e acessível.

**⚠️ Pontos de Atenção**
Liste 2-3 pontos relevantes com base no meu perfil.

**💡 Recomendações**
Dê 3-4 recomendações práticas e motivacionais.

**🎯 Meta Sugerida**
Sugira uma meta realista de peso ou hábitos.`

      apiMessages = [{ role: 'user', content: initialPrompt }]
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      return Response.json(
        { error: isEN ? 'Error consulting AI. Check your API key.' : 'Erro ao consultar a IA. Verifique sua API key.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const analysis = data.content[0].text

    return Response.json({ analysis })
  } catch (error) {
    console.error('API route error:', error)
    return Response.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    )
  }
}
