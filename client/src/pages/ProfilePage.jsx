import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import PostList from '../components/posts/PostList';
import FollowButton from '../components/common/FollowButton';

const PLATFORM_ICONS = { PC: '🖥', PlayStation: '🎮', Xbox: '🟢', Switch: '🔴' };

const ProfilePage = () => {
  const { username } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]       = useState(null);
  const [posts, setPosts]           = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [tab, setTab]               = useState('posts'); // 'posts' | 'saved'
  const [loading, setLoading]       = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeModal, setActiveModal]   = useState(null); // 'followers' | 'following' | null

  const isOwnProfile = me?.username === username;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/users/${username}`);
        setProfile(data);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
    setTab('posts');
    setActiveModal(null);
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    if (tab === 'posts') {
      setPostsLoading(true);
      axiosInstance.get(`/users/${username}/posts`)
        .then(({ data }) => setPosts(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setPostsLoading(false));
    } else if (tab === 'saved' && isOwnProfile) {
      setPostsLoading(true);
      axiosInstance.get('/users/me/saved')
        .then(({ data }) => setSavedPosts(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setPostsLoading(false));
    }
  }, [tab, profile]);

  const handleFollowToggle = ({ followers }) => {
    setProfile(prev => prev ? { ...prev, followers } : prev);
  };

  const handleDelete = id => {
    setPosts(prev => prev.filter(p => p._id !== id));
    setSavedPosts(prev => prev.filter(p => p._id !== id));
  };

  const handleUserClick = (targetUsername) => {
    setActiveModal(null);
    navigate(`/u/${targetUsername}`);
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!profile) return null;

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long'
  });

  const followersList = profile.followers || [];
  const followingList = profile.following || [];

  return (
    <main className="page">
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* Profile Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div className="post-avatar" style={{ width: 64, height: 64, fontSize: '1.5rem', flexShrink: 0 }}>
              {profile.username[0].toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile.username}</h1>
                <FollowButton
                  username={profile.username}
                  initialFollowing={profile.isFollowing}
                  onToggle={handleFollowToggle}
                />
              </div>

              <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                Joined {joinedDate}
              </p>

              {profile.bio && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span className="post-stat" style={{ userSelect: 'none' }}>
                  📝 {profile.postCount ?? 0} Posts
                </span>
                
                <span 
                  className="post-stat" 
                  onClick={() => setActiveModal('followers')} 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  title="View followers"
                >
                  👥 {followersList.length} Followers
                </span>

                <span 
                  className="post-stat" 
                  onClick={() => setActiveModal('following')} 
                  style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  title="View following list"
                >
                  ➡️ {followingList.length} Following
                </span>
              </div>

              {/* Platforms */}
              {profile.preferredPlatforms?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {profile.preferredPlatforms.map(p => (
                    <span key={p} className="tag">
                      {PLATFORM_ICONS[p] ?? ''} {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sort-tabs" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
          <button
            className={`sort-tab ${tab === 'posts' ? 'active' : ''}`}
            onClick={() => setTab('posts')}
          >
            📝 Posts
          </button>
          {isOwnProfile && (
            <button
              className={`sort-tab ${tab === 'saved' ? 'active' : ''}`}
              onClick={() => setTab('saved')}
            >
              🔖 Saved
            </button>
          )}
        </div>

        {postsLoading ? (
          <div className="spinner" />
        ) : (
          <PostList
            posts={tab === 'saved' ? savedPosts : posts}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Follower / Following List Modal */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 className="modal-title" style={{ margin: 0, textTransform: 'capitalize' }}>
                {activeModal}
              </h2>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  fontSize: '1.1rem' 
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {((activeModal === 'followers' ? followersList : followingList)).length === 0 ? (
                <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
                  No users to show.
                </p>
              ) : (
                ((activeModal === 'followers' ? followersList : followingList)).map(u => (
                  <div 
                    key={u._id} 
                    onClick={() => handleUserClick(u.username)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      padding: '0.65rem 0.5rem', 
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="post-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      {u.username}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
