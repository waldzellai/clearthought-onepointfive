<!-- srcbook:{"language":"typescript"} -->

# Prompting Claude for "JSON Mode"

Claude doesn't have a formal "JSON Mode" with constrained sampling. But not to worry -- you can still get reliable JSON from Claude! This Srcbook will show you how.

###### package.json

```json
{
  "type": "module",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.12.1",
    "dotenv": "^16.3.1"
  }
}
```

## Setting up the environment

First, let's set up the client and import the necessary modules.

###### setup.ts

```typescript
import { Anthropic } from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { inspect } from 'util';

// Load environment variables
dotenv.config();

// Initialize the client
export const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export const MODEL_NAME = "claude-3-opus-20240229";

// Pretty print objects
export function prettyPrint(obj: any) {
  console.log(inspect(obj, { depth: null, colors: true }));
}
```

## Default behavior

Let's look at Claude's default behavior when asked for JSON.

###### default-behavior.ts

```typescript
import { client, MODEL_NAME } from './setup.ts';

async function defaultJsonBehavior() {
  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 1024,
    messages: [
      {
        role: "user", 
        content: "Give me a JSON dict with names of famous athletes & their sports."
      }
    ]
  });
  
  const message = response.content[0].text;
  console.log(message);
  
  return message;
}

await defaultJsonBehavior();
```

Claude followed instructions and outputted a nice dictionary, which we can extract with code:

###### extract-json.ts

```typescript
import { prettyPrint } from './setup.ts';

function extractJson(response: string): any {
  const jsonStart = response.indexOf("{");
  const jsonEnd = response.lastIndexOf("}");
  return JSON.parse(response.substring(jsonStart, jsonEnd + 1));
}

// We'll simulate having the response from the previous call
const sampleResponse = `Here is a JSON dictionary with names of famous athletes and their respective sports:

{
  "athletes": [
    {
      "name": "Usain Bolt",
      "sport": "Track and Field"
    },
    {
      "name": "Michael Phelps",
      "sport": "Swimming"
    },
    {
      "name": "Serena Williams",
      "sport": "Tennis"
    },
    {
      "name": "LeBron James",
      "sport": "Basketball"
    },
    {
      "name": "Lionel Messi",
      "sport": "Soccer"
    }
  ]
}`;

const extractedJson = extractJson(sampleResponse);
prettyPrint(extractedJson);
```

## Skipping the preamble

But what if we want Claude to skip the preamble and go straight to the JSON? One simple way is to prefill Claude's response and include a "{" character.

###### prefill-example.ts

```typescript
import { client, MODEL_NAME } from './setup.ts';

async function prefillJsonExample() {
  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 1024,
    messages: [
      {
        role: "user", 
        content: "Give me a JSON dict with names of famous athletes & their sports."
      },
      {
        role: "assistant",
        content: "Here is the JSON requested:\n{"
      }
    ]
  });
  
  const message = response.content[0].text;
  console.log(message);
  
  // Add back the "{" that we prefilled to extract the JSON
  const completeJson = "{" + message.substring(0, message.lastIndexOf("}") + 1);
  const outputJson = JSON.parse(completeJson);
  
  console.log("\nExtracted JSON object:");
  prettyPrint(outputJson);
  
  return outputJson;
}

await prefillJsonExample();
```

## Using tags for multiple JSON outputs

For very long and complicated prompts, which contain multiple JSON outputs so that a string search for "{" and "}" don't do the trick, you can also have Claude output each JSON item in specified tags for future extraction.

###### tagged-json-outputs.ts

```typescript
import { client, MODEL_NAME, prettyPrint } from './setup.ts';

async function taggedJsonOutputs() {
  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 1024,
    messages: [
      {
        role: "user", 
        content: `Give me a JSON dict with the names of 5 famous athletes & their sports.
Put this dictionary in <athlete_sports> tags. 

