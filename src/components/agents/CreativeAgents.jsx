import React from 'react';
import { base44 } from '@/api/base44Client';

export function GraphicDesignAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are an expert graphic designer with mastery in:
- Visual hierarchy and composition
- Color theory and psychology
- Typography and readability
- Brand consistency
- Design trends and styles
- Platform-specific specifications
- Conversion-focused design

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Provide comprehensive design specifications including:
- Design concept and rationale
- Color palette with hex codes
- Typography recommendations
- Layout structure
- Visual elements needed
- Technical specifications
- Brand alignment notes`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          design_concept: { type: "string" },
          color_palette: {
            type: "array",
            items: { type: "string" }
          },
          typography: {
            type: "object",
            properties: {
              primary_font: { type: "string" },
              secondary_font: { type: "string" },
              sizes: { type: "object" }
            }
          },
          layout_description: { type: "string" },
          visual_elements: {
            type: "array",
            items: { type: "string" }
          },
          specifications: {
            type: "object",
            properties: {
              dimensions: { type: "string" },
              format: { type: "string" },
              resolution: { type: "string" }
            }
          },
          image_prompt: { type: "string" }
        }
      }
    });

    return result;
  };

  const generateImage = async (designSpec) => {
    try {
      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: designSpec.image_prompt || designSpec.design_concept
      });

      return {
        success: true,
        image_url: imageResult.url,
        design_spec: designSpec
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        design_spec: designSpec
      };
    }
  };

  return { execute, generateImage };
}

export function VideoScriptAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are a video script specialist who creates engaging video content for:
- YouTube videos and Shorts
- TikTok and Instagram Reels
- Advertising and promotional videos
- Educational and tutorial content
- Explainer videos
- Social media stories

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Create video script with:
- Attention-grabbing hook (first 3-5 seconds)
- Clear structure (intro, body, conclusion)
- Visual cue descriptions
- Timing notes
- Call-to-action
- Music/sound suggestions
- Text overlay recommendations`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          hook: { type: "string" },
          script: { type: "string" },
          visual_cues: {
            type: "array",
            items: { type: "string" }
          },
          duration: { type: "string" },
          music_style: { type: "string" },
          text_overlays: {
            type: "array",
            items: { type: "string" }
          },
          call_to_action: { type: "string" }
        }
      }
    });

    return result;
  };

  return { execute };
}

export function PresentationAgent() {
  const execute = async (task, context = {}) => {
    const prompt = `You are a presentation design expert specializing in:
- Compelling storytelling
- Data visualization
- Slide design principles
- Persuasive structure
- Audience engagement
- Professional templates

TASK: ${task}
CONTEXT: ${JSON.stringify(context)}

Create presentation outline with:
- Clear narrative arc
- Slide-by-slide breakdown
- Visual suggestions for each slide
- Key talking points
- Data visualization recommendations
- Design notes`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          presentation_title: { type: "string" },
          target_audience: { type: "string" },
          key_message: { type: "string" },
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                slide_number: { type: "number" },
                title: { type: "string" },
                content: { type: "string" },
                visual_concept: { type: "string" },
                talking_points: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          design_theme: { type: "string" },
          color_scheme: {
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

export const useCreativeAgents = () => {
  const designAgent = GraphicDesignAgent();
  const videoAgent = VideoScriptAgent();
  const presentationAgent = PresentationAgent();

  return {
    designAgent,
    videoAgent,
    presentationAgent
  };
};