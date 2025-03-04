import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Alert } from 'flowbite-react';
import { FaTelegramPlane } from 'react-icons/fa';
import HashLoader from 'react-spinners/HashLoader';
import ChatMessage from './ChatMessage';
import { Box, Grid, TextField, Button, IconButton, Typography, InputAdornment, Toolbar, useTheme, useMediaQuery, Modal, Backdrop, Fade } from '@mui/material';
import ChartModal from './ChartModal';
import BarChartIcon from '@mui/icons-material/BarChart';
import { format as sqlFormatter } from 'sql-formatter';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import SuggestedPrompts from '../components/SuggestedPrompts';
import Feedback from '../components/Feedback';

hljs.registerLanguage('sql', sql);

function UserChat(props) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const {
    chatLog, setChatLog,
    themeColor,
    responseReceived, setResponseReceived,
    error, setError,
    chatInitialMessage,
    isLoading, setIsLoading,
    successMessage, setSuccessMessage,
    showInitialView, setShowInitialView,
    sessionId, setRequestId, apiPath, user_id, aplctn_cd, sqlUrl, feedback, customStyles = {}, chatbotImage, userImage, handleNewChat, suggestedPrompts, showButton, setShowButton, showExecuteButton, setShowExecuteButton,
  } = props;

  const endOfMessagesRef = useRef(null);
  const [apiResponse, setApiResponse] = useState(null); // New state for storing API response
  const [input, setInput] = useState('');
  const layoutWidth = isSmallScreen ? '100%' : isMediumScreen ? '80%' : '70%';
  const inactivityTimeoutRef = useRef(null); // Ref for the inactivity timeout
  const [sessionActive, setSessionActive] = useState(true); // State to track session activity
  const [openPopup, setOpenPopup] = useState(false);
  const [resId, setResId] = useState(null);
  const INACTIVITY_TIME = 10 * 60 * 1000;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storedResponse, setStoredResponse] = useState(''); // New state to store the response
  const [showResponse, setShowResponse] = useState(false);
  const [data, setData] = useState('');
  const [rawResponse, setRawResponse] = useState('');
  const [promptQuestion, setPromptQuestion] = useState('');
  const [outputExecQuery, setOutputExecQuery] = useState('');


  useLayoutEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog]);

  const handleGraphClick = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };
  // Handle session end due to inactivity
  const handleSessionEnd = () => {
    setSessionActive(false);
    setOpenPopup(true); // Show the popup
  };

  // Start or reset the inactivity timer
  const resetInactivityTimeout = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      handleSessionEnd(); // End session after 30 minutes of inactivity
    }, INACTIVITY_TIME);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    handleMessageSubmit(input);
  }

  function updateChatLogFromApiResponse(apiResponse, currentChatLog) {
    if (apiResponse && apiResponse.response) {  // Check that the response exists
      let content = apiResponse.response;
      // Assume content is already properly formatted for display
      const botMessage = {
        role: 'assistant',
        content: content
      };
      setChatLog([...currentChatLog, botMessage]); // Update the chat log
    }
  }


  const handleInputFocusOrChange = () => {
    setShowInitialView(false);
    resetInactivityTimeout();
  };

  useEffect(() => {
    resetInactivityTimeout();
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  const handleMessageSubmit = async (messageContent, fromPrompt = false) => {
    if (!messageContent.trim()) return;
    if (!aplctn_cd.trim() || !sessionId.trim()) {
      setError('Please provide valid app_cd and request_id.');
      return;
    }

    const newMessage = {
      role: 'user',
      content: messageContent,
    };

    const newChatLog = [...chatLog, newMessage];
    // Preprocess newChatLog to ensure all entries are correctly formatted
    const preparedChatLog = newChatLog.map(message => {
      if (typeof message.content === 'object') {
        return { ...message, content: JSON.stringify(message.content) };
      }
      return message;
    });

    setChatLog(newChatLog);
    setInput(''); // Clear the input field
    setResponseReceived(false)// Set loading state to true
    setIsLoading(true); // Set loading state
    setError(''); // Clear any previous error
    setShowInitialView(false);
    setShowResponse(false);
    setShowExecuteButton(false);
    try {
      const url = `${apiPath}`;
      const payload = {
        aplctn_cd: aplctn_cd,
        session_id: sessionId,
        user_id: user_id,
        prompt: preparedChatLog
      };
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) {
        let errorMessage = '';
        if (response.status === 404) {
          errorMessage = '404 - Not Found';
        } else if (response.status === 500) {
          errorMessage = '500 - Internal Server Error';
        } else {
          errorMessage = `${response.status} - ${response.statusText}`;
        }
        const botMessage = {
          role: 'assistant',
          content: (
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>{errorMessage}</p>
            </div>
          ),
        };
        setChatLog([...newChatLog, botMessage]); // Update chat log with assistant's error message
        throw new Error(errorMessage); // Re-throw the error for logging purposes
      }
      const json = await response.json();
      const data = json.modelreply;
      setApiResponse(data);
      const newResId = data.fdbk_id; // Assuming fdbk_id is part of the response
      setResId(newResId);
      const promptQuestion = data.prompt;
      setPromptQuestion(promptQuestion);
      setResponseReceived(false);
      updateChatLogFromApiResponse(data, newChatLog);
      const convertToString = (input) => {
        if (typeof input === 'string') {
          return input;
        } else if (Array.isArray(input)) {
          return input.map(convertToString).join(', ');
        } else if (typeof input === 'object' && input !== null) {
          return Object.entries(input)
            .map(([key, value]) => `${key}: ${convertToString(value)}`)
            .join(', ');
        }
        return String(input);
      };
      let modelReply = 'No valid reply found.'; // Default message
      if (!data.response) {
        const defaultReply = json.modelreply || 'Internal server error.';
        const botMessage = { role: 'assistant', content: defaultReply };
        setChatLog([...newChatLog, botMessage]);
      } else {
        // Handling object with nested objects scenario
        if (typeof data.response === 'object' && !Array.isArray(data.response) && Object.keys(data.response).length > 0) {
          // Generate table from nested object data
          const keys = Object.keys(data.response);
          const columns = Object.keys(data.response[keys[0]]); // assuming uniform structure
          const rows = columns.map(column => ({
            column,
            values: keys.map(key => data.response[key][column])
          }));

          modelReply = (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>{columns.map(column => <th key={column} style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{column}</th>)}</tr>
                </thead>
                <tbody>
                  {keys.map((key, rowIndex) => (
                    <tr key={key}>
                      {columns.map(column => (
                        <td key={column} style={{ border: '1px solid black', padding: '8px' }}>{convertToString(data.response[key][column])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        } else if (Array.isArray(data.response) && data.response.every(item => typeof item === 'object')) {
          // Handling array of objects scenario
          const columnCount = Object.keys(data.response[0]).length;
          const rowCount = data.response.length;
          const columns = Object.keys(data.modelreply.response[0]);
          const rows = data.modelreply.response;

          modelReply = (
            <div style={{ display: 'flex', alignItems: 'start' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    {columns.map(column => (
                      <th key={column} style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map(column => (
                        <td key={`${rowIndex}-${column}`} style={{ border: '1px solid black', padding: '8px' }}>
                          {convertToString(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(rowCount > 1 && columnCount > 1) && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BarChartIcon />}
                  sx={{ display: 'flex', alignItems: 'center', padding: '8px 16px', marginLeft: '15px', width: '190px', fontSize: '10px', fontWeight: 'bold' }}
                  onClick={handleGraphClick}
                >
                  Graph View
                </Button>
              )}
            </div>
          );
        } else if (typeof data.response === 'string') {
          const sqlRegex = /```sql([\s\S]*?)```/g; // Regex to detect SQL blocks in markdown format
          const sqlKeywordRegex = /SELECT|FROM|WHERE|JOIN|INSERT|UPDATE|DELETE/i; // Regex to detect SQL keywords outside of blocks
          const parts = [];
          let lastIndex = 0;
          let match;
          let containsSQL = false; // Flag to track SQL content

          while ((match = sqlRegex.exec(data.response)) !== null) {
            containsSQL = true; // Set flag if SQL is detected in the block
            if (match.index > lastIndex) {
              parts.push(
                <p key={`text-${lastIndex}`} style={{ margin: "8px 0" }}>
                  {data.response.slice(lastIndex, match.index).trim()}
                </p>
              );
            }
            const sqlContent = match[1].trim();
            try {
              parts.push(
                <pre key={`sql-${match.index}`} style={{ margin: '8px 0' }}>
                  <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {sqlFormatter(sqlContent)}
                  </code>
                </pre>
              );
            
            } catch (err) {
              console.error("SQL Formatting Error:", err);
              parts.push(
                <pre key={`sql-${match.index}`} style={{ margin: '8px 0', color: 'red' }}>
                  {sqlContent}
                </pre>
              );
            }
            lastIndex = sqlRegex.lastIndex;
          }
          if (lastIndex < data.response.length) {
            const remainingContent = data.response.slice(lastIndex).trim();
            if (sqlKeywordRegex.test(remainingContent)) {
              containsSQL = true; // Set flag if SQL keywords are detected in remaining content
              parts.push(
                <pre key={`sql-remaining`} style={{ margin: '8px 0' }}>
                  <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {sqlFormatter(remainingContent)}
                  </code>
                </pre>
              );
            } else {
              parts.push(
                <p key={`text-${lastIndex}`} style={{ margin: "8px 0" }}>
                  {remainingContent}
                </p>
              );
            }
          }

          modelReply = (
            <div style={{ overflow: "auto", maxWidth: "100%", padding: "10px" }}>
              {parts}
            </div>
          );

          const raw = data.response;
          setRawResponse(raw);
          setStoredResponse(modelReply);

          // Set button visibility based on the presence of SQL
          // setShowButton(containsSQL);
          setShowExecuteButton(containsSQL);
        } else {
          modelReply = convertToString(data.response);
          const botMessage = { role: 'assistant', content: modelReply };
          console.log(botMessage);
          setChatLog([...newChatLog, botMessage]);
        }
      }
    } catch (err) {
      let fallbackErrorMessage = 'Error communicating with backend.';
      const errorMessage = {
        role: 'assistant',
        content: (
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>{fallbackErrorMessage}</p>
          </div>
        ),
      };
      setChatLog([...newChatLog, errorMessage]);
      setError('Error communicating with backend');
      console.error('Error:', err);
    } finally {
      setIsLoading(false); // Set loading state to false
      setResponseReceived(true);// Set loading state to false
    }
  };

  const handlePromptClick = async (prompt) => {
    handleMessageSubmit(prompt, true);
  };

  const handleButtonClick = async () => {
    try {
      const url = `${sqlUrl}`;
      const payload = {
        aplctn_cd: aplctn_cd,
        session_id: sessionId,
        user_id: user_id,
        exec_query: rawResponse,
        prompt: promptQuestion
      };
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      // Check if response is okay
      if (!response.ok) {
        let errorMessage = '';
        // Handle different status codes
        if (response.status === 404) {
          errorMessage = '404 - Not Found';
        } else if (response.status === 500) {
          errorMessage = '500 - Internal Server Error';
        } else {
          errorMessage = `${response.status} - ${response.statusText}`;
        }

        // Create an error message object
        const errorMessageContent = {
          role: 'assistant',
          content: (
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>{errorMessage}</p>
            </div>
          ),
        };

        setChatLog((prevChatLog) => [...prevChatLog, errorMessageContent]);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setData(data.modelreply.response);
      setOutputExecQuery(data);

      const convertToString = (input) => {
        if (typeof input === 'string') {
          return input;
        } else if (Array.isArray(input)) {
          return input.map(convertToString).join(', ');
        } else if (typeof input === 'object' && input !== null) {
          return Object.entries(input)
            .map(([key, value]) => `${key}: ${convertToString(value)}`)
            .join(', ');
        }
        return String(input);
      };

      let modelReply = 'No valid reply found.'; // Default message

      if (data && data.modelreply && Array.isArray(data.modelreply.response) && data.modelreply.response.length > 0) {
        const columns = Object.keys(data.modelreply.response[0]);
        const rows = data.modelreply.response;


        modelReply = (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {columns.map(column => (
                    <th key={column} style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map(column => (
                      <td key={`${rowIndex}-${column}`} style={{ border: '1px solid black', padding: '8px' }}>
                        {convertToString(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(rows.length > 1 && columns.length > 1) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<BarChartIcon />}
                sx={{ marginTop: '15px', fontSize: '0.875rem', fontWeight: 'bold' }}
                onClick={() => handleGraphClick()}
              >
                Graph View
              </Button>
            )}
          </div>
        );
      } else if (typeof data === 'string') {
        modelReply = data.modelreply.response;
        setIsLoading(true);
      } else {
        modelReply = convertToString(data.modelreply.response);
      }

      const botMessage = {
        role: 'assistant',
        content: modelReply,
      };

      setChatLog((prevChatLog) => [...prevChatLog, botMessage]); // Update chat log with assistant's message
      await apiCortexComplete(data, promptQuestion, setChatLog);

    } catch (err) {
      // Handle network errors or other unexpected issues
      const fallbackErrorMessage = 'Error communicating with backend.';
      const errorMessageContent = {
        role: 'assistant',
        content: (
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>{fallbackErrorMessage}</p>
          </div>
        ),
      };

      setChatLog((prevChatLog) => [...prevChatLog, errorMessageContent]); // Update chat log with assistant's error message
      console.error('Error:', err); // Log the error for debugging
    } finally {
      setIsLoading(false);// Set loading state to false
      setShowExecuteButton(false);
      // setShowButton(false);
    }
  }

  const apiCortexComplete = async (execData, promptQuestion, setChatLog) => {
    const url = "http://10.126.192.122:8880/api/cortex/complete/";
    const payload = {
      aplctn_cd: aplctn_cd,
      session_id: sessionId,
      user_id: user_id,
      output_exec_query: execData,
      prompt: promptQuestion
    };
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );
    if (response.ok) {
      const responseData = await response.json();
      const modelReply = responseData.modelreply.response;
      const botMessage = {
        role: 'assistant',
        content: modelReply
      };
      setChatLog(prevChatLog => [...prevChatLog, botMessage]);
    } else {
      console.error('Failed to complete API request:', error);
      const errorBotMessage = {
        role: 'assistant',
        content: 'An error occurred while processing your request.'
      };
      setChatLog(prevChatLog => [...prevChatLog, errorBotMessage]);
    }
  }

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: layoutWidth,
      flexDirection: 'column',
      margin: 'auto', ...customStyles.container
    }}>

      {showInitialView && (
        <>
          <div
            style={{
              width: '40px',
              height: 'auto',
              overflow: 'hidden',
              marginRight: 2,
            }}
          >
            <img
              src={chatbotImage}
              alt="Chatbot"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>
          <Box
            component="p"
            sx={{
              marginTop: '10px',
              fontSize: '16.5px',
              fontWeight: 600,
              color: themeColor,
              textAlign: 'center',
              marginBottom: '19%',
              ...customStyles.initialPrompt
            }}
          >
            {chatInitialMessage}

          </Box>

        </>
      )}

      <Box sx={{
        flex: 1,
        width: '100%',
        overflowY: 'auto',
        maxHeight: '73vh',
        padding: '10px', ...customStyles.chatContainer
      }}>
        <ChatMessage chatLog={chatLog} chatbotImage={chatbotImage} userImage={userImage} storedResponse={storedResponse} />
        <div ref={endOfMessagesRef} />
        {showExecuteButton && (
          <Button variant="contained" color="primary" onClick={handleButtonClick}>
            Execute SQL
          </Button>
        )}
        {isLoading && <HashLoader color={themeColor} size={30} aria-label="Loading Spinner" data-testid="loader" />}
        {responseReceived &&
          <Feedback
            fdbk_id={resId}
            feedback={feedback}
            sessionId={sessionId}
            aplctn_cd={aplctn_cd} />}
        {successMessage && <Alert color="success"><span>{successMessage}</span></Alert>}
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '100%',
        flexDirection: 'column', ...customStyles.inputContainer
      }}>
        <Grid container spacing={2} sx={{ width: '100%', maxWidth: '100%', position: 'fixed', bottom: '50px', left: '67%', transform: 'translateX(-50%)', width: '70%', marginLeft: '8px', flexDirection: 'column' }}>
          {showInitialView && (
            <Grid item xs={12} sm={6}>
              <SuggestedPrompts
                prompts={suggestedPrompts}
                onPromptClick={handlePromptClick}
                sx={{
                  mb: isSmallScreen || isMediumScreen ? '32px' : '24px',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <form onSubmit={handleSubmit} style={{ width: '100%', backgroundColor: '#fff', boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)', ...customStyles.form }}>
              <TextField
                fullWidth
                placeholder="What can I help you with..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleInputFocusOrChange(); // Ensure elements disappear when typing
                }}

                onFocus={handleInputFocusOrChange}
                inputProps={{ maxLength: 400 }}
                InputProps={{
                  sx: {
                    '& .MuiInputBase-input': {
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: themeColor,
                    },
                    '& .MuiInputAdornment-root button': {
                      color: themeColor,
                    },
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit">
                        <FaTelegramPlane className="h-6 w-6" color={themeColor} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </form>

          </Grid>
        </Grid>
      </Box>

      <ChartModal
        visible={isModalVisible}
        onClose={handleModalClose}
        chartData={data || []}  // Ensure you pass valid JSON data
      />
      <Modal open={openPopup}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            setOpenPopup(false);
          }
        }}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}>
        <Fade in={openPopup}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Session Ended</Typography>
            <Typography sx={{ mt: 2 }}>Your session has ended due to 10 minutes of inactivity.</Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
              {/* New Chat Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOpenPopup(false);
                  handleNewChat();
                }}
              >
                New Chat
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenPopup(false);
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default UserChat;
