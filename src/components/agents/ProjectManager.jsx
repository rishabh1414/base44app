import React from 'react';
import { base44 } from '@/api/base44Client';

export default function ProjectManager() {
  const execute = async (task, context = {}) => {
    const prompt = `You are the Project Manager - responsible for CRM, documents, and project tracking.

YOUR SUB-AGENTS:
- CRM Agent: Manage contacts, leads, opportunities
- Document Agent: Create, update, organize documents
- Task Agent: Track tasks and projects

TASK: ${task}

CONTEXT: ${JSON.stringify(context)}

Execute this project management task. Return JSON with:
{
  "actions_taken": [
    {
      "sub_agent": "agent name",
      "action": "what was done",
      "result": "outcome",
      "data": {}
    }
  ],
  "created_documents": ["list of document links"],
  "updated_records": ["list of updated records"],
  "summary": "Brief summary"
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
          created_documents: {
            type: "array",
            items: { type: "string" }
          },
          updated_records: {
            type: "array",
            items: { type: "string" }
          },
          summary: { type: "string" }
        }
      }
    });

    return result;
  };

  const addContact = async (contactData) => {
    try {
      const contact = await base44.entities.Contact.create(contactData);
      return { success: true, contact };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { execute, addContact };
}

export const useProjectManager = () => {
  const manager = ProjectManager();
  return manager;
};