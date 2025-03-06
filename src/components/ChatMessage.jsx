import React, { useEffect, useState } from 'react';
import { Avatar, Box, Typography, Paper } from '@mui/material';
import chatbot from '../images/chatbot.png';
import user from '../images/user.png';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github.css';

hljs.registerLanguage('sql', sql);

const ChatMessage = ({ chatLog, chatbotImage, userImage }) => {
  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
  }, [chatLog]);

  // const parseText = (text) => {
  //   const urlRegex = /(\bhttps?:\/\/\S+\b)/g; // Regex to detect URLs
  //   return text.split(/(\*\*.*?\*\*)/g).flatMap((part, index) => {
  //     if (part.match(/^\*\*.*\*\*$/)) {
  //       // Bold text marked by double asterisks
  //       return [<b key={index}>{part.replace(/\*\*/g, '')}</b>];
  //     }
  //     if (urlRegex.test(part)) {
  //       // Splitting and linking URLs
  //       return part.split(urlRegex).map((subpart, subIndex) => (
  //         urlRegex.test(subpart) ?
  //           <a key={`${index}-${subIndex}`} href={subpart} target="_blank" rel="noopener noreferrer">{subpart}</a> :
  //           subpart
  //       ));
  //     }
  //     return part;
  //   });
  // };


  return (
    <Box sx={{ width: '100%', padding: '10px 0' }}>
      {chatLog.map((chat, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: chat.role === 'assistant' ? 'flex-start' : 'flex-end',
            marginBottom: '10px',
          }}
        >
          <Paper
            elevation={2}
            sx={{
              backgroundColor: chat.role === 'assistant' ? '#fff' : '#e0f7fa',
              padding: '12px',
              borderRadius: '15px',
              maxWidth: '80%',
              width: 'fit-content',
              boxShadow: '0px 0px 7px #898080',
              color: '#1a3673',
              overflow: 'auto', 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {chat.role === 'assistant' ? (
                <>
                  <img
                    src={chatbotImage}
                    alt="Chatbot"
                    style={{ width: 32, height: 32, borderRadius: '50%', marginRight: '8px' }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: 14, fontWeight: 'bold', whiteSpace: 'pre-line' }}
                  >
                    {chat.type === "sql" ? (
                      <pre><code className="sql">{chat.content}</code></pre>
                    ) : (
                      chat.content
                    )}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: 14, fontWeight: 'bold', whiteSpace: 'pre-line' }}
                  > {chat.content}
                  </Typography>
                  <img
                    src={userImage}
                    alt="User"
                    style={{ width: 32, height: 32, borderRadius: '50%', marginLeft: '8px' }}
                  />
                </>
              )}
            </Box>

          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ChatMessage;