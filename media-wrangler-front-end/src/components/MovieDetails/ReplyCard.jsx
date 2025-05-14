import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, CardActions, TextField, CardContent, Divider } from '@mui/material';
import AvatarHeader from '../Profile/AvatarHeader';
import { useAuth } from '../../Services/AuthContext';
import { updateReply } from '../../Services/ReplyService';
import PropTypes from 'prop-types';

const ReplyCard = ({ userReply, onUpdate, showButtonTrigger }) => {

    const [isEditing, setEditing] = useState(false);
    const [editedText, setEditedText] = useState(userReply.userReply);
    const [showUserButtons, setShowUserButtons] = useState(false);

    const { user } = useAuth();
    

    useEffect(() => {
        if (user.id === userReply.userId) {
            setShowUserButtons(true);
        } 
    }, [user, userReply, showButtonTrigger]);


    function handleEditClick() {
        setEditing(true);
    }



    //NOTE: By adding in the onUpdate, it will toggle the refreshTrigger state in MovieReviewListCard-- which then will retrigger useEffect that's fetching the comments... 
    async function handleSaveClick() {
        const updatedData = { ...userReply, userReply: editedText };
        const response = await updateReply(updatedData);

        if (response === "Success") {
            setEditing(false);
            onUpdate();
        } else {
            console.error("Failed to update comment");
        }
    }

    function handleCancelClick() {
        setEditing(false);
    }

    async function handleDeleteClick() {
        console.log("User clicked Delete");

    }




  return (
   
      <div>
            <Card sx={{ background: "rgba(10, 10, 236, 0.31)" }}>           
                <div className="avatar-username-rating-container">     
                    <AvatarHeader
                        firstname={userReply.firstname}
                        lastname={userReply.lastname}
                        styling="comment-avatar"
                    />
                    <div className="username-profile-link-comment">{userReply.username}</div>
                </div>
                
                <div className="comments-section">
                    {isEditing ? (
                        <TextField
                            label= "Edit Reply"
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
                            {userReply.userReply}
                        </Typography>
                    )}
                </div>
                <CardActions>
                    

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
                </Card>
    </div>
    
    
  )
}

export default ReplyCard

ReplyCard.propTypes = {
  userReply: PropTypes.object,
  onUpdate: PropTypes.func,
  showButtonTrigger: PropTypes.bool
}
