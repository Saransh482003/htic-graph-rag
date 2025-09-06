import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const startTime = Date.now();
    
    // Path to the backend adapter
    const adapterPath = path.join(process.cwd(), 'utils', 'backend_adapter.py');
    
    // Execute the Python script with the question as argument
    const python = spawn('python', [adapterPath, question], {
      cwd: process.cwd(),
    });

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      try {
        if (code === 0 && output.trim()) {
          // Try to parse the JSON output
          const result = JSON.parse(output.trim());
          
          res.status(200).json({
            answer: result.answer,
            processingTime: parseFloat(processingTime),
            entitiesUsed: result.entitiesUsed || 0,
            success: result.success || true
          });
        } else {
          throw new Error(errorOutput || 'Backend processing failed');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        console.error('Python output:', output);
        console.error('Python error:', errorOutput);
        
        res.status(500).json({
          answer: "I'm having trouble processing your request right now. Please try again later.",
          processingTime: parseFloat(processingTime),
          entitiesUsed: 0,
          success: false,
          error: 'Internal processing error'
        });
      }
    });

    python.on('error', (error) => {
      console.error('Python process error:', error);
      res.status(500).json({
        answer: "I'm experiencing technical difficulties. Please try again later.",
        processingTime: 0,
        entitiesUsed: 0,
        success: false,
        error: 'Python execution error'
      });
    });

    // Handle timeout (45 seconds)
    setTimeout(() => {
      python.kill();
      if (!res.headersSent) {
        res.status(408).json({
          answer: "The request timed out. Please try asking a simpler question or try again later.",
          processingTime: 45,
          entitiesUsed: 0,
          success: false,
          error: 'Request timeout'
        });
      }
    }, 45000);

  } catch (error) {
    console.error('API Error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        answer: "I'm experiencing technical difficulties. Please try again later.",
        processingTime: 0,
        entitiesUsed: 0,
        success: false,
        error: error.message
      });
    }
  }
}