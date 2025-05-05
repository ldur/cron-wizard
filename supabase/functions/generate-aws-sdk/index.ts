
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const { targetType, targetConfig, jobName } = await req.json();

    console.log('Generating AWS SDK Python script for this Eventbridge Scheduler Target:', { targetType, jobName });
    console.log('Target config:', targetConfig);

    const systemPrompt = `
      You are an AWS SDK Python script generator. Convert the provided AWS resource configuration into a well-formatted 
      Python script that uses boto3 AWS SDK to create and set up the resource. Include all necessary parameters based on the configuration.
      Format the output as a valid Python script with comments explaining each function.
      Include error handling where appropriate. Make the script reusable, with variables for key parameters at the top.
      The script should follow AWS best practices and be ready to run as an AWS Lambda function with minimal modification.
    `;

    const userPrompt = `
      I need Python code using boto3 AWS SDK to create a ${targetType} resource with these configurations:
      
      Resource name: ${jobName}
      Resource type: ${targetType}
      Configuration: ${JSON.stringify(targetConfig, null, 2)}
      
      Please generate a complete Python script with boto3 that will create this resource.
      Format the output as a Lambda function that can be deployed directly to AWS Lambda.
      Include proper error handling, logging, and environment variable usage for sensitive data.
    `;

    // Make request to OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Lower temperature for more deterministic, focused output
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await openAIResponse.json();
    const generatedScript = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ script: generatedScript }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  } catch (error) {
    console.error('Error in generate-aws-sdk function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString() 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
