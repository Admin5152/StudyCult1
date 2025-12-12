import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StudySet, Difficulty, QuestionType } from "../types";

const generateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A fun and engaging summary of the key ideas."
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          difficulty: {
            type: Type.STRING,
            enum: [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard]
          }
        },
        required: ["question", "answer", "difficulty"]
      }
    },
    quiz: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                enum: [QuestionType.MultipleChoice, QuestionType.ShortAnswer]
              },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 4 options if type is multiple_choice"
              },
              correct_answer: {
                type: Type.STRING,
                description: "The correct option string if type is multiple_choice"
              },
              ideal_answer: {
                type: Type.STRING,
                description: "The model answer if type is short_answer"
              }
            },
            required: ["type", "question"]
          }
        }
      },
      required: ["title", "questions"]
    }
  },
  required: ["summary", "flashcards", "quiz"]
};

export const generateStudyMaterial = async (content: string, category: string): Promise<StudySet> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in process.env");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are 'Cultists', a fun and engaging AI study buddy.
    Analyze the following study material and generate a study set.
    The user has selected the category: "${category}". 
    Tailor the tone and examples to this category, but keep it accurate for university-level study.
    
    Content to analyze:
    "${content}"
    
    Tasks:
    1. Create a summary that is easy to understand.
    2. Generate flashcards with varying difficulty.
    3. Create a quiz with a mix of multiple choice and short answer questions.
    
    Output strictly in the requested JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: generateSchema,
        temperature: 0.5, // Slightly higher for a bit more "fun" variety while keeping facts
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response generated");
    }

    return JSON.parse(responseText) as StudySet;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};