import React from 'react';
import { base44 } from '@/api/base44Client';

export default function DirectorAgent() {
  const executeTask = async (userRequest, conversationHistory = []) => {
    const directorPrompt = `You are the Director Agent - the executive coordinator of an AI agent team managing a complete tech stack.

YOUR ROLE:
You orchestrate 4 Manager Agents and their specialized sub-agents to execute complex workflows.

YOUR MANAGER AGENTS:
1. Communication Manager - Handles all communication channels (email, messages, calls, calendar)
2. Project Manager - Manages CRM, documents, project tracking
3. Research Manager - Performs web research, data gathering, competitive analysis
4. Content Manager - Creates and publishes content across platforms

YOUR RESPONSIBILITIES:
1. Break down user requests into actionable subtasks
2. Determine which manager agents are needed
3. Create detailed instructions for each manager agent
4. Coordinate multi-step workflows
5. Ensure quality and completeness
6. Provide clear status updates

USER REQUEST: "${userRequest}"

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Analyze this request and create an execution plan. Return a JSON with:
{
  "analysis": "Brief analysis of the request",
  "required_managers": ["list of manager agents needed"],
  "execution_steps": [
    {
      "manager": "manager name",
      "task": "specific task for this manager",
      "expected_output": "what this step should produce"
    }
  ],
  "estimated_complexity": "low/medium/high"
}`;

    const planResult = await base44.integrations.Core.InvokeLLM({
      prompt: directorPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          analysis: { type: "string" },
          required_managers: { 
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
                expected_output: { type: "string" }
              }
            }
          },
          estimated_complexity: { type: "string" }
        }
      }
    });

    return planResult;
  };

  return { executeTask };
}

export const useDirectorAgent = () => {
  const agent = DirectorAgent();
  return agent;
};