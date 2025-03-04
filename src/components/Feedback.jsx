import React, { useState } from 'react';

const ThumbsUpIcon = ({ isSelected }) => (
  <svg
  className={`w-[16px] h-[16px] ${isSelected ? 'text-blue-600' : 'text-gray-800 dark:text-white'}`}
      aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 11c.889-.086 1.416-.543 2.156-1.057a22.323 
      22.323 0 0 0 3.958-5.084 1.6 1.6 0 0 1 .582-.628 
      1.549 1.549 0 0 1 1.466-.087c.205.095.388.233.537.406a1.64
       1.64 0 0 1 .384 1.279l-1.388 4.114M7 11H4v6.5A1.5 1.5 0 0 0 5.5 
       19v0A1.5 1.5 0 0 0 7 17.5V11Zm6.5-1h4.915c.286 0 .372.014.626.15.254.135.472.332.637.572a1.874
        1.874 0 0 1 .215 1.673l-2.098 6.4C17.538 19.52 17.368 20 16.12 20c-2.303 0-4.79-.943-6.67-1.475"
    />
  </svg>
);

const ThumbsDownIcon = ({ isSelected }) => (
    <svg
    className={`w-[16px] h-[16px] ${isSelected ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}
        aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 13c-.889.086-1.416.543-2.156 1.057a22.322 22.322 0 0
       0-3.958 5.084 1.6 1.6 0 0 1-.582.628 1.549 1.549 0 0 1-1.466.087 
       1.587 1.587 0 0 1-.537-.406 1.666 1.666 0 0 1-.384-1.279l1.389-4.114M17 
       13h3V6.5A1.5 1.5 0 0 0 18.5 5v0A1.5 1.5 0 0 0 17 6.5V13Zm-6.5 1H5.585c-.286 
       0-.372-.014-.626-.15a1.797 1.797 0 0 1-.637-.572 1.873 1.873 0 0 1-.215-1.673l2.098-6.4C6.462 
       4.48 6.632 4 7.88 4c2.302 0 4.79.943 6.67 1.475"
    />
  </svg>
);

const CommentIcon = () => (
  <svg
    className="w-6 h-6 text-gray-800 dark:text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 10.5h.01m-4.01 0h.01M8 10.5h.01M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 
      1-1 1h-6.6a1 1 0 0 0-.69.275l-2.866 2.723A.5.5 0 0 1 8 18.635V17a1 1 0 
      0 0-1-1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
    />
  </svg>
);

const Feedback = ({ fdbk_id, sessionId, aplctn_cd, feedback }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isCommentBoxVisible, setIsCommentBoxVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 

  const handleFeedback = async (type) => {
    // Update states based on the feedback type
    if (type === 'like') {
      setIsLiked((prevLiked) => !prevLiked);
      if (!isLiked) {
        setIsDisliked(false);
      }
    } else if (type === 'dislike') {
      setIsDisliked((prevDisliked) => !prevDisliked);
      if (!isDisliked) {
        setIsLiked(false);
      }
    }
    
    

    try {
      const url = `${feedback}`;
      const payload = {
        aplctn_cd: aplctn_cd,
        session_id: sessionId,
        fdbk_id,
        fdbk_actn: type === 'like' ? true : false,
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
        throw new Error('Failed to update feedback status');
      }
      const message = await response.text();
      setSuccessMessage(message);
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim() === '') return;

    const payload = {
      fdbk_id,
      comment: comment.trim(),
    };

    try {
      const url = `${feedback}`;
      const payload = {
        aplctn_cd: aplctn_cd,
        session_id: sessionId,
        fdbk_id,
        comment: comment.trim(),
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
        throw new Error('Failed to submit comment');
      }
      const message = await response.text();
      // Clear the comment box
      setComment('');
      setIsCommentBoxVisible(false);
      setSuccessMessage(message);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleButtonClick = () => {
    setIsCommentBoxVisible(!isCommentBoxVisible);
  };

  return (
    <div className="feedback-container">
      <div className="flex items-center space-x-4">
        <p className="feedback-text font-bold m-0">Was this response helpful?</p>
        <div className="flex items-center space-x-2">
           <button
            onClick={() => handleFeedback('like')}
            className="text-gray-500 hover:text-gray-800"
          >
            <ThumbsUpIcon isSelected={isLiked} />
          </button>
          <button
            onClick={() => handleFeedback('dislike')}
            className="text-gray-500 hover:text-gray-800"
          >
            <ThumbsDownIcon isSelected={isDisliked} />
          </button>
          <button
            onClick={handleButtonClick}
            className="text-gray-500 hover:text-gray-800"
          >
            <CommentIcon />
          </button>
        </div>
      </div>
      {isCommentBoxVisible && (
        <div className="comment-box mt-4">
          <form onSubmit={handleCommentSubmit} className="w-60">
            <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <textarea
                id="comment"
                rows="3"
                className="block p-2 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 
                           focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 
                           dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Your message..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <button
                type="submit"
                className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer 
                           hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  fill="#44b8f3"
                  viewBox="0 0 448 448"
                >
                  <path d="M.213 32L0 181.333 320 224 0 266.667.213 416 448 224z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
        {/* Display success message if present */}
        {successMessage && (
        <div className="text-green-500 mt-2">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Feedback;