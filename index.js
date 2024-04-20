function uuid() {
  const chars = '0123456789abcdef';
  let response = '';
  for (let i = 0; i < 8; i++) response += chars[Math.floor(Math.random() * chars.length)];
  response += '-';
  for (let i = 0; i < 4; i++) response += chars[Math.floor(Math.random() * chars.length)];
  response += '-';
  for (let i = 0; i < 4; i++) response += chars[Math.floor(Math.random() * chars.length)];
  response += '-';
  for (let i = 0; i < 4; i++) response += chars[Math.floor(Math.random() * chars.length)];
  response += '-';
  for (let i = 0; i < 12; i++) response += chars[Math.floor(Math.random() * chars.length)];
  return (response);
}

async function generate(message, parentId = uuid(), conversationId = null, action = 'next') {
  const cookies = (await fetch('https://chat.openai.com/', {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'sec-ch-ua': '\'Chromium\';v=\'123\', \'Not:A-Brand\';v=\'8\'',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '\'Linux\'',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      cookie: '_dd_s=',
      Referer: 'https://chat.openai.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
  })).headers.getSetCookie();
  let oaiId;
  for (const setCookie of cookies) for (const cookie of setCookie.split('; ')) if (cookie.startsWith('oai-did=')) oaiId = cookie.substring(8); 
  console.log(oaiId);
  let token = await (await fetch('https://chat.openai.com/backend-anon/sentinel/chat-requirements', {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'oai-device-id': oaiId,
      'oai-language': 'en-US',
      'sec-ch-ua': '\'Chromium\';v=\'123\', \'Not:A-Brand\';v=\'8\'',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '\'Linux\'',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      Referer: 'https://chat.openai.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    body: '{}',
    method: 'POST'
  })).text();
  try {
    token = JSON.parse(token).token;
  } catch (error) {
    // console.log(token)
    return null;
  }
  console.log(token)
  const body = {
    action, // 'next' for new prompts, 'variant' for regenerating a response for the same prompt
    'messages': [
      {
        id: uuid(),
        author: { role: 'user' },
        content: {
          'content_type': 'text',
          parts: [ message ]
        },
        metadata: {}
      }
    ],
    parent_message_id: parentId,
    model: 'text-davinci-002-render-sha',
    timezone_offset_min: 240,
    history_and_training_disabled: false,
    conversation_mode: { kind: 'primary_assistant' },
    force_paragen: false,
    force_paragen_model_slug: '',
    force_nulligen: false,
    force_rate_limit: false,
    websocket_request_id: 'bd96e15e-0197-4593-9530-d7f032638bc5'
  }
  if (conversationId != null) body.conversation_id = conversationId;
  const response = await (await fetch('https://chat.openai.com/backend-anon/conversation', {
    headers: {
      accept: 'text/event-stream',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'oai-device-id': oaiId,
      'oai-language': 'en-US',
      'openai-sentinel-chat-requirements-token': token,
      'sec-ch-ua': '"Chromium";v="123", "Not:A-Brand";v="8"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      cookie: `oai-did=${oaiId}`,
      'Referer': 'https://chat.openai.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    body: JSON.stringify(body),
    method: 'POST'
  })).text();

  // console.log(response);
  const finalMessage = JSON.parse(response.split('\n\ndata: ')[response.split('\n\ndata: ').length - 2]);
  console.log(finalMessage)
  // return { message: finalMessage.message.content.parts[0], messageId: finalMessage.message.id, conversationId: finalMessage.conversation_id };
};
(async () => {
  const conversation = (await generate('Hello, I am John'));
  // console.log((await generate('Repeat what I just said:', conversation.messageId, conversation.conversationId)).message);
})();