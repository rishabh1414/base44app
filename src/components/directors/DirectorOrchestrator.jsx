
import React from 'react';
import { base44 } from '@/api/base44Client';

export function DirectorOrchestrator() {
  const directors = {
    business: 'Business Operations Director',
    creative: 'Creative & Content Director',
    technology: 'Technology & Security Director',
    personal: 'Personal Life Director',
    financial: 'Financial & Legal Director',
    health: 'Health & Wellness Director'
  };

  const routeToDirector = async (userRequest, conversationHistory = []) => {
    const directorList = Object.values(directors).join(', ');

    const routingPrompt = `You are the Master Orchestrator, an AI expert at routing user requests to the correct specialized AI Director. Your primary goal is to analyze the user's request and select the single best director to handle it from the provided list.

AVAILABLE DIRECTORS:
- Business Operations Director: Handles sales, marketing, HR, operations, and project management.
- Creative & Content Director: Manages content creation, social media, design, branding.
- Technology & Security Director: Oversees cybersecurity, IT, software development, data.
- Personal Life Director: Assists with daily tasks, travel, education, home management.
- Financial & Legal Director: Manages personal finance, investments, taxes, legal services.
- Health & Wellness Director: Focuses on medical, fitness, nutrition, mental health.

USER REQUEST: "${userRequest}"

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Analyze the user's request. Your task is to select the most appropriate director to handle this request.

IMPORTANT: You MUST return a JSON object with a 'primary_director' key. The value MUST be one of the exact director names from the list above. You may optionally include 'execution_order' as a list of directors if multiple steps are needed, but 'primary_director' is mandatory.`;

    let routing = await base44.integrations.Core.InvokeLLM({
      prompt: routingPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_director: { type: "string", "enum": Object.values(directors) },
          supporting_directors: { "type": "array", "items": { "type": "string" } },
          execution_order: { "type": "array", "items": { "type": "string" } },
          user_intent: { type: "string" },
          complexity_level: { 
            type: "string",
            enum: ["simple", "moderate", "complex", "enterprise"]
          },
          estimated_time: { type: "string" }
        },
        required: ["primary_director"]
      }
    });

    // Fallback mechanism if the primary director is still not identified
    if (!routing || !routing.primary_director) {
      console.warn("Orchestrator: Primary director not identified. Engaging fallback mechanism.");
      const fallbackPrompt = `The user request is: "${userRequest}". Which of the following directors is the absolute best fit to handle this request? Directors: ${directorList}. Respond with JSON containing only the 'primary_director' key.`;
      
      routing = await base44.integrations.Core.InvokeLLM({
        prompt: fallbackPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            primary_director: { type: "string", "enum": Object.values(directors) }
          },
          required: ["primary_director"]
        }
      });
    }

    return routing;
  };

  const executeRequest = async (userRequest, routing) => {
    const results = [];

    // Safeguard against missing or invalid execution_order
    const executionOrder = Array.isArray(routing?.execution_order) && routing.execution_order.length > 0
      ? routing.execution_order
      : (routing?.primary_director ? [routing.primary_director] : []);

    if (executionOrder.length === 0) {
      console.error("Orchestrator: No valid director found in routing decision.", routing);
      return [{ error: "Could not determine which director should handle this request." }];
    }

    for (const directorName of executionOrder) {
      const directorResult = await executeDirector(directorName, userRequest, results);
      results.push(directorResult);
    }

    return results;
  };

  const executeDirector = async (directorName, request, previousResults) => {
    const directorPrompt = `You are the ${directorName}.

USER REQUEST: ${request}

PREVIOUS RESULTS: ${JSON.stringify(previousResults)}

Based on your area of expertise, determine:
1. Which of your managers should handle this
2. What specific tasks they should execute
3. What outcomes you expect

Return detailed execution plan for your team.`;

    const plan = await base44.integrations.Core.InvokeLLM({
      prompt: directorPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          director_name: { type: "string" },
          assigned_managers: {
            type: "array",
            items: { type: "string" }
          },
          execution_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                manager: { type: "string" },
                task: { type: "string" },
                agents_needed: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          expected_outcomes: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return plan;
  };

  return {
    routeToDirector,
    executeRequest,
    executeDirector
  };
}

export const useDirectorOrchestrator = () => {
  const orchestrator = DirectorOrchestrator();
  return orchestrator;
};
