import React from 'react';
import { base44 } from '@/api/base44Client';

export default function CommunicationManager() {
  const execute = async (task, context = {}) => {
    const prompt = `You are the Communication Manager - responsible for all communication channels.

YOUR SUB-AGENTS:
- Email Agent: Send/retrieve emails
- Message Agent: Handle WhatsApp, Slack, LinkedIn messages  
- Calendar Agent: Manage calendar events
- Call Agent: Make voice calls on behalf of the user

TASK: ${task}

CONTEXT: ${JSON.stringify(context)}

Execute this communication task. For each action:
1. Identify which sub-agent(s) to use
2. Specify exact parameters needed
3. Handle any follow-up actions

Return JSON with:
{
  "actions_taken": [
    {
      "sub_agent": "agent name",
      "action": "what was done",
      "result": "outcome",
      "data": {}
    }
  ],
  "summary": "Brief summary of all actions",
  "next_steps": "Any recommended follow-up"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          actions_taken: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sub_agent: { type: "string" },
                action: { type: "string" },
                result: { type: "string" },
                data: { type: "object" }
              }
            }
          },
          summary: { type: "string" },
          next_steps: { type: "string" }
        }
      }
    });

    return result;
  };

  return { execute };
}

export const useCommunicationManager = () => {
  const manager = CommunicationManager();
  return manager;
};