Then, for each athlete, output an additional JSON dictionary. In each of these additional dictionaries:
- Include two keys: the athlete's first name and last name.
- For the values, list three words that start with the same letter as that name.
Put each of these additional dictionaries in separate <athlete_name> tags.`
      },
      {
        role: "assistant",
        content: "Here is the JSON requested:"
      }
    ]
  });
  
  const message = response.content[0].text;
  console.log(message);
  
  // Extract JSON between tags
  function extractBetweenTags(tag: string, string: string, strip: boolean = false): string[] {
    const regex = new RegExp(`<${tag}>(.+?)</${tag}>`, 'gs');
    const matches = string.match(regex) || [];
    
    return matches.map(match => {
      const content = match.substring(tag.length + 2, match.length - tag.length - 3);
      return strip ? content.trim() : content;
    });
  }
  
  // Extract and parse the athlete sports dictionary
  const athleteSportsJson = extractBetweenTags("athlete_sports", message)[0];
  const athleteSportsDict = JSON.parse(athleteSportsJson);
  
  // Extract and parse the individual athlete name dictionaries
  const athleteNameJsons = extractBetweenTags("athlete_name", message);
  const athleteNameDicts = athleteNameJsons.map(json => JSON.parse(json));
  
  console.log("\nExtracted athlete sports dictionary:");
  prettyPrint(athleteSportsDict);
  
  console.log("\nExtracted athlete name dictionaries:");
  prettyPrint(athleteNameDicts);
  
  return { athleteSportsDict, athleteNameDicts };
}

await taggedJsonOutputs();
```

## Using structured output with custom types

TypeScript's type system gives us an advantage for handling structured outputs. Let's define types for our expected JSON structure and use them to ensure type safety:

###### typed-json-output.ts

```typescript
import { client, MODEL_NAME } from './setup.ts';

// Define the expected response types
interface Athlete {
  name: string;
  sport: string;
}

interface AthleteResponse {
  athletes: Athlete[];
}

async function typedJsonOutput() {
  const response = await client.messages.create({
    model: MODEL_NAME,
    max_tokens: 1024,
    messages: [
      {
        role: "user", 
        content: `Return exactly this JSON structure without any explanatory text:
{
  "athletes": [
    { "name": "Athlete Name", "sport": "Sport Name" },
    ...more athletes
  ]
}

Include 5 famous athletes from different sports.`
      }
    ]
  });
  
  const message = response.content[0].text || '';
  
  try {
    // Extract and parse the JSON from the response
    const jsonStart = message.indexOf("{");
    const jsonEnd = message.lastIndexOf("}");
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Could not find JSON in response");
    }
    
    const jsonString = message.substring(jsonStart, jsonEnd + 1);
    const parsedJson = JSON.parse(jsonString) as AthleteResponse;
    
    // Validate the structure matches our expected type
    if (!parsedJson.athletes || !Array.isArray(parsedJson.athletes)) {
      throw new Error("Invalid JSON structure: missing athletes array");
    }
    
    console.log("Extracted and validated JSON:");
    console.log(JSON.stringify(parsedJson, null, 2));
    
    // Use the typed data
    console.log("\nAthletes and their sports:");
    parsedJson.athletes.forEach(athlete => {
      console.log(`${athlete.name}: ${athlete.sport}`);
    });
    
    return parsedJson;
  } catch (error) {
    console.error("Error processing JSON response:", error);
    console.log("Original response:", message);
    throw error;
  }
}

await typedJsonOutput();
```

## Recap

To recap the strategies for getting clean JSON from Claude:

1. **Simple extraction**: Use string parsing to extract JSON between curly braces.
2. **Prefilled response**: Remove preambles by providing a partial Assistant message with an opening brace.
3. **Tagged output**: Instruct Claude to place JSON inside specific XML-like tags for complex responses.
4. **Type validation**: Use TypeScript's type system to ensure the parsed JSON has the expected structure.

Each approach has its advantages depending on your specific use case:

- Simple extraction works for basic responses
- Prefilling helps create cleaner output but limits Claude's ability to think through the problem
- Tagged output works well for multiple JSON sections in a single response
- Type validation adds an extra layer of safety when processing the JSON