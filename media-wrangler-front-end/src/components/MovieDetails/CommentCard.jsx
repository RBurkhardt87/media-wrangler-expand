import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, CardActions, TextField, CardContent, Divider } from '@mui/material';
import { useAuth } from '../../Services/AuthContext';
import AvatarHeader from '../Profile/AvatarHeader';
import '../../stylings/MovieDetailsPage.css';
import { updateComment, deleteComment } from '../../Services/CommentService';
import { useNavigate } from 'react-router-dom';
import { submitUserReply, fetchRepliesByCommentId } from '../../Services/ReplyService';
import ReplyCard from './ReplyCard';
import PropTypes from 'prop-types';


const CommentCard = ({ comment, onUpdate, showButtonTrigger }) => {
    const [showUserButtons, setShowUserButtons] = useState(false);
    const [showReplyButton, setReplyButton] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.userComment); 
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [userReply, setUserReply] =  useState("");
    const [userReplies, setUserReplies] = useState([]);
    const [showReplies, setShowReplies] = useState(false);
    const [error, setError] = useState('');
    const [refreshReply, setRefreshReply] = useState(false);
    const [showButtonsTrigger, setShowButtonsTrigger] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();
    

    useEffect(() => {
        if (user.id === comment.userId) {
            setShowUserButtons(true);
        } else {
            setReplyButton(true);
        }
    }, [user, comment.userId, comment.userComment, showButtonTrigger]);

    const commentId = comment.id;

    useEffect(() => {
        async function fetchReplies() {
          const data = await fetchRepliesByCommentId(commentId);  
          setUserReplies(data);  
        }
      
        fetchReplies();
      }, [commentId, refreshReply]);  


    const handleReplyUpdate = () => {
    setRefreshReply(prev => !prev); 
    setShowButtonsTrigger(prev => !prev);
    };

    function handleEditClick() {
        setEditing(true);
    }



    //NOTE: By adding in the onUpdate, it will toggle the refreshTrigger state in MovieReviewListCard-- which then will retrigger useEffect that's fetching the comments... 
    async function handleSaveClick() {
        const updatedData = { ...comment, userComment: editedText };
        const response = await updateComment(updatedData);

        if (response === "Success") {
            setEditing(false);
            onUpdate();
        } else {
            console.error("Failed to update comment");
        }
    }

    function handleCancelClick() {
        setEditedText(comment.userComment);
        setEditing(false);
    }

    async function handleDeleteClick() {
        const response = await deleteComment(comment);

        if (response === "Success") {
            onUpdate();
        } else {
            console.error("Failed to delete comment");
        }

    }



    //Reply Functionality...

    //NOTE: this will allow replies to be visible or hidden...
    const toggleReplies = () => {
        setShowReplies(prev => !prev);
    };

    //NOTE: by toggling on Reply Click, user can cancel creating a reply without actually hitting the cancel button
    function handleReplyClick(){
        setShowReplyBox(prev => !prev);
    }

    function handleReplyChange(event){
        setUserReply(event.target.value);
    }

    function handleCancelReply(){
        setUserReply("");
        setShowReplyBox(false);
    }

    async function handleSaveReply(e) {
        e.preventDefault();

        if (!user) {
          alert("You must be logged in to write a reply");
          navigate('/login');
        }

        if (!userReply) {   
            alert("You must write a reply or press cancel");
            return;
        }
          
        const userId = user.id;
        const commentId = comment.id;
    
        const userReplyData = { 
            userReply,
            userId,
            commentId, 
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname   
        }
    
       
        
        try {
        const responseMessage = await submitUserReply(userReplyData); 
    
        if (responseMessage === "Success") {
            handleReplyUpdate();              
        } else {
            setError(responseMessage);
        }
        
        } catch (error) {
            console.error("Unexpected error during user reply submission: ", error);
            setError({error: "An unexpected error occurred. Please try again"});
    
        } finally {
        setUserReply('');
        setShowReplyBox(false); 
        }
    };
  
    


    return (
        <div>
            <Card sx={{ background: "rgba(19, 19, 20, 0.71)" }}>           
                <div className="avatar-username-rating-container">     
                    <AvatarHeader
                        firstname={comment.firstname}
                        lastname={comment.lastname}
                        styling="comment-avatar"
                    />
                    <div className="username-profile-link-comment">{comment.username}</div>
                </div>
                
                <div className="comments-section">
                    {isEditing ? (
                        <TextField
                            label= "Edit Comment"
                            fullWidth
                            multiline
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            sx={{ marginBottom: 2,
                                "& .MuiInputBase-root": {
                                  color: "white", 
                                },
                                "& .MuiInputLabel-root": {
                                  color: "white", 
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "white", 
                                },
                                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#ff8f00", 
                                }, }}
                        />
                    ) : (
                        <Typography variant="body2">
                            {comment.userComment}
                        </Typography>
                    )}
                </div>


                <CardActions>
                    {showReplyButton && <Button size="small" onClick={handleReplyClick}>Reply</Button>}

                    {showUserButtons && (
                        <div>
                            {isEditing ? (
                                <>
                                    <Button size="small" color="primary" onClick={handleSaveClick}>Save</Button>
                                    <Button size="small" color="secondary" onClick={handleCancelClick}>Cancel</Button>
                                </>
                            ) : (
                                <>
                                    <Button size="small" onClick={handleEditClick}>Edit</Button>
                                    <Button size="small" color="error" onClick={handleDeleteClick}>Delete</Button>
                                </>
                            )}
                        </div>
                    )}
                </CardActions>


                <Divider sx={{
                        margin: "15px",
                        backgroundColor: "white", 
                        height: "1px", 
                      }}/>
                <CardActions>
                    <Button size="small" onClick={ toggleReplies }>
                        {showReplies ? "Hide Replies" : "View replies"} ({ userReplies.length })
                    </Button>
                </CardActions>


                {showReplies && userReplies.map(userReply => (
                    <ReplyCard 
                        key={userReply.id} 
                        userReply={userReply} 
                        onUpdate={handleReplyUpdate} 
                        showButtonsTrigger={showButtonsTrigger}
                    />
                ))}


                {showReplyBox && (
                    <CardContent>
                    <TextField
                        label="Write a reply"
                        fullWidth
                        multiline
                        value={userReply}
                        onChange={handleReplyChange}
                        sx={{ marginBottom: 2,
                            "& .MuiInputBase-root": {
                                color: "white", 
                            },
                            "& .MuiInputLabel-root": {
                                color: "white", 
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "white", 
                            },
                            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#ff8f00", 
                            }, }}
                    />            
                    <Button size="small" onClick={handleSaveReply}>Save</Button>
                    <Button size="small" onClick={handleCancelReply} >Cancel </Button>
                    </CardContent>
                )}
            </Card>
        </div>    
    );
};

export default CommentCard;

CommentCard.propTypes = {
  comment: PropTypes.object,
  onUpdate: PropTypes.func,
  showButtonTrigger: PropTypes.bool
}