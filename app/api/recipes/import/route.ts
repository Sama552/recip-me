import Anthropic from '@anthropic-ai/sdk'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Initialize Anthropic client
const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Define the expected schema
const RecipeSchema = z.object({
	title: z.string(),
	description: z.string().nullable(),
	prep_time: z.number().nullable(),
	cook_time: z.number().nullable(),
	servings: z.number().nullable(),
	ingredients: z.array(
		z.object({
			amount: z.number().nullable(),
			unit: z.string().nullable(),
			name: z.string(),
			notes: z.string().nullable(),
		})
	),
	instructions: z.array(
		z.object({
			step_number: z.number(),
			description: z.string(),
		})
	),
	suggested_tags: z.array(z.string()).optional(),
	notes: z.object({
		tips: z.array(z.string()),
		substitutions: z.array(z.string()),
		storage: z.array(z.string()),
		technique: z.array(z.string()),
	}),
	source_url: z.string().optional().nullable(),
	source_type: z.string().optional().nullable(),
})

async function extractContent(url: string) {
	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
			},
		})
		const html = await response.text()

		// Readability
		const dom = new JSDOM(html)
		const reader = new Readability(dom.window.document)
		const article = reader.parse()

		return {
			content: article?.content || '',
			type: 'article',
		}
	} catch (error) {
		console.error('Content extraction error:', error)
		throw new Error('Failed to extract recipe content')
	}
}

const CLAUDE_PROMPT = `You are a recipe parsing assistant. Your task is to extract recipe information and return it in a specific JSON format.

IMPORTANT: You must return ONLY valid JSON. Do not include any explanations, metadata, or additional text.
The JSON must exactly match this TypeScript type:

type Recipe = {
	title: string;
	description: string | null;
	prep_time: number | null;  // in minutes
	cook_time: number | null;  // in minutes
	servings: number | null;
	ingredients: {
		amount: number | null;
		unit: string | null;
		name: string;
		notes: string | null;
	}[];
	instructions: {
		step_number: number;
		description: string;
	}[];
	suggested_tags: string[];
	notes: {
		tips: string[];
		substitutions: string[];
		storage: string[];
		technique: string[];
	};
}

Rules:
1. ALL string values must be properly escaped
2. ALL numbers must be valid numbers (not strings)
3. Use null for missing values, not undefined or empty strings
4. Arrays must be properly terminated
5. All property names must be exactly as shown
6. Do not add any additional properties
7. Do not include any comments or explanations in the JSON

Content to parse:
{content}

Content type: {type}

Return ONLY the JSON object matching the specified type.`

// Function to clean and validate JSON from Claude
function cleanAndValidateJSON(text: string) {
	try {
		// Remove any markdown code block syntax
		text = text.replace(/```json\n?|\n?```/g, '')

		// Remove any explanatory text before or after the JSON
		text = text
			.trim()
			.replace(/^[^{]*/, '')
			.replace(/[^}]*$/, '')

		// Parse the JSON to validate it
		const parsed = JSON.parse(text)
		console.log('parsed', parsed)

		// Validate against our schema
		const validated = RecipeSchema.parse(parsed)

		return validated
	} catch (error) {
		console.error('JSON validation error:', error)
		throw new Error('Failed to parse recipe data')
	}
}

export async function POST(request: Request) {
	try {
		const { url } = await request.json()

		// Validate URL
		new URL(url)

		// Extract content
		const { content, type } = await extractContent(url)

		// Process with Claude
		const completion = await anthropic.messages.create({
			model: 'claude-3-5-sonnet-20241022',
			max_tokens: 4096,
			temperature: 0.2, // Reduced temperature for more consistent output
			messages: [
				{
					role: 'user',
					content: CLAUDE_PROMPT.replace('{content}', content).replace('{type}', type),
				},
			],
		})

		// Clean and validate the response
		// @ts-ignore
		const parsedRecipe = cleanAndValidateJSON(completion.content[0].text)

		// Add source information
		parsedRecipe.source_url = url
		parsedRecipe.source_type = 'import'

		return NextResponse.json(parsedRecipe)
	} catch (error) {
		console.error('Recipe import error:', error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Failed to import recipe',
				details: error instanceof Error ? error.stack : undefined,
			},
			{ status: 500 }
		)
	}
}
