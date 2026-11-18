import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { tipsApi } from '../../services/api';
import { EmptyState, LoadingState } from '../ui/EmptyState';

function extractVideoId(url) {
  if (!url) return '';
  
  if (url.includes('youtube.com/watch')) {
    try {
      const urlParams = new URL(url).searchParams;
      return urlParams.get('v') || '';
    } catch {
      return '';
    }
  } else if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (url.includes('youtube.com/embed/')) {
    return url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  }
  return '';
}

function TipCard({ tip, language, getLocalized, onPlay, index }) {
  const title = getLocalized(tip, 'title');
  const videoId = extractVideoId(tip.videoUrl);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';

  if (!videoId) return null;

  return (
    <motion.div 
      className="tip-card" 
      onClick={() => onPlay(videoId)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
    >
      <div className="tip-thumbnail">
        <img src={thumbnailUrl} alt={title} loading="lazy" />
        <motion.div 
          className="tip-play-icon"
          whileHover={{ scale: 1.2 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
      </div>
      <h4 className="tip-title">{title}</h4>
    </motion.div>
  );
}

export function VideoTips() {
  const { t, language, getLocalized } = useLanguage();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  useEffect(() => {
    const loadTips = async () => {
      setLoading(true);
      try {
        const data = await tipsApi.getAll();
        setTips(data || []);
        setError(false);
      } catch (err) {
        setError(true);
        setTips([]);
      } finally {
        setLoading(false);
      }
    };
    loadTips();
  }, []);

  const handlePlay = (videoId) => {
    setPlayingVideoId(videoId);
  };

  const closeModal = () => {
    setPlayingVideoId(null);
  };

  const validTips = tips.filter(tip => extractVideoId(tip.videoUrl));

  return (
    <section className="video-tips animated" id="tips">
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('tips.title') || "Foydali videolar"}
        </motion.h2>
        
        {loading ? (
          <LoadingState message="Videolar yuklanmoqda..." />
        ) : error || validTips.length === 0 ? (
          <EmptyState message="Foydali videolar yo'q" icon="🎬" />
        ) : (
          <motion.div 
            className="tips-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {validTips.map((tip, index) => (
              <TipCard
                key={tip.id}
                tip={tip}
                index={index}
                language={language}
                getLocalized={getLocalized}
                onPlay={handlePlay}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {playingVideoId && (
          <motion.div 
            className="video-modal" 
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="video-modal-content" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <button className="video-modal-close" onClick={closeModal}>×</button>
              <iframe
                src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default VideoTips;
