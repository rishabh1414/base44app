import React from 'react';
import { base44 } from '@/api/base44Client';

export function InstagramAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are an Instagram growth and content expert specializing in:
- Reels creation and viral mechanics
- Story engagement and highlights
- Grid aesthetic and feed planning
- Hashtag research and optimization
- Instagram Shopping and monetization
- Influencer collaborations
- Analytics and growth tactics

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Create Instagram-optimized content with:
- Visual storytelling elements
- Platform-specific best practices
- Engagement hooks
- Strategic hashtags (mix of popular and niche)
- Optimal posting times
- Community building tactics`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          caption: { type: "string" },
          visual_concept: { type: "string" },
          hashtags: {
            type: "array",
            items: { type: "string" }
          },
          posting_time: { type: "string" },
          engagement_strategy: { type: "string" },
          story_ideas: {
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

export function TikTokAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are a TikTok viral content strategist who masters:
- Short-form video hooks and retention
- Trending sounds and challenges
- For You Page (FYP) algorithm optimization
- Duets and stitches for engagement
- TikTok SEO and discoverability
- Brand voice for Gen Z and Millennials

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Create TikTok content that:
- Hooks viewers in first 1-2 seconds
- Leverages current trends
- Encourages comments and shares
- Builds authentic connection
- Drives profile visits and follows`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          video_concept: { type: "string" },
          hook: { type: "string" },
          script: { type: "string" },
          trending_sounds: {
            type: "array",
            items: { type: "string" }
          },
          caption: { type: "string" },
          hashtags: {
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

export function YouTubeAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are a YouTube growth and optimization expert with knowledge of:
- Video SEO (titles, descriptions, tags)
- Thumbnail design psychology
- Watch time optimization
- YouTube Shorts strategy
- Monetization tactics
- Audience retention techniques
- Community building and engagement

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Create YouTube-optimized content including:
- Compelling titles with SEO keywords
- Thumbnail concepts that drive clicks
- Engaging video scripts with pattern interrupts
- Strategic timestamps
- End screen and card recommendations
- Community post ideas`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" }
          },
          thumbnail_concept: { type: "string" },
          video_script: { type: "string" },
          timestamps: {
            type: "array",
            items: { type: "string" }
          },
          seo_keywords: {
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

export const useSocialMediaAgents = () => {
  const instagramAgent = InstagramAgent();
  const tiktokAgent = TikTokAgent();
  const youtubeAgent = YouTubeAgent();

  return {
    instagramAgent,
    tiktokAgent,
    youtubeAgent
  };
};