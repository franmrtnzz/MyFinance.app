export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const OPENAI_CONFIG = {
  apiKey: OPENAI_API_KEY,
  model: "gpt-3.5-turbo",
  maxTokens: 300, // Aumentar tokens para respuestas más completas
  temperature: 0.1, // Reducir temperatura para respuestas más consistentes
};

// Función para validar la API key
const isValidApiKey = (apiKey: string): boolean => {
  return !!(apiKey && apiKey.startsWith('sk-') && apiKey.length > 20);
};

// Función para manejar errores de API
const handleApiError = (error: any, context: string): string => {
  console.error(`${context} Error:`, error);
  
  if (error.message?.includes('401')) {
    return 'API key de OpenAI inválida. Verifica tu configuración.';
  } else if (error.message?.includes('429')) {
    return 'Límite de API alcanzado. Intenta de nuevo en unos minutos.';
  } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Error de conexión. Verifica tu conexión a internet.';
  } else {
    return 'Error al procesar el texto. Intenta ser más específico.';
  }
};

// Función para procesar texto natural a transacciones
export const parseNaturalLanguageTransaction = async (text: string): Promise<{
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
  error?: string;
} | null> => {
  try {
    // Validar API key
    if (!isValidApiKey(OPENAI_API_KEY)) {
      throw new Error('API key de OpenAI no válida');
    }

    console.log('🤖 Enviando solicitud a OpenAI para transacción:', text);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `Eres un asistente financiero especializado en español. Convierte CUALQUIER texto sobre dinero a una transacción estructurada.

INSTRUCCIONES CRÍTICAS:
1. SIEMPRE responde con un JSON válido
2. NO agregues explicaciones, solo el JSON
3. Si el texto menciona dinero, crea una transacción

FORMATO OBLIGATORIO:
{"type": "income/expense", "amount": NUMERO, "category": "CATEGORIA", "description": "DESCRIPCION", "isRecurring": boolean}

EJEMPLOS:
- "he gastado 25 euros en comida" → {"type": "expense", "amount": 25, "category": "Comida", "description": "Gasto en comida", "isRecurring": false}
- "me han pagado 100 euros" → {"type": "income", "amount": 100, "category": "Salario", "description": "Pago recibido", "isRecurring": false}
- "6 euros de patatas" → {"type": "expense", "amount": 6, "category": "Comida", "description": "Patatas", "isRecurring": false}

CATEGORÍAS: Comida, Transporte, Entretenimiento, Servicios, Salario, Freelance, Otros`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    console.log('✅ Respuesta de OpenAI:', content);
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Extraer JSON de la respuesta con mejor regex
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No se encontró JSON en la respuesta:', content);
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validar estructura con valores por defecto
    if (!parsed.type || !parsed.amount) {
      console.error('❌ Estructura inválida:', parsed);
      throw new Error('Invalid transaction structure - missing type or amount');
    }

    const result = {
      type: parsed.type,
      amount: parseFloat(parsed.amount),
      category: parsed.category || 'Otros',
      description: parsed.description || text,
      isRecurring: parsed.isRecurring || false,
      recurringInterval: parsed.recurringInterval,
    };

    console.log('🎉 Transacción procesada correctamente:', result);
    return result;

  } catch (error) {
    const errorMessage = handleApiError(error, 'Transaction Parsing');
    console.error('❌ Error completo:', error);
    return { 
      type: 'expense' as const, 
      amount: 0, 
      category: 'Error', 
      description: text, 
      isRecurring: false,
      error: errorMessage 
    };
  }
};

// Función para procesar texto natural a transacciones de activos
export const parseNaturalLanguageAssetTransaction = async (text: string): Promise<{
  assetName: string;
  assetType: 'crypto' | 'equity' | 'bond' | 'commodity' | 'fund' | 'forex' | 'real_estate';
  type: 'buy' | 'sell' | 'dividend' | 'fee' | 'transfer';
  amount: number;
  quantity?: number;
  price?: number;
  currency: string;
  notes: string;
  error?: string;
} | null> => {
  try {
    // Validar API key
    if (!isValidApiKey(OPENAI_API_KEY)) {
      throw new Error('API key de OpenAI no válida');
    }

    console.log('🚀 Enviando solicitud a OpenAI para activo:', text);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `Eres un experto en finanzas que analiza operaciones de activos en español. SIEMPRE responde SOLO con JSON válido.

FORMATO OBLIGATORIO - NO añadas explicaciones:
{"assetName": "NOMBRE", "assetType": "TIPO", "type": "OPERACION", "amount": NUMERO, "currency": "MONEDA", "notes": "DESCRIPCION"}

TIPOS DE ACTIVOS (assetType):
- "crypto": Bitcoin, BTC, Ethereum, ETH, Dogecoin, DOGE, criptomonedas
- "equity": Apple, Tesla, Microsoft, Google, Amazon, Telefónica, Santander, acciones

TIPOS DE OPERACIONES (type):
- "buy": comprar, comprado, he comprado, inversión
- "sell": vender, vendido, he vendido
- "dividend": dividendos, dividendo, distribución
- "fee": comisión, comisiones, tasas

EJEMPLOS EXACTOS:
- "he comprado 10 acciones de Apple a 150 dólares cada una" → {"assetName": "Apple", "assetType": "equity", "type": "buy", "amount": 1500, "quantity": 10, "price": 150, "currency": "USD", "notes": "Compra de 10 acciones de Apple"}
- "he comprado Bitcoin por 1000 euros" → {"assetName": "Bitcoin", "assetType": "crypto", "type": "buy", "amount": 1000, "currency": "EUR", "notes": "Compra de Bitcoin"}
- "he recibido dividendos de Telefónica por 25 euros" → {"assetName": "Telefónica", "assetType": "equity", "type": "dividend", "amount": 25, "currency": "EUR", "notes": "Dividendos de Telefónica"}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error (Activos):', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    console.log('✅ Respuesta de OpenAI (Activos):', content);
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Extraer JSON de la respuesta con mejor regex
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No se encontró JSON en la respuesta de activos:', content);
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validar estructura con valores por defecto
    if (!parsed.assetName || !parsed.assetType || !parsed.type || !parsed.amount) {
      console.error('❌ Estructura de activo inválida:', parsed);
      throw new Error('Invalid asset transaction structure - missing required fields');
    }

    const result = {
      assetName: parsed.assetName,
      assetType: parsed.assetType,
      type: parsed.type,
      amount: parseFloat(parsed.amount),
      quantity: parsed.quantity ? parseFloat(parsed.quantity) : undefined,
      price: parsed.price ? parseFloat(parsed.price) : undefined,
      currency: parsed.currency || 'EUR',
      notes: parsed.notes || text,
    };

    console.log('🎉 Transacción de activo procesada correctamente:', result);
    return result;

  } catch (error) {
    const errorMessage = handleApiError(error, 'Asset Transaction Parsing');
    console.error('❌ Error completo en activos:', error);
    return {
      assetName: 'Error',
      assetType: 'equity' as const,
      type: 'buy' as const,
      amount: 0,
      currency: 'EUR',
      notes: text,
      error: errorMessage
    };
  }
}; 