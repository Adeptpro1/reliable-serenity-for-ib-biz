import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FiTrash2, FiPlus, FiPlay } from "react-icons/fi";
import { useQuery, useMutation } from "@apollo/client";
import { GET_BUSINESS_VIDEOS_BY_BUSINESS } from "../../api/queries/business/videos";
import { UPLOAD_BUSINESS_VIDEO, DELETE_BUSINESS_VIDEO } from "../../api/mutations/business/videos";
import { UPLOAD_VIDEO } from "../../api/mutations/common";
import Modal from "../otherComponents/Modal";
import Link from "next/link";
import { toast } from "react-hot-toast";

const VideosForProfile = ({ userData }) => {
  const { user } = useAuth();
  const userBusinesses = user?.businesses || [];
  
  const [showCreateVideoModal, setShowCreateVideoModal] = useState(false);
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Set default business
  useEffect(() => {
    if (userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(userBusinesses[0].id);
    }
  }, [userBusinesses, selectedBusinessId]);

  // Query videos
  const { data, loading, refetch } = useQuery(GET_BUSINESS_VIDEOS_BY_BUSINESS, {
    variables: { businessId: selectedBusinessId },
    skip: !selectedBusinessId,
    fetchPolicy: "network-only"
  });

  const videos = data?.businessVideosByBusiness || [];

  // Mutations
  const [uploadVideoFile] = useMutation(UPLOAD_VIDEO);
  const [createBusinessVideo] = useMutation(UPLOAD_BUSINESS_VIDEO);
  const [deleteVideoMutation] = useMutation(DELETE_BUSINESS_VIDEO);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideoMutation({ variables: { id } });
        toast.success("Video deleted successfully");
        refetch();
      } catch (err) {
        if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
          toast.error("Network Error: Please check your connection");
        } else {
          toast.error(err.message || "Failed to delete video");
        }
      }
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setShowVideoPlayerModal(true);
  };

  const handleCreateVideo = async () => {
    if (!selectedBusinessId || !videoFile) {
      toast.error("Please select a business and upload a video");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload file
      const { data: uploadData } = await uploadVideoFile({
        variables: { file: videoFile }
      });
      
      const videoUrl = uploadData.uploadVideo;

      // 2. Create business video record
      await createBusinessVideo({
        variables: {
          input: {
            businessId: selectedBusinessId,
            videoUrl,
            duration: 60 // Default or extract from file if possible
          }
        }
      });

      toast.success("Video uploaded successfully");
      setShowCreateVideoModal(false);
      setVideoFile(null);
      refetch();
    } catch (err) {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message || "Failed to upload video");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      {/* Header with action buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: '#333'
        }}>
          Your Videos
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {userBusinesses.length > 0 && (
            <button
              onClick={() => setShowCreateVideoModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: 'linear-gradient(to right, purple, #D22730)',
                background: 'linear-gradient(to right, purple, #D22730)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <FiPlus size={16} />
              Add Video
            </button>
          )}
        </div>
      </div>
      
      {userBusinesses.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏢</div>
          <p style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 600 }}>No businesses found</p>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            You need to register a business before you can upload showroom videos.
          </p>
         <Link href={`/dashboard/${userData?.id}`}><button
            style={{
              padding: '10px 20px',
              backgroundColor: 'linear-gradient(to right, purple, #D22730)',
              background: 'linear-gradient(to right, purple, #D22730)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Register Business
          </button></Link>
        </div>
      ) : videos?.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {videos?.map((video) => (
            <div 
              key={video.id} 
              style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              className="hover:shadow-lg hover:scale-105"
              onClick={() => handleVideoClick(video)}
            >
              {/* Video Thumbnail */}
              <div style={{ 
                position: 'relative',
                width: '100%',
                height: '150px'
              }}>
                <img
                  src={video.videoUrl} // Use videoUrl as thumbnail fallback or handle thumbnails
                  alt={video.business?.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                
                {/* Play button overlay */}
                <div style={{
                  position: 'absolute',
                  inset: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  opacity: '0',
                  transition: 'opacity 0.2s ease'
                }}
                className="hover:opacity-100"
                >
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    padding: '8px'
                  }}>
                    <FiPlay style={{ color: '#2563eb' }} size={16} />
                  </div>
                </div>
                
                {/* Duration badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: 'white',
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {video.duration}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(video.id);
                  }}
                  style={{ 
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '6px',
                    background: 'rgba(220, 38, 38, 0.9)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    opacity: '0',
                    transition: 'opacity 0.3s ease',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => e.target.style.opacity = '0'}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              {/* Video Info */}
              <div style={{ padding: '12px' }}>
                <h3 style={{ 
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.3'
                }}>
                  {video.business?.name || "Untitled Video"}
                </h3>
                
                <p style={{ 
                  fontSize: '12px',
                  color: '#6b7280',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {video.business?.name}
                </p>
                
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#4b5563'
                }}>
                  <FiPlay style={{ 
                    color: '#2563eb', 
                    marginRight: '4px' 
                  }} 
                  size={12} 
                  />
                  <span>{video.views || 0} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#666'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            No videos uploaded yet.
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Upload your first video to showcase your business!
          </p>
        </div>
      )}

      {/* Create Video Modal */}
      {showCreateVideoModal && (
        <Modal title="Upload New Video" onClose={() => setShowCreateVideoModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Select Business
              </label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Choose a business</option>
                {userBusinesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name} - {business.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Video Title
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter video title"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Upload Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowCreateVideoModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVideo}
                disabled={isUploading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isUploading ? '#ccc' : 'linear-gradient(to right, purple, #D22730)',
                  background: isUploading ? '#ccc' : 'linear-gradient(to right, purple, #D22730)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Video Player Modal */}
      {showVideoPlayerModal && selectedVideo && (
        <Modal title={selectedVideo.business?.name || "Video"} onClose={() => setShowVideoPlayerModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Video Player */}
            <div style={{
              width: '100%',
              maxWidth: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#000'
            }}>
              <video
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>

            {/* Video Info */}
            <div style={{ padding: '16px 0' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {selectedVideo.business?.name || "Untitled Video"}
              </h3>
              
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                {selectedVideo.business?.name}
              </p>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '14px',
                color: '#4b5563'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FiPlay style={{ color: '#2563eb', marginRight: '4px' }} size={14} />
                  <span>{selectedVideo.views || 0} views</span>
                </div>
                <span>Duration: {selectedVideo.duration}</span>
                {selectedVideo.boosted && (
                  <span style={{
                    backgroundColor: '#fbbf24',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Boosted
                  </span>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VideosForProfile;
