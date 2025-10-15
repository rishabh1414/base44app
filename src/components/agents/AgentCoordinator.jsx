import React from 'react';
import { base44 } from '@/api/base44Client';

export function AgentCoordinator() {
  const requestAgentHelp = async (requestingAgent, targetAgent, requestContext, taskId) => {
    try {
      const interaction = await base44.entities.AgentInteraction.create({
        requesting_agent: requestingAgent,
        target_agent: targetAgent,
        interaction_type: 'collaboration',
        request_context: requestContext,
        task_id: taskId,
        status: 'pending'
      });

      return interaction;
    } catch (error) {
      console.error('Error creating agent interaction:', error);
      return null;
    }
  };

  const completeInteraction = async (interactionId, response, dataShared = {}) => {
    try {
      await base44.entities.AgentInteraction.update(interactionId, {
        response,
        data_shared: dataShared,
        status: 'completed'
      });
    } catch (error) {
      console.error('Error updating interaction:', error);
    }
  };

  const getAgentExpertise = (agentName) => {
    const expertiseMap = {
      'SEO Agent': ['search optimization', 'keywords', 'ranking', 'technical SEO'],
      'Viral Content Agent': ['viral mechanics', 'trending topics', 'engagement'],
      'Instagram Agent': ['visual content', 'reels', 'stories', 'influencer marketing'],
      'TikTok Agent': ['short video', 'trending sounds', 'Gen Z content'],
      'YouTube Agent': ['long-form video', 'video SEO', 'monetization'],
      'Lead Qualification Agent': ['lead scoring', 'BANT framework', 'prospect analysis'],
      'Sales Nurturing Agent': ['relationship building', 'follow-up sequences', 'objection handling'],
      'Closing Agent': ['negotiation', 'deal closing', 'contract finalization'],
      'Graphic Design Agent': ['visual design', 'branding', 'graphics'],
      'Video Script Agent': ['scriptwriting', 'storyboarding', 'video planning'],
      'Email Marketing Agent': ['email campaigns', 'subject lines', 'deliverability']
    };

    return expertiseMap[agentName] || [];
  };

  const findBestAgent = async (task, context) => {
    const prompt = `You are an AI agent coordinator. Given this task and context, determine which specialized agent(s) would be best suited to handle it.

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

AVAILABLE AGENTS:
- SEO Agent: Search optimization, keywords, ranking, technical SEO
- Viral Content Agent: Creating viral content, trending topics, engagement tactics
- Instagram Agent: Instagram-specific content, Reels, Stories
- TikTok Agent: TikTok videos, trending sounds, Gen Z content
- YouTube Agent: YouTube optimization, video SEO, long-form content
- Lead Qualification Agent: Qualifying leads, BANT framework
- Sales Nurturing Agent: Building relationships, follow-up sequences
- Closing Agent: Closing deals, negotiation, contracts
- Graphic Design Agent: Visual design, graphics, branding
- Video Script Agent: Video scripts, storyboards
- Email Marketing Agent: Email campaigns, subject lines
- Communication Manager: Email, messaging, calendar management
- Project Manager: CRM, documents, project tracking
- Research Manager: Web research, competitive analysis
- Content Manager: Blog posts, social media content

Return the best agent(s) to handle this task.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_agent: { type: "string" },
          supporting_agents: {
            type: "array",
            items: { type: "string" }
          },
          reasoning: { type: "string" },
          collaboration_strategy: { type: "string" }
        }
      }
    });

    return result;
  };

  return {
    requestAgentHelp,
    completeInteraction,
    getAgentExpertise,
    findBestAgent
  };
}

export const useAgentCoordinator = () => {
  const coordinator = AgentCoordinator();
  return coordinator;
};