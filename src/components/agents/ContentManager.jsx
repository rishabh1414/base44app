import React from 'react';
import { base44 } from '@/api/base44Client';

export default function ContentManager() {
  const execute = async (task, context = {}) => {
    const prompt = `You are the Content Manager - responsible for creating and publishing content.

YOUR SUB-AGENTS:
- Blog Writer: Write blog posts
- LinkedIn Writer: Create LinkedIn content
- Twitter Writer: Craft tweets and threads
- Email Writer: Compose professional emails
- Video Script Writer: Write video scripts

TASK: ${task}

CONTEXT: ${JSON.stringify(context)}

Create high-quality content. Return JSON with:
{
  "content_created": {
    "title": "content title",
    "body": "full content",
    "platform": "target platform",
    "tone": "content tone"
  },
  "seo_keywords": ["list of keywords"],
  "hashtags": ["list of hashtags"],
  "call_to_action": "CTA text",
  "estimated_engagement": "engagement prediction"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          content_created: {
            type: "object",
            properties: {
              title: { type: "string" },
              body: { type: "string" },
              platform: { type: "string" },
              tone: { type: "string" }
            }
          },
          seo_keywords: {
            type: "array",
            items: { type: "string" }
          },
          hashtags: {
            type: "array",
            items: { type: "string" }
          },
          call_to_action: { type: "string" },
          estimated_engagement: { type: "string" }
        }
      }
    });

    return result;
  };

  const addToContentCalendar = async (contentData) => {
    try {
      const calendarEntry = await base44.entities.ContentCalendar.create(contentData);
      return { success: true, entry: calendarEntry };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { execute, addToContentCalendar };
}

export const useContentManager = () => {
  const manager = ContentManager();
  return manager;
};