// import { InferenceClient } from '@huggingface/inference';
// import { Pinecone } from '@pinecone-database/pinecone';
// import type { Index, RecordMetadata } from '@pinecone-database/pinecone';
// import { AppError } from '../utils/error.util';

// export class ChatbotService {
//   private hf: InferenceClient;
//   private pinecone: Pinecone;
//   private pineconeIndex: Index<RecordMetadata>;

//   private readonly PINECONE_INDEX_NAME = 'smarttravel';
//   private readonly PINECONE_NAMESPACE = '';
//   private readonly LLM_MODEL = 'google/gemma-2-2b-it';
//   private readonly EMBEDDING_MODEL = 'BAAI/bge-large-en-v1.5';

//   constructor() {
//     if (!process.env['HUGGING_FACE_API_TOKEN']) {
//       throw new Error('Hugging Face API token is not configured.');
//     }

//     this.hf = new InferenceClient(process.env['HUGGING_FACE_API_TOKEN']);

//     if (!process.env['PINECONE_API_KEY']) {
//       throw new Error('Pinecone API key is not configured.');
//     }

//     this.pinecone = new Pinecone();
//     this.pineconeIndex = this.pinecone.index(this.PINECONE_INDEX_NAME);
//   }

//   async generateResponse(userMessage: string): Promise<string> {
//     try {
//       const context = await this.retrieveContext(userMessage);

//       const systemMessage = `You are a friendly and helpful travel assistant for "Smart Travel Sri Lanka". 
// Your goal is to help users plan their trip to Sri Lanka. 
// Answer questions about destinations, tours, culture, food, and provide travel tips.

// IMPORTANT: Respond in plain text without Markdown formatting. Do not use asterisks (*) or other formatting symbols. Write naturally in clear, conversational paragraphs.

// Use the following context from our database to answer the user's question. 
// If the context is not relevant or empty, use your general knowledge but still act as a travel assistant for Sri Lanka.
// Context:
// ---
// ${context || 'No specific context found.'}
// ---`;

//       const response = await this.hf.chatCompletion({
//         model: this.LLM_MODEL,
//         messages: [
//           { role: 'system', content: systemMessage },
//           { role: 'user', content: userMessage }
//         ],
//         max_tokens: 250,
//         temperature: 0.7,
//       });

//       const reply = response.choices[0]?.message?.content;
//       // Strip any remaining markdown as backup
//       const cleanedReply = this.stripMarkdown(reply?.trim() || '');
//       return cleanedReply || 'I am sorry, but I could not generate a response.';

//     } catch (error: any) {
//       console.error('Error in chatbot service:', error);
//       const msg = error.message || 'Unknown error while generating response.';
//       throw new AppError(`Sorry, I am having trouble connecting to my brain right now. Details: ${msg}`, 503);
//     }
//   }

//   /** Strip Markdown formatting */
//   private stripMarkdown(text: string): string {
//     return text
//       .replace(/\*\*([^*]+)\*\*/g, '$1')  // Bold
//       .replace(/\*([^*]+)\*/g, '$1')      // Italic
//       .replace(/^\* /gm, '- ')            // Bullet points
//       .replace(/\n{3,}/g, '\n\n')         // Extra newlines
//       .trim();
//   }

//   /** Type Guards */
//   private isFlatArray(arr: any): arr is number[] {
//     return Array.isArray(arr) && arr.every((item) => typeof item === 'number');
//   }

//   private isNestedArray(arr: any): arr is number[][] | number[][][] {
//     return Array.isArray(arr) && Array.isArray(arr[0]);
//   }

//   private async retrieveContext(query: string, topK = 3): Promise<string> {
//     try {
//       const queryEmbedding = await this.hf.featureExtraction({
//         model: this.EMBEDDING_MODEL,
//         inputs: query,
//       });

//       let vector: number[] | null = null;

//       if (this.isNestedArray(queryEmbedding)) {
//         const firstElement = queryEmbedding[0];
//         if (this.isFlatArray(firstElement)) {
//           vector = firstElement;
//         }
//       } else if (this.isFlatArray(queryEmbedding)) {
//         vector = queryEmbedding;
//       }

//       if (!vector) {
//         throw new Error('Invalid embedding format received from Hugging Face.');
//       }

//       const indexStats = await this.pineconeIndex.describeIndexStats();
//       const namespaceExists = indexStats.namespaces?.[this.PINECONE_NAMESPACE];

//       if (!namespaceExists) {
//         console.warn(`Pinecone namespace "${this.PINECONE_NAMESPACE}" does not exist or is empty. Skipping context retrieval.`);
//         return '';
//       }

//       const queryResult = await this.pineconeIndex
//         .namespace(this.PINECONE_NAMESPACE)
//         .query({
//           vector,
//           topK,
//           includeMetadata: true,
//         });

