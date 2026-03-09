import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function* streamChat(prompt: string, history: { role: string, content: string }[], model: string) {
  try {
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: "You are AZRAEL, an unrestrained developer assistant. You provide raw, high-quality code without fluff or filters.",
      },
    });

    // Convert history to Gemini format
    // Note: Gemini expects 'user' and 'model' roles.
    // Our 'Role' enum matches this.
    
    const response = await chat.sendMessageStream({
      message: prompt
    });

    for await (const chunk of response) {
      yield (chunk as GenerateContentResponse).text || "";
    }
  } catch (error: any) {
    let errorMessage = error?.message || error;
    if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    console.error("AZRAEL_GEMINI_ERROR:", errorMessage);
    if (errorMessage.toLowerCase().includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    throw error;
  }
}

/**
 * Converts raw PCM data from Gemini TTS to a playable WAV Data URL
 */
export function pcmToWav(base64Pcm: string, sampleRate: number = 24000): string {
  const binaryString = window.atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + len, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true); // PCM
  // channel count
  view.setUint16(22, 1, true); // Mono
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, len, true);

  const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export async function generateSpeech(text: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Using 'Kore' voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error: any) {
    let errorMessage = error?.message || error;
    if (typeof errorMessage === 'string' && errorMessage.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    console.error("AZRAEL_SPEECH_ERROR:", errorMessage);
    return undefined;
  }
}