import React from 'react';
import { base44 } from '@/api/base44Client';

export default function ResearchManager() {
  const execute = async (task, context = {}) => {
    const prompt = `You are the Research Manager - responsible for gathering information and conducting analysis.

YOUR SUB-AGENTS:
- Web Research Agent: Search internet, scrape websites
- LinkedIn Research Agent: Research people/companies on LinkedIn
- Competitive Analysis Agent: Analyze competitors
- Data Analysis Agent: Process and analyze data

TASK: ${task}

CONTEXT: ${JSON.stringify(context)}

Conduct thorough research. Return JSON with:
{
  "research_summary": "Executive summary of findings",
  "key_findings": ["list of key discoveries"],
  "data_gathered": {
    "sources": ["list of sources"],
    "facts": ["list of facts"],
    "insights": ["list of insights"]
  },
  "recommendations": "Recommended actions based on research"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          research_summary: { type: "string" },
          key_findings: {
            type: "array",
            items: { type: "string" }
          },
          data_gathered: {
            type: "object",
            properties: {
              sources: { type: "array", items: { type: "string" } },
              facts: { type: "array", items: { type: "string" } },
              insights: { type: "array", items: { type: "string" } }
            }
          },
          recommendations: { type: "string" }
        }
      }
    });

    return result;
  };

  return { execute };
}

export const useResearchManager = () => {
  const manager = ResearchManager();
  return manager;
};