//       if (!queryResult.matches || queryResult.matches.length === 0) {
//         return '';
//       }

//       return (
//         queryResult.matches
//           .map((m) => m.metadata?.['text'])
//           .filter(Boolean)
//           .join('\n\n') ?? ''
//       );

//     } catch (err) {
//       console.error('Pinecone retrieval error:', err);
//       return '';
//     }
//   }
// }

import Groq from 'groq-sdk';
import { Pinecone } from '@pinecone-database/pinecone';
import type { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { InferenceClient } from '@huggingface/inference'; // Keep for embeddings only
import { AppError } from '../utils/error.util';

export class ChatbotService {
  private groq: Groq;
  private hf: InferenceClient;         // Still used for Pinecone embeddings
  private pinecone: Pinecone;
  private pineconeIndex: Index<RecordMetadata>;

  private readonly PINECONE_INDEX_NAME = 'smarttravel';
  private readonly PINECONE_NAMESPACE = '';
  private readonly LLM_MODEL = 'llama-3.1-8b-instant';  // Free Groq model
  private readonly EMBEDDING_MODEL = 'BAAI/bge-large-en-v1.5';

  constructor() {
    if (!process.env['GROQ_API_KEY']) {
      throw new Error('Groq API key is not configured.');
    }
    this.groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

    if (!process.env['HUGGING_FACE_API_TOKEN']) {
      throw new Error('Hugging Face API token is not configured.');
    }
    this.hf = new InferenceClient(process.env['HUGGING_FACE_API_TOKEN']);

    if (!process.env['PINECONE_API_KEY']) {
      throw new Error('Pinecone API key is not configured.');
    }
    this.pinecone = new Pinecone();
    this.pineconeIndex = this.pinecone.index(this.PINECONE_INDEX_NAME);
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const context = await this.retrieveContext(userMessage);

      const systemMessage = `You are a friendly and helpful travel assistant for "Smart Travel Sri Lanka". 
Your goal is to help users plan their trip to Sri Lanka. 
Answer questions about destinations, tours, culture, food, and provide travel tips.

IMPORTANT: Respond in plain text without Markdown formatting. Do not use asterisks (*) or other formatting symbols. Write naturally in clear, conversational paragraphs.

Use the following context from our database to answer the user's question. 
If the context is not relevant or empty, use your general knowledge but still act as a travel assistant for Sri Lanka.
Context:
---
${context || 'No specific context found.'}
---`;

      const response = await this.groq.chat.completions.create({
        model: this.LLM_MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 250,
        temperature: 0.7,
      });

      const reply = response.choices[0]?.message?.content?.trim() || '';
      return this.stripMarkdown(reply) || 'I am sorry, but I could not generate a response.';

    } catch (error: any) {
      console.error('Error in chatbot service:', error);
      const msg = error.message || 'Unknown error while generating response.';
      throw new AppError(`Sorry, I am having trouble connecting right now. Details: ${msg}`, 503);
    }
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\* /gm, '- ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private isFlatArray(arr: any): arr is number[] {
    return Array.isArray(arr) && arr.every((item) => typeof item === 'number');
  }

  private isNestedArray(arr: any): arr is number[][] | number[][][] {
    return Array.isArray(arr) && Array.isArray(arr[0]);
  }

  private async retrieveContext(query: string, topK = 3): Promise<string> {
    try {
      const queryEmbedding = await this.hf.featureExtraction({
        model: this.EMBEDDING_MODEL,
        inputs: query,
      });

      let vector: number[] | null = null;

      if (this.isNestedArray(queryEmbedding)) {
        const firstElement = queryEmbedding[0];
        if (this.isFlatArray(firstElement)) {
          vector = firstElement;
        }
      } else if (this.isFlatArray(queryEmbedding)) {
        vector = queryEmbedding;
      }

      if (!vector) {
        throw new Error('Invalid embedding format received from Hugging Face.');
      }

      const indexStats = await this.pineconeIndex.describeIndexStats();
      const namespaceExists = indexStats.namespaces?.[this.PINECONE_NAMESPACE];

      if (!namespaceExists) {
        console.warn(`Pinecone namespace "${this.PINECONE_NAMESPACE}" does not exist or is empty.`);
        return '';
      }

      const queryResult = await this.pineconeIndex
        .namespace(this.PINECONE_NAMESPACE)
        .query({
          vector,
          topK,
          includeMetadata: true,
        });

      if (!queryResult.matches || queryResult.matches.length === 0) {
        return '';
      }

      return (
        queryResult.matches
          .map((m) => m.metadata?.['text'])
          .filter(Boolean)
          .join('\n\n') ?? ''
      );

    } catch (err) {
      console.error('Pinecone retrieval error:', err);
      return '';
    }
  }
}