import React from 'react';
import { base44 } from '@/api/base44Client';

export function LeadQualificationAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are an expert lead qualification specialist using BANT, CHAMP, and MEDDIC frameworks.

Evaluate leads based on:
- Budget: Financial capacity
- Authority: Decision-making power
- Need: Problem-solution fit
- Timeline: Urgency and timing
- Competition: Alternatives being considered
- Impact: Value and ROI potential

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Provide qualification score (0-100) and detailed analysis.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          qualification_score: { type: "number" },
          qualification_level: { 
            type: "string",
            enum: ["hot", "warm", "cold", "unqualified"]
          },
          analysis: { type: "string" },
          red_flags: {
            type: "array",
            items: { type: "string" }
          },
          opportunities: {
            type: "array",
            items: { type: "string" }
          },
          recommended_approach: { type: "string" },
          next_steps: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return result;
  };

  return { execute };
}

export function SalesNurturingAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are a sales nurturing expert who builds relationships and moves prospects through the funnel.

Your specialties:
- Personalized follow-up sequences
- Value-driven touchpoints
- Objection handling
- Educational content delivery
- Trust building
- Timely engagement

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Create nurturing strategy that:
- Provides value at each touchpoint
- Addresses specific pain points
- Builds credibility and trust
- Moves prospect closer to decision
- Maintains human connection`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          nurture_sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                channel: { type: "string" },
                message: { type: "string" },
                goal: { type: "string" }
              }
            }
          },
          personalization_points: {
            type: "array",
            items: { type: "string" }
          },
          content_recommendations: {
            type: "array",
            items: { type: "string" }
          },
          engagement_triggers: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return result;
  };

  return { execute };
}

export function ClosingAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are a master sales closer with expertise in:
- Identifying buying signals
- Handling objections with empathy
- Creating urgency without pressure
- Negotiation tactics
- Closing techniques (assumptive, alternative choice, summary)
- Contract finalization
- Upselling and cross-selling

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Provide closing strategy that:
- Addresses remaining objections
- Reinforces value and ROI
- Creates appropriate urgency
- Offers clear next steps
- Ensures smooth transition to onboarding`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          closing_approach: { type: "string" },
          objection_responses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                objection: { type: "string" },
                response: { type: "string" }
              }
            }
          },
          value_reinforcement: { type: "string" },
          urgency_elements: {
            type: "array",
            items: { type: "string" }
          },
          closing_script: { type: "string" },
          upsell_opportunities: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return result;
  };

  return { execute };
}

export const useSalesAgents = () => {
  const qualificationAgent = LeadQualificationAgent();
  const nurturingAgent = SalesNurturingAgent();
  const closingAgent = ClosingAgent();

  return {
    qualificationAgent,
    nurturingAgent,
    closingAgent
  };
};