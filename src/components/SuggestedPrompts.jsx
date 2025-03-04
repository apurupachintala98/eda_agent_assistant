import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SuggestedPrompts = ({ prompts, onPromptClick }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Title for Suggested Prompts */}
      <Typography
        variant="h6"
        sx={{ fontSize: '16px', fontWeight: 'bold', color: '#1a3673', textAlign: 'left', ml: 1 }}
      >
        Suggested Prompts
      </Typography>

      {/* List of Prompts */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left' }}>
        {prompts.map((prompt, index) => (
          <Paper
            key={index}
            sx={{
              padding: '10px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              color: '#1a3673',
              boxShadow: '1.7px 1.4px 5.4px hsl(0deg 0% 0% / 0.2)',
              '&:hover': { backgroundColor: '#e2e6ea' },
              '&:active': { backgroundColor: '#dae0e5' },
            }}
            onClick={() => onPromptClick(prompt)}
          >
            <Typography variant="body2" sx={{ fontSize: '14.5px', fontWeight: 'bold' }}>
              {prompt}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default SuggestedPrompts;
