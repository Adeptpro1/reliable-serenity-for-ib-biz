import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

class AiService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  async extractSearchIntent(prompt) {
    if (!this.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("AI Service is not configured properly (missing GEMINI_API_KEY in .env).");
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    const categories = [
      "AGRIBUSINESS", "MANUFACTURING", "RETAIL_WHOLESALE", "TECHNOLOGY", "HEALTHCARE", "EDUCATION",
      "TOURISM_HOSPITALITY", "REAL_ESTATE", "TRANSPORT_LOGISTICS", "FINANCIAL_SERVICES", "ENERGY",
      "MINING", "CREATIVE_ENTERTAINMENT", "PROFESSIONAL_SERVICES", "ENVIRONMENTAL_SERVICES",
      "SECURITY_SERVICES", "TELECOMMUNICATIONS", "MEDIA_PUBLISHING", "AUTOMOTIVE", "PERSONAL_SERVICES",
      "HOUSEHOLD_SERVICES"
    ];

    const cities = ["Ibadan", "Ogbomosho", "Oyo", "Iseyin", "Saki"];

    const lgs = [
      "I_DO_NOT_STAY_IN_OYO", "Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan_North", "Ibadan_North_East",
      "Ibadan_North_West", "Ibadan_South_East", "Ibadan_South_West", "Ibarapa_Central", "Ibarapa_East",
      "Ibarapa_North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho_North",
      "Ogbomosho_South", "Ogo_Oluwa", "Olorunsogo", "Oluyole", "Ona_Ara", "Orelope", "Ori_Ire", "Oyo_East",
      "Oyo_West", "Saki_East", "Saki_West", "Surulere"
    ];

    const towns = [
      "Mokola", "Bodija", "Agodi", "Iwo_Road", "Dugbe", "Apata", "Sango", "UI", "Agbowo", "Samonda", "Ojoo",
      "Alalubosa", "Bashorun", "Felele", "Jericho", "Oluyole", "Challenge", "Olorunsogo", "Onireke", "Eleyele",
      "Eruwa", "Kisi", "Igboho", "Igbeti", "Awe", "Ilora", "Oja_ba", "Beere", "Foko", "Labiran", "OkeAdo",
      "OkeBola", "OkeOffa", "OkePadi", "Yemetu", "Akobo", "Egbeda", "Olodo", "Monatan", "Olorunda", "Orogun",
      "Ologuneru", "Adegbayi", "Oje", "Okeho", "Lanlate", "Lalupon", "Fiditi", "Igbo_Ora", "Idere", "Moniya",
      "Akanran", "Apatere", "Adeoyo", "Idi_Ayunre", "Olanla", "Olojuoro", "Osekan", "Podo", "Apete", "Ajibode",
      "Sepeteri", "Tede", "Iwere_Ile", "Ago_Are", "Ilero", "Akinyele", "Alakia", "Apomu", "Jobele", "Omi_Adio", "Otu"
    ];

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        intentFound: {
          type: SchemaType.BOOLEAN,
          description: "True if the user is looking for a business, service, product, or location. False if they are just asking conversational questions (like 'Who are you?' or 'What is 2+2?')"
        },
        keywords: {
          type: SchemaType.STRING,
          description: "A highly optimized comma-separated list of core entities and synonyms to find businesses in the database. E.g., 'car fix' -> 'mechanic, auto repair, garage, fix car'. Leave empty if none.",
          nullable: true,
        },
        category: {
          type: SchemaType.STRING,
          description: "The closest matching category from the valid Enums.",
          enum: categories,
          nullable: true,
        },
        town: {
          type: SchemaType.STRING,
          description: "The closest matching town from the valid Enums.",
          enum: towns,
          nullable: true,
        },
        city: {
          type: SchemaType.STRING,
          description: "The closest matching city from the valid Enums.",
          enum: cities,
          nullable: true,
        },
        lg: {
          type: SchemaType.STRING,
          description: "The closest matching Local Government from the valid Enums.",
          enum: lgs,
          nullable: true,
        }
      },
      required: ["intentFound"]
    };

    const systemInstruction = `You are an expert search recommendation engine for the Debisi Directory (a business directory in Oyo State, Nigeria).
Analyze the user query.
1. Determine if they are actually looking for something (intentFound = true).
2. Extract the core entities they are searching for, and provide 3-4 powerful synonyms to maximize database matches (keywords).
3. Auto-correct spelling for locations and map them EXACTLY to the provided Enums. E.g. "Ibadn South" -> lg: "Ibadan_South_West". If a location doesn't fit the enums, leave it null.
4. If a user asks for "Mokola, Ibadan", map town to "Mokola" and city to "Ibadan".`;

    const fullPrompt = `${systemInstruction}\n\nUser Query: "${prompt}"`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1,
        }
      });
      
      const text = result.response.text();
      const parsed = JSON.parse(text);

      if (!parsed.intentFound) {
        return { keywords: null, category: null, town: null, city: null, lg: null };
      }

      return {
        keywords: parsed.keywords || null,
        category: parsed.category || null,
        town: parsed.town || null,
        city: parsed.city || null,
        lg: parsed.lg || null,
      };

    } catch (error) {
      console.error("AI Service Error Detail:", error.message || error);
      throw new Error("Unable to analyze prompt precisely.");
    }
  }
}

const aiServiceInstance = new AiService();
export default aiServiceInstance;
