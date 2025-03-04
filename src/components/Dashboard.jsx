import React, { useState } from "react";
import { AppBar, Toolbar, CssBaseline, Typography, Drawer, Box, Button as MuiButton, useMediaQuery } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserChat from './UserChat';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlinePencilAlt } from "react-icons/hi";

const chatbotImageD = require('../images/chatbot.png'); // Use require for Webpack to process
const userImageD = require('../images/user.png');
const logoD = require('../images/logo.png');
const drawerWidth = 200;

const Dashboard = ({
  logo = logoD,
  themeColor = "#1a3673",
  title = "Chat Assistant",
  newChatButtonLabel = "New Chat",
  onNewChat,
  apiPath,
  sqlUrl,
  aplctn_cd,
  feedback,
  user_id,
  chatInitialMessage = "Hello there, I am your Chat Assistant. How can I help you today?",
  customStyles = {},
  chatbotImage = chatbotImageD,
  suggestedPrompts,
  userImage = userImageD
}) => {
  const isMobile = useMediaQuery("(max-width:950px)");
  const [chatLog, setChatLog] = useState([]);
  const [responseReceived, setResponseReceived] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showInitialView, setShowInitialView] = useState(true);
  const [sessionId, setRequestId] = useState(uuidv4());
  const [showExecuteButton, setShowExecuteButton] = useState(false);
  const [showButton, setShowButton] = useState(false); // New state to show/hide the button


  const handleNewChat = () => {
    setChatLog([]);
    setResponseReceived(false);
    setError('');
    setIsLoading(false);
    setSuccessMessage('');
    setShowInitialView(true);
    setRequestId(uuidv4());
    onNewChat?.(uuidv4());
    setShowExecuteButton(false);
    setShowButton(false);
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: themeColor,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: '100vh', flexDirection: 'column', overflow: 'hidden', ...customStyles.container }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: themeColor,
          boxShadow: "-1px -4px 14px #000",
          height: '64px', ...customStyles.appBar
        }}>
          <Toolbar sx={{ justifyContent: isMobile ? "space-between" : "flex-start" }}>
            {logo && <img src={logo} alt="Logo" style={{ width: 120, ...customStyles.logo }} />}
            <Typography variant="h6" sx={{
              flexGrow: 1,
              textAlign: "center",
              fontWeight: "bold",
              fontSize: isMobile ? "1rem" : "1.5rem",
              marginLeft: '-80px', ...customStyles.title
            }}>
              {title}
            </Typography>
          </Toolbar>
        </AppBar>

        {!isMobile && (
          <Drawer variant="permanent" sx={{
            width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "#fff",
              boxShadow: '-1px -3px 10px grey', ...customStyles.drawer
            }
          }}>
            <Toolbar />
            <Box sx={{ position: "relative", height: "100%", padding: 2, textAlign: 'center' }}>
              <MuiButton
                variant="contained"
                size="large"
                sx={{
                  position: "absolute",
                  bottom: 16,
                  width: "90%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontWeight: "bold",
                  backgroundColor: themeColor, ...customStyles.newChatButton
                }}
                onClick={handleNewChat}
              >
                <HiOutlinePencilAlt />
                {newChatButtonLabel}
              </MuiButton>
            </Box>
          </Drawer>
        )}

        <Box component="main" sx={{
          flexGrow: 1,
          bgcolor: "#fff",
          p: 3,
          height: "100vh",
          overflow: "hidden",
          paddingTop: '64px', ...customStyles.main
        }}>
          <Toolbar />

          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: '100%' }}>
            <UserChat
              chatLog={chatLog}
              setChatLog={setChatLog}
              responseReceived={responseReceived}
              setResponseReceived={setResponseReceived}
              error={error}
              setError={setError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              successMessage={successMessage}
              setSuccessMessage={setSuccessMessage}
              showInitialView={showInitialView}
              setShowInitialView={setShowInitialView}
              themeColor={themeColor}
              sessionId={sessionId}
              setRequestId={setRequestId}
              apiPath={apiPath}
              aplctn_cd={aplctn_cd}
              user_id={user_id}
              customStyles={customStyles.chat}
              chatInitialMessage={chatInitialMessage}
              chatbotImage={chatbotImage}
              userImage={userImage}
              handleNewChat={handleNewChat}
              sqlUrl={sqlUrl}
              feedback={feedback}
              suggestedPrompts={suggestedPrompts}
              showExecuteButton={showExecuteButton}
              setShowExecuteButton={setShowExecuteButton}
              showButton={showButton}
              setShowButton={setShowButton}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
