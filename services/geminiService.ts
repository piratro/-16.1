
import { GoogleGenAI, Type } from "@google/genai";
import { RollingStock, Trip } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartScheduleAdvice = async (stock: RollingStock[], trips: Trip[]) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `As a railway logistics expert, analyze the following rolling stock and current schedules.
            
            Current Stock: ${JSON.stringify(stock)}
            Current Trips: ${JSON.stringify(trips)}
            
            Provide 3 key insights or suggestions to optimize the schedule or maintenance plan. 
            Format the response as a clear, professional JSON array of objects with 'title' and 'description' keys.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ['title', 'description']
                    }
                }
            }
        });

        return JSON.parse(response.text || '[]');
    } catch (error) {
        console.error("Gemini Error:", error);
        return [];
    }
};
