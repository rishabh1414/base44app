import React from 'react';
import { base44 } from '@/api/base44Client';

export function SEOAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are an elite SEO specialist agent with expertise in:
- Technical SEO (site speed, mobile optimization, schema markup)
- On-page SEO (keyword optimization, meta tags, content structure)
- Off-page SEO (backlinks, authority building)
- Local SEO and Google My Business optimization
- SEO audits and competitive analysis
- AEO (Answer Engine Optimization) for voice search and AI assistants
- GEO (Generative Engine Optimization) for AI-powered search engines

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Provide comprehensive SEO recommendations with:
1. Actionable steps
2. Expected impact
3. Priority level (high/medium/low)
4. Resources needed
5. Success metrics

Return detailed JSON with your analysis and recommendations.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          analysis: { type: "string" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                impact: { type: "string" },
                effort: { type: "string" }
              }
            }
          },
          keywords: {
            type: "array",
            items: { type: "string" }
          },
          estimated_ranking_improvement: { type: "string" }
        }
      }
    });

    return result;
  };

  return { execute };
}

export function ViralContentAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are a viral content creation specialist who understands:
- Platform-specific viral mechanics (TikTok, Instagram Reels, YouTube Shorts, Twitter/X)
- Psychological triggers (curiosity, emotion, controversy, value)
- Hook formulas and attention retention
- Trending topics and meme culture
- Social proof and engagement tactics

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Create content designed to maximize virality with:
- Attention-grabbing hooks (first 3 seconds critical)
- Emotional resonance and relatability
- Clear value proposition
- Call-to-action that encourages sharing
- Optimal hashtags and keywords

Return detailed content strategy.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          hook: { type: "string" },
          main_content: { type: "string" },
          viral_elements: {
            type: "array",
            items: { type: "string" }
          },
          hashtags: {
            type: "array",
            items: { type: "string" }
          },
          posting_strategy: { type: "string" },
          expected_engagement: { type: "string" }
        }
      }
    });

    return result;
  };

  return { execute };
}

export function EmailMarketingAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are an expert email marketing agent specializing in:
- High-converting email sequences
- Subject line optimization (open rates 40%+)
- Personalization and segmentation
- A/B testing strategies
- Email automation workflows
- Deliverability optimization
- Compliance (CAN-SPAM, GDPR)

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Create email campaigns that:
1. Capture attention immediately
2. Build trust and credibility
3. Drive specific actions
4. Nurture relationships over time
5. Maximize ROI

Return complete email strategy.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          subject_lines: {
            type: "array",
            items: { type: "string" }
          },
          email_body: { type: "string" },
          call_to_action: { type: "string" },
          personalization_tokens: {
            type: "array",
            items: { type: "string" }
          },
          segmentation_strategy: { type: "string" },
          follow_up_sequence: {
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

export const useMarketingAgents = () => {
  const seoAgent = SEOAgent();
  const viralAgent = ViralContentAgent();
  const emailAgent = EmailMarketingAgent();

  return {
    seoAgent,
    viralAgent,
    emailAgent
  };
};