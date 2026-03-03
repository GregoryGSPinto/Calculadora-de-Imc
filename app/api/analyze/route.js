export async function POST(request) {
  try {
    const body = await request.json()
    const { peso, altura, imc, categoria, idade, sexo, atividade } = body

    if (!peso || !altura || !imc) {
      return Response.json(
        { error: 'Dados incompletos. Informe peso, altura e IMC.' },
        { status: 400 }
      )
    }

    const prompt = `Você é um consultor de saúde e bem-estar. Analise os dados abaixo e forneça uma análise personalizada em português do Brasil, com emojis para deixar mais visual.

Dados do usuário:
- Peso: ${peso} kg
- Altura: ${altura} m
- IMC: ${imc}
- Classificação: ${categoria || 'Não informada'}
- Idade: ${idade || 'Não informada'} anos
- Sexo: ${sexo || 'Não informado'}
- Nível de atividade: ${atividade || 'Não informado'}

Responda em exatamente 4 seções com os títulos abaixo (use **negrito** nos títulos):

**📊 Análise do IMC**
Explique o que significa o IMC desta pessoa de forma clara e acessível.

**⚠️ Pontos de Atenção**
Liste 2-3 pontos relevantes com base no perfil.

**💡 Recomendações**
Dê 3-4 recomendações práticas e motivacionais.

**🎯 Meta Sugerida**
Sugira uma meta realista de peso ou hábitos.

IMPORTANTE: Seja motivacional e positivo. NÃO faça diagnósticos médicos. Sempre recomende consultar um profissional de saúde para orientação individualizada.`

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
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      return Response.json(
        { error: 'Erro ao consultar a IA. Verifique sua API key.' },
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
